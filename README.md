[![wercker status](https://app.wercker.com/status/4512ccded9fda6ba38b506b92a9619c3/s/master "wercker status")](https://app.wercker.com/project/bykey/4512ccded9fda6ba38b506b92a9619c3)


# Modli - MySQL Adapter

This module provides adapter for the [MySQL](https://www.mysql.com/)
datasource for integration with [Modli]().

## Installation

```
npm install modli-mysql --save
```

## Config and Usage

When defining a property which will utilize the adapter it is required that a
`tableName` be supplied:

```javascript
import { model, adapter, Joi, use } from 'modli';
import { mysql } from 'modli-mysql';

model.add({
  name: 'foo',
  version: 1,
  tableName: 'tblFoo'
  schema: {
    id: Joi.number().integer(),
    fname: Joi.string().min(3).max(30),
    lname: Joi.string().min(3).max(30),
    email: Joi.string().email().min(3).max(254).required()
  }
});
```

Then add the adapter as per usual with the following config object structure:

```javascript
adapter.add({
  name: 'mysqlFoo',
  source: mysql
  config: {
    host: {HOST_IP},
    username: {USERNAME},
    password: {PASSWORD},
    database: {DATABASE}
  }
});
```

You can then use the adapter with a model via:

```javascript
// Use(MODEL, ADAPTER)
const mysqlTest = use('foo', 'mysqlFoo');
```

## Methods

The following methods exist natively on the MySQL adapter:

### `config`

Runs the configuration and connects to the datasource.

### `query`

Allows for passing standard MySQL queries:

```javascript
mysqlTest.query('SELECT * FROM tblFoo')
  .then(/*...*/)
  .catch(/*...*/);
```

### `createTable`

Creates (`IF NOT EXISTS`) a table based on params:

```javascript
mysqlTest.createTable({
    'id': [ 'INT', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
    'fname': [ 'VARCHAR(255)' ],
    'lname': [ 'VARCHAR(255)' ],
    'email': [ 'VARCHAR(255)' ]
  })
  .then(/*...*/)
  .catch(/*...*/);
```

### `create`

Creates a new record based on object passed:

```javascript
mysqlTest.create({
    fname: 'John',
    lname: 'Smith',
    email: 'jsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/);
```

### `read`

Runs a `SELECT` with optional `WHERE`:

```javascript
mysqlTest.read('fname="John"')
  .then(/*...*/)
  .catch(/*...*/);
```

### `update`

Updates record(s) based on query and body:

```javascript
mysqlTest.update('fname="John"', {
    fname: 'Bob',
    email: 'bsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/);
```

### `delete`

Deletes record(s) based on query:

```javascript
mysqlTest.delete('fname="Bob"')
  .then(/*...*/)
  .catch(/*...*/);
```

### `extend`

Extends the adapter to allow for custom methods:

```javascript
mysqlTest.extend('myMethod', () => {
  /*...*/
});
```

## Development

The MySQL adapter requires the following enviroment variables to be set for
running the tests. These should be associated with the MySQL instance running
locally.

```
MODLI_MYSQL_HOST,
MODLI_MYSQL_USERNAME,
MODLI_MYSQL_PASSWORD,
MODLI_MYSQL_DATABASE
```

This repository includes a base container config for running locally which is
located at [/dockerfiles/mysql](/dockerfiles/mysql).

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/build`
* `test` will run all spec files in `/test/src`
* `test-cover` will run code coverage on all tests
* `lint` will lint all files in `/src`

## Testing

Running `make test` will run the full test suite. Since adapters require a data
source if one is not configured the tests will fail. To counter this tests are
able to be broken up.

**Test Inidividual File**

An individual spec can be run by specifying the `FILE`. This is convenient when
working on an individual adapter.

```
make test FILE=some.spec.js
```

The `FILE` is relative to the `test/src/` directory.

**Deploys**

For deploying releases, the `deploy TAG={VERSION}` can be used where `VERSION` can be:

```
<newversion> | major | minor | patch | premajor
```

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.

## License

Modli-NeDB is licensed under the MIT license. Please see `LICENSE.txt` for full details.

## Credits

Modli-NeDB was designed and created at [TechnologyAdvice](http://www.technologyadvice.com).