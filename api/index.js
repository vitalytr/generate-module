'use strict';

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
        ctx.body = response(ctx.method, ctx.lang.code, data.info, data.optional);
    }

    static async getOne(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        const data = await ${moduleName}.getOne();
        ctx.body = response(ctx.method, ctx.lang.code, data);
    }

    static async post(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
        const data = await ${moduleName}.post();
        ctx.body = response(ctx.method, ctx.lang.code, data);
    }

    static async put(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
        const data = await ${moduleName}.put();
        ctx.body = response(ctx.method, ctx.lang.code, data);
    }

    static async delete(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        await ${moduleName}.delete();
        ctx.body = response(ctx.method, ctx.lang.code);
    }

}
`
};

data.model = (moduleName) => {
    const name = toUpper(moduleName);

    return `import path from 'path';
import { sql, qFile, qPath, additionalQuery } from './../../../shared/database';

const sqlDirPath = path.join(__dirname, './sql');

export default class ${name} {

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
            const total = await task.one(countQuery, { ...this.user, ...this.qs });
            data.optional.total = total.count;
            data.info = await task.any(sqlQuery, { ...this.user, ...this.qs });
        });

        return data;
    }

    async getOne() {
        return sql.one(qFile(qPath(sqlDirPath, 'getOne')), this.params);
    }

    async post() {
        return sql.one(qFile(qPath(sqlDirPath, 'post')), { ...this.params, ...this.body });
    }

    async put() {
        return sql.one(qFile(qPath(sqlDirPath, 'put')), { ...this.params, ...this.body });
    }

    async delete() {
        return sql.none(qFile(qPath(sqlDirPath, 'delete')), this.params);
    }

}
`
};

data.routes = (moduleName) => {
    const name = toUpper(moduleName);
    const main = (process.platform === 'win32') ? process.cwd().split('\\') : process.cwd().split('/');

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
