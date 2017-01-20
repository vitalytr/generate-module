'use strict';

const os = require('os');

const toUpper = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const data = {};

data.controller = (moduleName) => {
    const name = toUpper(moduleName);
    return `import Model from './model';
import response from './../../../shared/response';

export default class ${name}Ctrl {

    static async getMany(ctx) {
        const ${moduleName} = new Model(ctx.state.user);
        const data = await ${moduleName}.getMany(ctx.params, ctx.query);
        ctx.body = response(ctx.method, data.info, data.optional);
    }
    static async getOne(ctx) {
        const ${moduleName} = new Model(ctx.state.user);
        const data = await ${moduleName}.getOne(ctx.query, ctx.params);
        ctx.body = response(ctx.method, data);
    }
    static async post(ctx) {
        const ${moduleName} = new Model(ctx.state.user);
        const data = await ${moduleName}.post(ctx.query, ctx.params, ctx.request.body);
        ctx.body = response(ctx.method, data);
    }
    static async put(ctx) {
        const ${moduleName} = new Model(ctx.state.user);
        const data = await ${moduleName}.put(ctx.query, ctx.params, ctx.request.body);
        ctx.body = response(ctx.method, data);
    }
    static async delete(ctx) {
        const ${moduleName} = new Model(ctx.state.user);
        await ${moduleName}.delete(ctx.query, ctx.params);
        ctx.body = response(ctx.method);
    }
}
`
};

data.model = (moduleName) => {
    const name = toUpper(moduleName);
    return `import path from 'path';
import { sql, qFile, qPath, additionalQuery } from './../../../shared/database';

const sqlDirPath = path.join(__dirname, './sql');

export default class ${name}Ctrl {
    constructor(user) {
        this.user = user;
    }
    async getMany(params, qs) {
        let sqlQuery = qFile(qPath(sqlDirPath, 'getMany')).query;
        const countQuery = qFile(qPath(sqlDirPath, 'getTotalCount')).query;
        const data = { info: null, optional: { limit: qs.limit || 50, offset: qs.offset || 0 } };
        sqlQuery += additionalQuery(qs);
        await sql.task(async (task) => {
            const total = await task.one(countQuery);
            data.optional.total = total.count;
            data.info = await task.any(sqlQuery);
        });
        return data;
    }
    async getOne(qs, params) {
        const sqlQuery = qFile(qPath(sqlDirPath, 'getOne')).query;
        return sql.one(sqlQuery, params);
    }
    async post(qs, params, body) {
        const sqlQuery = qFile(qPath(sqlDirPath, 'post')).query;
        return sql.one(sqlQuery, { ...params, ...body });
    }
    async put(qs, params, body) {
        const sqlQuery = qFile(qPath(sqlDirPath, 'put')).query;
        return sql.one(sqlQuery, { ...params, ...body });
    }
    async delete(qs, params) {
        const sqlQuery = qFile(qPath(sqlDirPath, 'delete')).query;
        return sql.none(sqlQuery, params);
    }
}
`
};

data.routes = (moduleName) => {
    const name = toUpper(moduleName);
    const main = os.platform() === 'win32' ? process.cwd().split('\\') : process.cwd().split('/');
    return `import Router from 'koa-router';
import ${name} from './controller';

const router = new Router({
    prefix: '/${main[main.length - 1]}/${moduleName}',
});

router.get('/', ${name}.getMany);
router.post('/', ${name}.post);
router.get('/:id', ${name}.getOne);
router.put('/:id', ${name}.put);
router.del('/:id', ${name}.delete);

export default router;
`;
};



module.exports = data;