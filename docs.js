'use strict';

const amp = '`';

const toUpper = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const docs = (moduleName) => {
    const name = toUpper(moduleName);
    const main = (process.platform === 'win32') ? process.cwd().split('\\') : process.cwd().split('/');

    return `## ${name} [/${main[main.length - 1]}/${moduleName}/{?limit,offset,orderby,sort}]
<!--- ****************************************************************************************************** -->

### Get Many [GET]
Get a list of ${moduleName}

+ Parameters
    + limit: ${amp}2${amp} (number, optional) - How many objects to receive
        + Default: ${amp}50${amp}
    + offset: 0 (number, optional) - From which object to start counting
        + Default: ${amp}0${amp}
    + orderby: ${amp}${moduleName}_id${amp} (string, optional) - By which column to order
        + Default: ${amp}null${amp}
    + sort: ${amp}asc${amp} (enum[string], optional) - Type of sorting (only if **orderby** provided)
        + Default: ${amp}asc${amp}
        + Members
            + ${amp}asc${amp}
            + ${amp}desc${amp}

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
              "data": [ ... ],
              "limit": "50",
              "offset": 0,
              "total": "0"
            }

<!--- ****************************************************************************************************** -->

### Add [POST]
Create a new ${moduleName}

+ Request Body

    + Body

            {
                YOUR DATA
            }

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
              "data": { YOUR DATA }
            }

<!--- ****************************************************************************************************** -->

## ${moduleName} [/${main[main.length - 1]}/${moduleName}/{${moduleName}_id}]
${moduleName} description

+ Parameters

    + ${moduleName}_id: ${amp}1${amp} (required, number) - The ${moduleName} ID

<!--- ****************************************************************************************************** -->

### Get One [GET]
Get a single ${moduleName}.

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
              "data": { YOUR DATA }
            }

<!--- ****************************************************************************************************** -->

### Update [PUT]
Update a single ${moduleName}

+ Request Body

    + Body

            {
                YOUR DATA
            }

+ Request Headers

    + Headers

            Content-Type: application/json
            Authorization: eyJeXMiJ9.I6MSwiZGY.fdhiASDAF
            Language: en

+ Response 200

    + Body

            {
              "status": 200,
              "message": "Data was successfully updated",
              "data": { YOUR DATA }
            }

<!--- ****************************************************************************************************** -->

### Delete [DELETE]
Delete a single ${moduleName}

+ Request Headers

    + Headers

            Content-Type: application/json
            Authorization: eyJeXMiJ9.I6MSwiZGY.fdhiASDAF
            Language: en

+ Response 200

    + Body

            {
                "status": 200,
                "message": "Data was successfully deleted",
                "data": null
            }`;
};


module.exports = docs;