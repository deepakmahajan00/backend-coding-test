'use strict';

const request = require('supertest');
const assert = require('chai').assert;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');
const constant = require('../src/constants');

const buildInputData = async function() {
    const data = {
        'start_long': 90,
        'start_lat': 80,
        'end_long': 90,
        'end_lat': 75,
        'rider_name': 'Test Rider',
        'driver_name': 'Test Driver',
        'driver_vehicle': 'Helicopter',
    };
    const values = [data.start_lat, data.start_long, data.end_lat, data.end_long, data.rider_name, data.driver_name, data.driver_vehicle];
    _.times(10, () => {
        db.run('INSERT INTO Rides(startLat, startLong,' +
                'endLat, endLong, riderName, driverName, driverVehicle) VALUES' +
                '(?, ?, ?, ?, ?, ?, ?)', values, function(err) {
        if (err) { return err; }
        });
    });
};

const getPostRideData = function() {
    return {
        'start_long': 100,
        'start_lat': 70,
        'end_long': 110,
        'end_lat': 75,
        'rider_name': 'Test Rider',
        'driver_name': 'Driver Name',
        'driver_vehicle': 'Bike',
    };
}

const getPostRideInvalidData = function(startLong, startLat, endLong, endLat, riderName = 'Rider Name', driverName = 'Driver Name', vehicle = 'CAR') {
    return {
        'start_long': startLong,
        'start_lat': startLat,
        'end_long': endLong,
        'end_lat': endLat,
        'rider_name': riderName,
        'driver_name': driverName,
        'driver_vehicle': vehicle,
    };
}

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
        it('Endpoint should be available', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(constant.HTTP_CODE.SUCCESSFUL, done);
        });
    });

  
    describe('GET /rides/{id}', () => {
      it('Endpoint should be available', (done) => {
          request(app)
            .get('/rides/{id}')
            .expect(constant.HTTP_CODE.SUCCESSFUL, done);
      });

      it('should return not found', (done) => {
        request(app)
            .get('/rides/99')
            .expect((res) => {
              assert.strictEqual(res.body.error_code, constant.ERROR_CODE.RIDES_NOT_FOUND);
              assert.strictEqual(res.body.status, constant.HTTP_CODE.NOT_FOUND);
            })
            .end(done);
      });

      it('should return ride', (done) => {
        request(app)
            .post('/rides')
            .send(getPostRideData())
            .set('Content-Type', 'application/json')
            .then((res) => {
              request(app)
                  .get(`/rides/${res.body.rideID}`)
                  .expect(constant.HTTP_CODE.SUCCESSFUL)
                  .expect((getResponse) => {
                    assert.strictEqual(getResponse.body.rideID, res.body.rideID);
                  })
                  .end(done);
            });
      });
    });

    describe('POST /rides', () => {
        it('Endpoint should be available', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(constant.HTTP_CODE.SUCCESSFUL, done);
        });

        it('should create ride successfully', (done) => {
          request(app)
              .post('/rides')
              .send(getPostRideData())
              .set('Content-Type', 'application/json')
              .expect(constant.HTTP_CODE.CREATED)
              .expect((res) => {
                assert.isNotNull(res.body.rideID);
              })
              .end(done);
        });

        it('fail with invalid initial position', (done) => {
            request(app)
                .post('/rides')
                .send(getPostRideInvalidData(200, 200, 110, 75))
                .set('Content-Type', 'application/json')
                .expect((res) => {
                  assert.strictEqual(res.body.error_code, constant.ERROR_CODE.VALIDATION_ERROR);
                  assert.strictEqual(res.body.status, constant.HTTP_CODE.VALIDATION_ERROR);
                })
                .end(done);
          });

          it('fail with invalid final position', (done) => {
            request(app)
                .post('/rides')
                .send(getPostRideInvalidData(100, 70, 200, 200))
                .set('Content-Type', 'application/json')
                .expect((res) => {
                  assert.strictEqual(res.body.error_code, constant.ERROR_CODE.VALIDATION_ERROR);
                  assert.strictEqual(res.body.status, constant.HTTP_CODE.VALIDATION_ERROR);
                })
                .end(done);
          });

          it('fail with invalid riders name', (done) => {
            request(app)
                .post('/rides')
                .send(getPostRideInvalidData(100, 70, 200, 200, ''))
                .set('Content-Type', 'application/json')
                .expect((res) => {
                  assert.strictEqual(res.body.error_code, constant.ERROR_CODE.VALIDATION_ERROR);
                  assert.strictEqual(res.body.status, constant.HTTP_CODE.VALIDATION_ERROR);
                })
                .end(done);
          });

          it('fail with invalid driver name', (done) => {
            request(app)
                .post('/rides')
                .send(getPostRideInvalidData(100, 70, 200, 200, 'Rider', ''))
                .set('Content-Type', 'application/json')
                .expect((res) => {
                  assert.strictEqual(res.body.error_code, constant.ERROR_CODE.VALIDATION_ERROR);
                  assert.strictEqual(res.body.status, constant.HTTP_CODE.VALIDATION_ERROR);
                })
                .end(done);
          });

          it('fail with invalid driver name', (done) => {
            request(app)
                .post('/rides')
                .send(getPostRideInvalidData(100, 70, 200, 200, 'Rider', 'Driver', ''))
                .set('Content-Type', 'application/json')
                .expect((res) => {
                  assert.strictEqual(res.body.error_code, constant.ERROR_CODE.VALIDATION_ERROR);
                  assert.strictEqual(res.body.status, constant.HTTP_CODE.VALIDATION_ERROR);
                })
                .end(done);
          });
    });

    describe('GET /rides', () => {
        it('Endpoint should be available', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(constant.HTTP_CODE.SUCCESSFUL, done);
        });

      });
});



  

  