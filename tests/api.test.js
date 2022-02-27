'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('GET /rides', () => {
        it('Endpoint should be available', (done) => {
            request(app)
              .get('/rides')
              .expect(200, done);
        });
      });

      describe('GET /rides/{id}', () => {
        it('Endpoint should be available', (done) => {
            request(app)
              .get('/rides/{id}')
              .expect(200, done);
        });
      });

      describe('POST /rides', () => {
        it('Endpoint should be available', (done) => {
            request(app)
              .post('/rides')
              .expect(200, done);
        });
      });
});



  

  