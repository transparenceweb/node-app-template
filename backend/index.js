var express = require('express'),
    bodyParser = require('body-parser'),
    inno = require('innometrics-helper');

var app = express(),
    port = parseInt(process.env.PORT, 10),
    cache = [];

// Parse application/json request
app.use(bodyParser.json());

/**
 * If your app's frontend part is going to communicate directly with backend, you need to allow this
 * https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

/* Init params from environment variables. Innometrics platform sets environment variables during install to Paas. 
 * In case of manual install of backend part, you need to setup these manually.
 */
var vars = {
    bucketName: process.env.INNO_BUCKET_ID,
    appKey: process.env.INNO_APP_KEY,
    appName: process.env.INNO_APP_ID,
    groupId: process.env.INNO_COMPANY_ID,
    apiUrl: process.env.INNO_API_HOST,
    collectApp: process.env.INNO_APP_ID
};
inno.setVars(vars);

app.get('/', function (req, res) {
    return res.send('Profile stream expected only as POST requests');
});

// POST request to "/" is always expected to recieve stream with events
app.post('/', function (req, res) {
    // Reading and parsing income events stream
    inno.getStreamData(req.body, function (error, data) {
        if (error) {
            return res.json({
                error: error.message
            });
        }
        
        if (!(data.event && data.event.createdAt && data.event.definitionId && data.data && data.profile && data.profile.id)) {
            return res.json({
                error: 'Stream data is not correct'
            });
        }

        // Caching received events (to be shown for debug purpose on frontend)
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

        // Reading app settings from Profile Cloud
        return inno.getSettings(function (error, settings) {
            if (error) {
                return res.json({
                    error: error.message
                });
            }

            // Update person's profile with new attributes
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

// Return to GUI last 10 events saved in cache
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
