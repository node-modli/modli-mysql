/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';
import MySQL from '../../src/index';

const mysql = new MySQL({
  host: process.env.MODLI_MYSQL_HOST,
  user: process.env.MODLI_MYSQL_USERNAME,
  password: process.env.MODLI_MYSQL_PASSWORD,
  database: process.env.MODLI_MYSQL_DATABASE
});

// Mock validation method, this is automatically done by the model
mysql.validate = (body) => {
  // Test validation failure by passing `failValidate: true`
  if (body.failValidate) {
    return { error: true };
  }
  // Mock passing validation, return null
  return null;
};

// Mock sanitize method, this is automatically done by the model
mysql.sanitize = (body) => {
  return body;
};

// Specific model properties
mysql.tableName = 'foo';

describe('mysql', () => {
  // Drop the table after testing
  after((done) => {
    mysql.query(`DROP TABLE ${mysql.tableName};`)
      .then(() => {
        done();
      })
      .catch((err) => {
        throw err;
      });
  });

  describe('construct', () => {
    it('throws error on inproper config', () => {
      try {
        const mysqlConstruct = new MySQL({ bad: 'config' });
        return mysqlConstruct;
      } catch (e) {
        expect(e).to.be.an.instanceof(Error);
      }
    });
    it('connects when proper config provided', () => {
      const mysqlConstruct = new MySQL({
        host: process.env.MODLI_MYSQL_HOST,
        user: process.env.MODLI_MYSQL_USERNAME,
        password: process.env.MODLI_MYSQL_PASSWORD,
        database: process.env.MODLI_MYSQL_DATABASE
      });
      expect(mysqlConstruct.conn).to.be.an.object;
    });
  });

  describe('query', () => {
    it('executes a mysql query against the database', (done) => {
      mysql.query('SELECT 1 + 1 AS solution')
        .then((result) => {
          expect(result[0].solution).to.equal(2);
          done();
        })
        .catch((err) =>  done(err));
    });
    it('fails on a bad query', (done) => {
      mysql.query('SHOOT myself IN THE foot')
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
    });
  });

  describe('createTable', () => {
    it('creates a new table based on object passed (if not exists)', (done) => {
      mysql.createTable({
        'id': [ 'INT', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
        'f name': [ 'VARCHAR(255)' ],
        'lname': [ 'VARCHAR(255)' ],
        'email': [ 'VARCHAR(255)' ]
      })
      .then((result) => {
        expect(result).to.be.an.object;
        done();
      })
      .catch((err) =>  done(err));
    });
  });

  describe('create', () => {
    it('fails when validation does not pass', (done) => {
      mysql.create({
        failValidate: true
      })
      .catch((err) => {
        expect(err).to.have.property('error');
        done();
      });
    });
    it('creates a new record based on object passed', (done) => {
      mysql.create({
        'f name': 'John',
        lname: 'Smith',
        email: 'jsmith@gmail.com'
      })
      .then((result) => {
        expect(result.insertId).to.be.a.number;
        done();
      })
      .catch((err) =>  done(err));
    });
  });

  describe('read', () => {
    it('reads all when no query specified', (done) => {
      mysql.read()
        .then((result) => {
          expect(result).to.be.an.array;
          done();
        })
        .catch((err) =>  done(err));
    });
    it('reads specific records when query supplied', (done) => {
      mysql.read('`f name`="John"', 1)
        .then((result) => {
          expect(result).to.be.an.array;
          done();
        })
        .catch((err) =>  done(err));
    });
    it('fails when a bad query is provided', (done) => {
      mysql.read('`fart=`knocker')
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
    });
  });

  describe('update', () => {
    it('fails when validation does not pass', (done) => {
      mysql.update({}, {
        failValidate: true
      })
      .catch((err) => {
        expect(err).to.have.property('error');
        done();
      });
    });
    it('updates record(s) based on query and body', (done) => {
      mysql.update('`f name`="John"', {
        'f name': 'Bob',
        email: 'bsmith@gmail.com'
      }, 1)
        .then((result) => {
          expect(result).to.be.an.object;
          expect(result.affectedRows).to.be.above(0);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('delete', () => {
    it('deletes record(s) based on query', (done) => {
      mysql.delete('`f name`="Bob"')
        .then((result) => {
          expect(result).to.be.an.object;
          expect(result.affectedRows).to.be.above(0);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('extend', () => {
    it('extends the adapter with a custom method', () => {
      // Extend
      mysql.extend('sayFoo', () => {
        return 'foo';
      });
      // Execute
      expect(mysql.sayFoo()).to.equal('foo');
    });
  });
});
