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
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        const data = await ${moduleName}.getMany();
        ctx.body = response(ctx.method, data.info, data.optional);
    }
    static async getOne(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        const data = await ${moduleName}.getOne();
        ctx.body = response(ctx.method, data);
    }
    static async post(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
        const data = await ${moduleName}.post();
        ctx.body = response(ctx.method, data);
    }
    static async put(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
        const data = await ${moduleName}.put();
        ctx.body = response(ctx.method, data);
    }
    static async delete(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        await ${moduleName}.delete();
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
    constructor(user, params, qs, body = {}) {
        this.user = user;
        this.params = params;
        this.qs = qs;
        this.body = body;
    }
    async getMany() {
        let sqlQuery = qFile(qPath(sqlDirPath, 'getMany')).query;
        const countQuery = qFile(qPath(sqlDirPath, 'getTotalCount')).query;
        const data = { info: null, optional: { limit: this.qs.limit || 50, offset: this.qs.offset || 0 } };
        sqlQuery += additionalQuery(this.qs);
        await sql.task(async (task) => {
            const total = await task.one(countQuery);
            data.optional.total = total.count;
            data.info = await task.any(sqlQuery);
        });
        return data;
    }
    async getOne() {
        const sqlQuery = qFile(qPath(sqlDirPath, 'getOne')).query;
        return sql.one(sqlQuery, this.params);
    }
    async post() {
        const sqlQuery = qFile(qPath(sqlDirPath, 'post')).query;
        return sql.one(sqlQuery, { ...this.params, ...this.body });
    }
    async put() {
        const sqlQuery = qFile(qPath(sqlDirPath, 'put')).query;
        return sql.one(sqlQuery, { ...this.params, ...this.body });
    }
    async delete() {
        const sqlQuery = qFile(qPath(sqlDirPath, 'delete')).query;
        return sql.none(sqlQuery, this.params);
    }
}
`
};

data.routes = (moduleName) => {
    const name = toUpper(moduleName);
    const main = os.platform() === 'win32' ? process.cwd().split('\\') : process.cwd().split('/');
    return `import Router from 'koa-router';
import ${name} from './controller';
// import hasAccess from './../../../middlewares/hasAccessHandler';

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