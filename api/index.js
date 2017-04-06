'use strict';

const toUpper = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const data = {};

data.controller = (moduleName) => {
    const name = toUpper(moduleName);

    return `import Model from './model';
import response from './../../../shared/response';

const getMany = async (ctx, next) => {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    ctx.state.data = await ${moduleName}.getMany();
    await next();
}

const getOne = async (ctx, next) => {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    ctx.state.data = await ${moduleName}.getOne();
    await next();
}

const post = async (ctx, next) => {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
    ctx.state.data = await ${moduleName}.post();
    await next();
}

const put = async (ctx, next) => {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query, ctx.request.body);
    ctx.state.data = await ${moduleName}.put();
    await next();
}

const del = async (ctx, next) => {
    const ${moduleName} = new Model(ctx.state.user, ctx.params, ctx.query);
    await ${moduleName}.delete();
    await next();
}

export default {
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

    async getMany() {
        this.qs.page = !isNaN(this.qs.page) && Number(this.qs.page) > 0 ? Number(this.qs.page) : 1;
        this.qs.limit =
            this.qs.limit === 'all' || (!isNaN(this.qs.limit) && Number(this.qs.limit) > 0) ? this.qs.limit : 50;
        let sqlQuery = qFile(qPath(sqlDirPath, 'getMany')).query;
        const countQuery = qFile(qPath(sqlDirPath, 'getTotalCount')).query;
        const data = { optional: { limit: this.qs.limit, page: this.qs.page } };

        sqlQuery += additionalQuery(this.qs);

        await sql.task(async (task) => {
            const total = await task.oneOrNone(countQuery,
                { ...this.qs, ...this.user, ...this.params });
            const results = await task.any(sqlQuery,
                { ...this.qs, ...this.user, ...this.params });
            data.optional.totalPages = this.qs.limit === 'all' ? 1 : Math.ceil(total.count / this.qs.limit);
            data.info = (this.qs.q) ? search(results, this.qs.q) : results;
        });

        return data;
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
// import hasAccess from './../../../middlewares/hasAccessHandler';

const router = new Router({
    prefix: '/${main[main.length - 1]}/${moduleName}',
});

router.get('/', ${name}.getMany);
router.post('/', ${name}.post);
router.get('/:id', ${name}.getOne);
router.put('/:id', ${name}.put);
router.del('/:id', ${name}.del);

export default router;
`;
};

module.exports = data;
