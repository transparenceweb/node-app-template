var express = require('express'),
    bodyParser = require('body-parser'),
    inno = require('./inno-helper');

var app = express(),
    port = parseInt(process.env.PORT, 10);

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
    bucketName: process.env.INNO_BUCKET || 'qwe',
    appKey: process.env.INNO_APP_KEY || 'vNQAs5Okgq5ogRd3',
    appName: process.env.INNO_APP_NAME || 'alch2',
    groupId: process.env.INNO_COMPANY_ID || 4,
    apiUrl: process.env.INNO_API_URL || 'http://prerelease.innomdc.com/v1'
});

/**
 * Routing
 */
app.post('/set', function (req, res) {
    var params = req.body;
    inno.setVar('profileId', params.profileId);
    inno.setVar('collectApp', params.collectApp);
    inno.setVar('section', params.section);

    inno.updateProfile({
        vars: inno.getVars(),
        data: {
            'some-attribute': params.attribute
        }
    }, function (error) {
        return res.json({
            error: error ? error.message : null,
            data: {
                'some-attribute': params.attribute
            }
        });
    });
});

app.get('/get', function (req, res) {
    var params = req.query;
    if (!params.profileId || !params.collectApp || !params.section) {
        return res.json({
            error: 'No complete query parameter'
        });
    }
    inno.setVar('profileId', params.profileId);
    inno.setVar('collectApp', params.collectApp);
    inno.setVar('section', params.section);
    inno.getProfile({
        vars: inno.getVars()
    }, function (error, data) {
        data = data.filter(function (item) {
            return item.collectApp === params.collectApp && item.section === params.section;
        });
        return res.json({
            error: error ? error.message : null,
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