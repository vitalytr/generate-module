'use strict';

const toUpper = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const data = {};

data.controller = (moduleName) => {
    const name = toUpper(moduleName);

    return `import Model from './model';

const getAll = async (ctx, next) {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    ctx.state.data = ${moduleName}.getAll();
    await next();
};

const getMany = async (ctx, next) {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    ctx.state.data = ${moduleName}.getMany();
    await next();
};

const getOne = async (ctx, next) {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    ctx.state.data = ${moduleName}.getOne();
    await next();
};

const post = async (ctx, next) {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
    ctx.state.data = ${moduleName}.post();
    await next();
};

const put = async (ctx, next) {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
    ctx.state.data = ${moduleName}.put();
    await next();
};

const del = async (ctx, next) {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    await ${moduleName}.delete();
    await next();
};

export default {
    getAll,
    getMany,
    getOne,
    post,
    put,
    del,
};
`
};

data.model = (moduleName) => {
    const name = toUpper(moduleName);

    return `import path from 'path';
import { sql, qFile, qPath, additionalQuery, search } from './../../../shared/database';

const sqlDirPath = path.join(__dirname, './sql');

export default class ${name} {

    constructor(user, params, qs, body = {}) {
        this.user = user;
        this.params = params;
        this.qs = qs;
        this.body = body;
    }

    async getAll() {
        this.qs.page = !isNaN(this.qs.page) && Number(this.qs.page) > 0 ? Number(this.qs.page) : 1;
        this.qs.limit =
            this.qs.limit === 'all' || (!isNaN(this.qs.limit) && Number(this.qs.limit) > 0) ? this.qs.limit : 50;
        let sqlQuery = qFile(qPath(sqlDirPath, 'getAll')).query;
        const countQuery = qFile(qPath(sqlDirPath, 'getTotalCount')).query;
        const data = { optional: { limit: this.qs.limit, page: this.qs.page } };

        sqlQuery += await additionalQuery(this.qs);

        await sql.task(async (task) => {
            const total = await task.oneOrNone(countQuery,
                { ...this.qs, ...this.user, ...this.params });
            const results = await task.any(sqlQuery,
                { ...this.qs, ...this.user, ...this.params });
            data.optional.totalPages = this.qs.limit === 'all' ? 1 : Math.ceil(total.count / this.qs.limit);
            data.info = (this.qs.q) ? await search(results, this.qs.q) : results;
        });

        return data;
    }

    async getMany() {
        return sql.any(qFile(qPath(sqlDirPath, 'getMany')),
            { ...this.qs, ...this.user, ...this.params });
    }

    async getOne() {
        return sql.oneOrNone(qFile(qPath(sqlDirPath, 'getOne')),
            { ...this.qs, ...this.user, ...this.params });
    }

    async post() {
        return sql.oneOrNone(qFile(qPath(sqlDirPath, 'post')),
            { ...this.qs, ...this.body, ...this.user, ...this.params });
    }

    async put() {
        return sql.oneOrNone(qFile(qPath(sqlDirPath, 'put')),
            { ...this.qs, ...this.body, ...this.user, ...this.params });
    }

    async delete() {
        return sql.none(qFile(qPath(sqlDirPath, 'delete')),
            { ...this.qs, ...this.user, ...this.params });
    }

}
`
};

data.routes = (moduleName) => {
    const name = toUpper(moduleName);
    const main = (process.platform === 'win32') ? process.cwd().split('\\') : process.cwd().split('/');

    return `import Router from 'koa-router';
import ${name} from './controller';
import hasAccess from './../../../middlewares/hasAccessHandler';

const router = new Router({
    prefix: '/${main[main.length - 1]}',
});

router.get('/${moduleName}', ${name}.getAll);
router.get('/:ee_id/${moduleName}/', hasAccess.toEe, ${name}.getMany);
router.post('/:ee_id/${moduleName}/', hasAccess.toEe, ${name}.post);
router.get('/:ee_id/${moduleName}/:id', hasAccess.toEe, ${name}.getOne);
router.put('/:ee_id/${moduleName}/:id', hasAccess.toEe, ${name}.put);
router.del('/:ee_id/${moduleName}/:id', hasAccess.toEe, ${name}.del);

export default router;
`;
};

module.exports = data;
