var express = require('express'),
    bodyParser = require('body-parser'),
    inno = require('./inno-helper');

var app = express(),
    port = parseInt(process.env.PORT, 10),
    urls = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

/**
 * Init vars
 */
inno.setVars({
    bucketName: process.env.INNO_BUCKET,
    appKey: process.env.INNO_APP_KEY,
    appName: process.env.INNO_APP_NAME,
    groupId: process.env.INNO_COMPANY_ID,
    apiUrl: process.env.INNO_API_URL
});

inno.setVar('collectApp', process.env.INNO_APP_NAME);

/**
 * Stream
 */
app.post('/', function (req, res) {
    inno.getDatas(req, function (error, data) {
        if (data.hasOwnProperty('page-url')) {
            urls.push(data['page-url']);
        }
        res.json({
            error: null
        });
    });
});

/**
 * Routing
 */
app.get('/last-ten-urls', function (req, res) {
    if (urls.length > 10) {
        var endIndex = urls.length - 1;
        urls = urls.slice(endIndex - 10, endIndex);
    }
    return res.json({
        error: null,
        data: urls
    });
});

app.post('/set', function (req, res) {
    var params = req.body;
    inno.setVar('profileId', params.profileId);
    inno.setVar('section', params.section);

    inno.setAttributes({
        vars: inno.getVars(),
        data: {
            'some-attribute': params.attribute
        }
    }, function (error) {
        if (error) {
            return res.json({
                error: error.message
            });
        }
        return res.json({
            error: null,
            data: {
                'some-attribute': params.attribute
            }
        });
    });
});

app.get('/get', function (req, res) {
    var params = req.query;
    if (!params.profileId || !params.section) {
        return res.json({
            error: 'No complete query parameter'
        });
    }
    inno.setVar('profileId', params.profileId);
    inno.setVar('section', params.section);

    inno.getAttributes({
        vars: inno.getVars()
    }, function (error, data) {
        if (error) {
            return res.json({
                error: error.message
            });
        }
        data = data.filter(function (item) {
            return item.collectApp === process.env.INNO_APP_NAME && item.section === params.section;
        });
        return res.json({
            error: null,
            data: data
        });
    });
});

/**
 * Server
 */
var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});