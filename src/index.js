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
        throw err;
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
   * Properly formats data for inserts and updates
   * @memberof mysql
   * @param {*} val The value to manipulate
   * @returns {String} properly formatted insert/update value
   */
  typeHandler (val) {
    if (val === null && typeof(val) === 'object') { return 'null'; }
    if (val === true && typeof(val) === 'boolean') { return 'true'; }
    if (val === false && typeof(val) === 'boolean') { return 'false'; }
    if (typeof(val) === 'number') { return val; }
    // All others, string
    return `"${val}"`;
  }

  /**
   * Creates a new record
   * @memberof mysql
   * @param {Object} body The record to insert
   * @param {Sting|Number} [version] The version of the model
   * @returns {Object} promise
   */
  create (body, version = false) {
    return this.validate(body, version)
      .then(data => {
        // Build query
        let cols = [];
        let vals = [];
        for (let prop in data) {
          cols.push(prop);
          vals.push(this.typeHandler(data[prop]));
        }
        const query = `INSERT INTO \`${this.tableName}\` (\`${cols.join('`,`')}\`) VALUES (${vals.join(',')});`;
        // Run query
        return this.query(query)
          .then(res => {
            if (res.affectedRows === 1) {
              return data;
            }
            throw new Error('Unable to create record');
          });
      });
  }

  /**
   * Queries for a record
   * @memberof mysql
   * @param {Object} query The query to execute
   * @returns {Object} promise
   */
  read (query, version = false) {
    let where;
    if (query) {
      where = ` WHERE ${query}`;
    } else {
      where = '';
    }
    return new Promise((resolve, reject) => {
      return this.query(`SELECT * FROM \`${this.tableName}\`${where}`)
        .then((results) => {
          let tmp = [];
          results.forEach((r) => {
            tmp.push(this.sanitize(r, version));
          });
          resolve(tmp);
        })
        .catch((err) => {
          reject(err);
        });
    });
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
    return this.validate(body, version)
      .then(data => {
        let i = 1;
        let changes = '';
        let len = Object.keys(data).length;
        for (let prop in data) {
          if ({}.hasOwnProperty.call(data, prop)) {
            let comma = (i !== len) ? ', ' : '';
            let val = this.typeHandler(data[prop]);
            changes += `\`${prop}\`=${val}${comma}`;
            i++;
          }
        }
        return this.query(`UPDATE \`${this.tableName}\` SET ${changes} WHERE ${query}`)
          .then(res => {
            if (res.affectedRows > 0) {
              return data;
            }
            throw new Error('Could not update record(s)');
          });
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
