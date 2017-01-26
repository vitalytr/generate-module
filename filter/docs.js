'use strict';

const amp = '`';

const toUpper = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const docs = (moduleName) => {
    const name = toUpper(moduleName);
    const main = (process.platform === 'win32') ? process.cwd().split('\\') : process.cwd().split('/');

    return `## ${name} [/${main[main.length - 1]}/${moduleName}{?sort}]

### Get Many [GET]
Get a list of ${moduleName}

+ Parameters
    + sort: ${amp}${moduleName}_id${amp} (enum[string], optional) - Which field to sort by
        + Default: ${amp}null${amp}
        + Members
            + ${amp}${moduleName}_id${amp}
            + ${amp}-${moduleName}_id${amp}

+ Request Headers

    + Headers

            Content-Type: application/json
            Authorization: eyJeXMiJ9.I6MSwiZGY.fdhiASDAF
            Language: en

+ Response 200

    + Body

            {
              "status": 200,
              "message": "Data was successfully retrieved",
              "data": [ ... ]
            }`;
};

module.exports = docs;