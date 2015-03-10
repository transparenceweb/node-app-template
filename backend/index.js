var express = require('express'),
    bodyParser = require('body-parser'),
    inno = require('innometrics-helper');

var app = express(),
    port = parseInt(process.env.PORT, 10),
    cache = [];

// Parse application/json request
app.use(bodyParser.json());

/**
 * This option allow send request to server located on another domain.
 * https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Set params
var vars = {
    bucketName: process.env.INNO_BUCKET_ID,
    appKey: process.env.INNO_APP_KEY,
    appName: process.env.INNO_APP_ID,
    groupId: process.env.INNO_COMPANY_ID,
    apiUrl: process.env.INNO_API_HOST,
    collectApp: process.env.INNO_APP_ID
};
inno.setVars(vars);

// Handler routes
app.get('/', function (req, res) {
    return res.send('Profile stream expected only as POST requests');
});

// POST request "/" always recieve stream events
app.post('/', function (req, res) {
    // Parse stream
    inno.getStreamData(req.body, function (error, data) {
        if (error) {
            return res.json({
                error: error.message
            });
        }
        // Check the validity of the data
        if (!(data.event && data.event.createdAt && data.event.definitionId && data.data && data.profile && data.profile.id)) {
            return res.json({
                error: 'Stream data is not correct'
            });
        }

        // Caching received events
        cache.push({
            data: JSON.stringify({
                created_at: data.event.createdAt,
                values: data.data,
                event: data.event.definitionId,
                profile: data.profile.id,
                link: inno.webProfileAppUrl(vars)
            }),
            created_at: Date.now()
        });

        // Reading settings
        return inno.getSettings(function (error, settings) {
            if (error) {
                return res.json({
                    error: error.message
                });
            }

            // Writing data to attributes of profile
            return inno.setAttributes(settings, function (error) {
                if (error) {
                    return res.json({
                        error: error.message
                    });
                }
                return res.json({
                    error: null,
                    data: settings
                });
            });

        });
    });
});

// Show last ten cached events from stream
app.get('/last-ten-values', function (req, res) {
    if (cache.length > 10) {
        cache = cache.slice(-10);
    }
    return res.json({
        error: null,
        data: cache
    });
});

// Starting server
var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});