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

      it('should create new ride', (done) => {
        request(app)
            .post('/rides')
            .send({
                start_lat: 80,
                start_long: 80,
                end_lat: 80,
                end_long: 80,
                rider_name: 'John Doe',
                driver_name: 'Richard',
                driver_vehicle: 'Car',
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                assert.equal(res.body[0].rideID, 26);
                assert.ok(res.body[0].created);
                done();
            });
    });
    });

    describe('GET /rides', () => {
      it('Endpoint should be available', (done) => {
        request(app)
          .get('/rides')
          .expect(200, done);
      });

      it('should return default 10 rows', (done) => {
          request(app)
              .get('/rides?page=1')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                  if (err) return done(err);
                  assert.equal(res.body.length, 10);
                  done();
              });
      });

      it('should return limit 5 rows', (done) => {
          request(app)
              .get('/rides?page=1&limit=5')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                  if (err) return done(err);
                  assert.equal(res.body.length, 5);
                  done();
              });
      });
    });
});



  

  