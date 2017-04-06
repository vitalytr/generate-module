'use strict';

const toUpper = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const data = {};

data.controller = (moduleName) => {
    const name = toUpper(moduleName);

    return `import Model from './model';

const getMany = async (ctx, next) => {
        const ${moduleName} = new Model(ctx.state.user, ctx.query);
        ctx.state.data = await ${moduleName}.getMany();
        await next();
};

export default {
    getMany,
};
`
};

data.model = (moduleName) => {
    const name = toUpper(moduleName);

    return `import path from 'path';
import { sql, qFile, qPath } from './../../../shared/database';

const sqlDirPath = path.join(__dirname, './sql');

export default class ${name} {

    constructor(user, qs) {
        this.user = user;
        this.qs = qs;
    }

    async getMany() {
        return sql.any(qFile(qPath(sqlDirPath, 'getMany')), { ...this.qs, ...this.user });
    }

}
`
};

data.routes = (moduleName) => {
    const name = toUpper(moduleName);
    const main = (process.platform === 'win32') ? process.cwd().split('\\') : process.cwd().split('/');

    return `import Router from 'koa-router';
import ${name} from './controller';

const router = new Router({
    prefix: '/${main[main.length - 1]}/${moduleName}',
});

router.get('/', ${name}.getMany);

export default router;
`;
};

module.exports = data;
