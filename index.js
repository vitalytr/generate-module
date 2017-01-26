#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const pkg = require('./package.json');
const api = require('./api/index');
const docsAPI = require('./api/docs');
const filter = require('./filter/index');
const docsFilter = require('./filter/docs');

Promise.promisifyAll(fs);

const createModule = (moduleName) => {
    const structureJS = ['controller.js', 'model.js', 'routes.js'];
    const structureSQL = ['getMany.sql', 'getTotalCount.sql', 'getOne.sql', 'put.sql', 'post.sql', 'delete.sql'];
    const arrOfModules = moduleName.split(',').map(item => ({ path: path.join(process.cwd(), item), name: item }));

    let tempPathSQL = '';

    arrOfModules.forEach(module => {
        tempPathSQL = path.join(module.path, 'sql');

        fs.mkdirAsync(module.path)
            .then(() => Promise.all(structureJS.map(file => fs.writeFileAsync(path.join(module.path, file),
                    api[file.slice(0, -3)](module.name)))))
            .then(() => fs.mkdirAsync(tempPathSQL))
            .then(() => Promise.all(structureSQL.map(file => fs.writeFileAsync(path.join(tempPathSQL, file), ' '))))
            .then(() => fs.writeFileAsync(path.join(module.path, `${module.name}.apib`), docsAPI(module.name)));
    });
};

const createFilter = (filterName) => {
    const structureJS = ['controller.js', 'model.js', 'routes.js'];
    const structureSQL = ['getMany.sql'];
    const arrOfModules = filterName.split(',').map(item => ({ path: path.join(process.cwd(), item), name: item }));

    let tempPathSQL = '';

    arrOfModules.forEach(module => {
        tempPathSQL = path.join(module.path, 'sql');

        fs.mkdirAsync(module.path)
            .then(() => Promise.all(structureJS.map(file => fs.writeFileAsync(path.join(module.path, file),
                    filter[file.slice(0, -3)](module.name)))))
            .then(() => fs.mkdirAsync(tempPathSQL))
            .then(() => Promise.all(structureSQL.map(file => fs.writeFileAsync(path.join(tempPathSQL, file), ' '))))
            .then(() => fs.writeFileAsync(path.join(module.path, `${module.name}.apib`), docsFilter(module.name)));
    });
};

program
    .version(pkg.version)
    .command('api <moduleName>')
    .description('Create new module for the application. Example: api module1,module2,module3')
    .action(createModule);

program
    .version(pkg.version)
    .command('filter <filterName>')
    .description('Create new module for the application. Example: api module1,module2,module3')
    .action(createFilter);

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();
