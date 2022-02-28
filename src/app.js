'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../swagger.json');
const { status } = require('express/lib/response');
const constant = require('./constants');
  

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.post('/rides', jsonParser, async (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: constant.ERROR_CODE.VALIDATION_ERROR,
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                status: constant.HTTP_CODE.VALIDATION_ERROR
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: constant.ERROR_CODE.VALIDATION_ERROR,
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                status: constant.HTTP_CODE.VALIDATION_ERROR
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: constant.ERROR_CODE.VALIDATION_ERROR,
                message: 'Rider name must be a non empty string',
                status: constant.HTTP_CODE.VALIDATION_ERROR

            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: constant.ERROR_CODE.VALIDATION_ERROR,
                message: 'Rider name must be a non empty string',
                status: constant.HTTP_CODE.VALIDATION_ERROR
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: constant.ERROR_CODE.VALIDATION_ERROR,
                message: 'Rider name must be a non empty string',
                status: constant.HTTP_CODE.VALIDATION_ERROR
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        await db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return res.send({
                    error_code: constant.ERROR_CODE.SERVER_ERROR,
                    message: 'Unknown error',
                    status: constant.HTTP_CODE.SERVER_ERROR
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.send({
                        error_code: constant.ERROR_CODE.SERVER_ERROR,
                        message: 'Unknown error',
                        status: constant.HTTP_CODE.SERVER_ERROR
                    });
                }

                res.status(constant.HTTP_CODE.CREATED).send(rows);
            });
        });
    });

    app.get('/rides', async (req, res) => {
        const page = Number(req.query.page);
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        let sql = 'SELECT * FROM Rides';
        let params = [];
        if (page) {
            sql = 'SELECT * FROM Rides LIMIT ? OFFSET ?';
            const offset = (page - 1) * limit;
            params = [ limit, offset ];
        }
        try {
            const rows = await db.all(sql, params);
            if (rows.length === 0) {
                return res.send({
                    error_code: constant.ERROR_CODE.RIDES_NOT_FOUND,
                    message: 'Could not find any rides',
                    status: constant.HTTP_CODE.NOT_FOUND
                });
            }
            return res.send(rows);
        } catch (error) {
            return res.status(constant.HTTP_CODE.NOT_FOUND).send(error);
        }
    });

    app.get('/rides/:id', async (req, res) => {
        await db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: constant.ERROR_CODE.SERVER_ERROR,
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: constant.ERROR_CODE.RIDES_NOT_FOUND,
                    message: 'Could not find any rides',
                    status: constant.HTTP_CODE.NOT_FOUND
                });
            }

            res.send(rows);
        });
    });

    return app;
};
