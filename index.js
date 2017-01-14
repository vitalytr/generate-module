#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const pkg = require('./package.json');
const apiFileData = require('./apiFileData');

Promise.promisifyAll(fs);

const createModule = (moduleName) => {
    const structureJS = ['controller.js', 'model.js', 'routes.js'];
    const structureSQL = ['getMany.sql', 'getTotalCount.sql', 'getOne.sql', 'put.sql', 'post.sql', 'delete.sql'];

    let arrOfModules = moduleName.split(',').map(item => {
        return {
            path: path.join(process.cwd(), item),
            name: item
        };
    });
    let tempPathSQL = '';
    for (let i = 0; i < arrOfModules.length; i += 1) {

        tempPathSQL = path.join(arrOfModules[i].path, 'sql');

        fs.mkdirAsync(arrOfModules[i].path)
            .then(() => {
                const filesJS = [];
                structureJS.forEach(item => {
                    filesJS.push(fs.writeFileAsync(path.join(arrOfModules[i].path, item),
                        apiFileData[item.slice(0, -3)](arrOfModules[i].name)));
                });
                return Promise.all(filesJS);
            })
            .then(() => fs.mkdirAsync(tempPathSQL))
            .then(() => {
                const filesSQL = [];
                structureSQL.forEach(item => {
                    const fPath = path.join(tempPathSQL, item);
                    filesSQL.push(fs.writeFileAsync(fPath, ' '));
                });
                return Promise.all(filesSQL);
            });
    }
};

program
    .version(pkg.version)
    .command('api <moduleName>')
    .description('Create new module for the application. Example: api module1,module2,module3')
    .action(createModule);

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();