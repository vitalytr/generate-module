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

    static async getAll(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        const data = await ${moduleName}.getAll();
        ctx.body = response(ctx.method, ctx.lang.code, data.info, data.optional);
    }
    
    static async getMany(ctx) {
        const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
        const data = await ${moduleName}.getMany();
        ctx.body = response(ctx.method, ctx.lang.code, data);
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

    async getAll() {
        let sqlQuery = qFile(qPath(sqlDirPath, 'getAll')).query;
        const countQuery = qFile(qPath(sqlDirPath, 'getTotalCount')).query;
        const data = { info: null, optional: { limit: this.qs.limit || 50, offset: this.qs.offset || 0 } };

        sqlQuery += additionalQuery(this.qs);

        await sql.task(async (task) => {
            const total = await task.oneOrNone(countQuery,
                { ...this.user, ...this.params, ...this.qs });
            data.optional.total = total.count;
            data.info = await task.any(sqlQuery,
                { ...this.user, ...this.params, ...this.qs });
        });

        return data;
    }

    async getMany() {
        return sql.any(qFile(qPath(sqlDirPath, 'getMany')),
            { ...this.user, ...this.params, ...this.qs });
    }

    async getOne() {
        return sql.oneOrNone(qFile(qPath(sqlDirPath, 'getOne')),
            { ...this.user, ...this.params, ...this.qs});
    }

    async post() {
        return sql.oneOrNone(qFile(qPath(sqlDirPath, 'post')),
            { ...this.user, ...this.params, ...this.qs, ...this.body });
    }

    async put() {
        return sql.oneOrNone(qFile(qPath(sqlDirPath, 'put')),
            { ...this.user, ...this.params, ...this.qs, ...this.body });
    }

    async delete() {
        return sql.none(qFile(qPath(sqlDirPath, 'delete')),
            { ...this.user, ...this.params, ...this.qs});
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
    prefix: '/${main[main.length - 1]}',
});

router.get('/${moduleName}', ${name}.getAll);
router.get('/:ee_id/${moduleName}/', ${name}.getMany);
router.post('/:ee_id/${moduleName}/', ${name}.post);
router.get('/:ee_id/${moduleName}/:id', ${name}.getOne);
router.put('/:ee_id/${moduleName}/:id', ${name}.put);
router.del('/:ee_id/${moduleName}/:id', ${name}.delete);

export default router;
`;
};

module.exports = data;
