var express = require('express'),
    bodyParser = require('body-parser'),
    inno = require('node-inno-helper');

var app = express(),
    port = parseInt(process.env.PORT, 10),
    cache = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

var vars = {
    bucketName: process.env.INNO_BUCKET_ID,
    appKey: process.env.INNO_APP_KEY,
    appName: process.env.INNO_APP_ID,
    groupId: process.env.INNO_COMPANY_ID,
    apiUrl: process.env.INNO_API_HOST
};
inno.setVars(vars);
inno.setVar('collectApp', process.env.INNO_APP_ID);

app.get('/', function (req, res) {
    return res.send('');
});

app.post('/', function (req, res) {
    
    inno.getDatas(req, function (error, data) {
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
        
        return inno.getSettings(function (error, settings) {
            if (error) {
                return res.json({
                    error: error.message
                });
            }
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

app.get('/last-ten-values', function (req, res) {
    if (cache.length > 10) {
        cache = cache.slice(-10);
    }
    return res.json({
        error: null,
        data: cache
    });
});

var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});