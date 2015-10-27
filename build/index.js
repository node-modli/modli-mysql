'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('bluebird');
var mysqlModule = require('mysql');

/**
 * @class mysql
 */

var _default = (function () {
  function _default(config) {
    _classCallCheck(this, _default);

    this.conn = mysqlModule.createConnection(config);
    this.conn.connect(function (err) {
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

  _createClass(_default, [{
    key: 'query',
    value: function query(_query) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.conn.query(_query, function (err, result) {
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
  }, {
    key: 'createTable',
    value: function createTable(props) {
      // Build query
      var len = Object.keys(props).length;
      var i = 1;
      var query = 'CREATE TABLE IF NOT EXISTS `' + this.tableName + '` (';
      for (var prop in props) {
        var comma = i !== len ? ', ' : '';
        query += '`' + prop + '` ' + props[prop].join(' ') + comma;
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
  }, {
    key: 'create',
    value: function create(body) {
      var _this2 = this;

      var version = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return new Promise(function (resolve, reject) {
        // Validate
        var validationErrors = _this2.validate(body, version);
        if (validationErrors) {
          reject(validationErrors);
        } else {
          // Build query
          var cols = [];
          var vals = [];
          for (var prop in body) {
            cols.push(prop);
            vals.push('"' + body[prop] + '"');
          }
          var query = 'INSERT INTO `' + _this2.tableName + '` (`' + cols.join('`,`') + '`) VALUES (' + vals.join(',') + ');';
          // Run query
          resolve(_this2.query(query));
        }
      });
    }

    /**
     * Queries for a record
     * @memberof mysql
     * @param {Object} query The query to execute
     * @returns {Object} promise
     */
  }, {
    key: 'read',
    value: function read(query) {
      var _this3 = this;

      var version = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var where = undefined;
      if (query) {
        where = ' WHERE ' + query;
      } else {
        where = '';
      }
      return new Promise(function (resolve, reject) {
        return _this3.query('SELECT * FROM `' + _this3.tableName + '`' + where).then(function (results) {
          var tmp = [];
          results.forEach(function (r) {
            tmp.push(_this3.sanitize(r, version));
          });
          resolve(tmp);
        })['catch'](function (err) {
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
  }, {
    key: 'update',
    value: function update(query, body) {
      var _this4 = this;

      var version = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      return new Promise(function (resolve, reject) {
        var validationErrors = _this4.validate(body, version);
        if (validationErrors) {
          reject(validationErrors);
        } else {
          var i = 1;
          var changes = '';
          var len = Object.keys(body).length;
          for (var prop in body) {
            if (({}).hasOwnProperty.call(body, prop)) {
              var comma = i !== len ? ', ' : '';
              changes += '`' + prop + '`="' + body[prop] + '"' + comma;
              i++;
            }
          }
          resolve(_this4.query('UPDATE `' + _this4.tableName + '` SET ' + changes + ' WHERE ' + query));
        }
      });
    }

    /**
     * Deletes a record
     * @memberof mysql
     * @param {Object} query
     * @returns {Object} promise
     */
  }, {
    key: 'delete',
    value: function _delete(query) {
      return this.query('DELETE FROM `' + this.tableName + '` WHERE ' + query);
    }

    /**
     * Extends the mysql object
     * @memberof mysql
     * @param {String} name The name of the method
     * @param {Function} fn The function to extend on the object
     */
  }, {
    key: 'extend',
    value: function extend(name, fn) {
      this[name] = fn.bind(this);
    }
  }]);

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];