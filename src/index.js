const Promise = require('bluebird');
const mysqlModule = require('mysql');

/**
 * @class mysql
 */
export default class {

  constructor (config) {
    this.conn = mysqlModule.createConnection(config);
    this.conn.connect((err) => {
      if (err) {
        throw new Error('MySQL Connection Error', err);
      }
    });
  }

  /**
   * Pass-through to direct query (promisified)
   * @memberof mysql
   * @param {String} query The query to run
   */
  query (query) {
    return new Promise((resolve, reject) => {
      this.conn.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Creates a table
   * @memberof mysql
   * @param {String} name The name of the table to create
   * @param {Object} props The properties of the table
   * @returns {Object} promise
   */
  createTable (props) {
    // Build query
    const len = Object.keys(props).length;
    let i = 1;
    let query = `CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (`;
    for (let prop in props) {
      let comma = (i !== len) ? ', ' : '';
      query += `\`${prop}\` ${props[prop].join(' ')}${comma}`;
      i++;
    }
    query += ');';
    // Run query
    return this.query(query);
  }

  /**
   * Creates a new record
   * @memberof mysql
   * @param {Object} body The record to insert
   * @param {Sting|Number} [version] The version of the model
   * @returns {Object} promise
   */
  create (body, version = false) {
    return new Promise((resolve, reject) => {
      // Validate
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        // Build query
        let cols = [];
        let vals = [];
        for (let prop in body) {
          cols.push(prop);
          vals.push('"' + body[prop] + '"');
        }
        const query = `INSERT INTO \`${this.tableName}\` (\`${cols.join('`,`')}\`) VALUES (${vals.join(',')});`;
        // Run query
        resolve(this.query(query));
      }
    });
  }

  /**
   * Queries for a record
   * @memberof mysql
   * @param {Object} query The query to execute
   * @returns {Object} promise
   */
  read (query) {
    let where;
    if (query) {
      where = ` WHERE ${query}`;
    } else {
      where = '';
    }
    return this.query(`SELECT * FROM \`${this.tableName}\`${where}`);
  }

  /**
   * Updates an existing record
   * @memberof mysql
   * @param {Object} query The query to identify update record(s)
   * @params {Object} body The record contents to update
   * @params {String|Number} version The version of the model
   * @returns {Object} promise
   */
  update (query, body, version = false) {
    return new Promise((resolve, reject) => {
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        let i = 1;
        let changes = '';
        let len = Object.keys(body).length;
        for (let prop in body) {
          if ({}.hasOwnProperty.call(body, prop)) {
            let comma = (i !== len) ? ', ' : '';
            changes += `\`${prop}\`="${body[prop]}"${comma}`;
            i++;
          }
        }
        resolve(this.query(`UPDATE \`${this.tableName}\` SET ${changes} WHERE ${query}`));
      }
    });
  }

  /**
   * Deletes a record
   * @memberof mysql
   * @param {Object} query
   * @returns {Object} promise
   */
  delete (query) {
    return this.query(`DELETE FROM \`${this.tableName}\` WHERE ${query}`);
  }

  /**
   * Extends the mysql object
   * @memberof mysql
   * @param {String} name The name of the method
   * @param {Function} fn The function to extend on the object
   */
  extend (name, fn) {
    this[name] = fn.bind(this);
  }

}
