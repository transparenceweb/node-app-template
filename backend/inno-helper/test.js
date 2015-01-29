var inno = require('./index'),
    right;

function assert(condition, message) {
    if (!condition) {
        console.error(message);
    }
}

var vars = {
    bucketName: 'bucket',
    appKey: '3vY9Xs5mydv43vWk',
    appName: 'demo',
    groupId: 4,
    apiUrl: 'http://prerelease.innomdc.com'
};
inno.setVars(vars);
inno.setVar('collectApp', vars.appName);

right = JSON.stringify({
    test: 1234
});

inno.setSettings({
    test: 1234
}, function (error) {
    if (error) {
        return assert(false, 'setSettings: ' + error);
    }
    inno.getSettings(function (error, data) {
        assert(JSON.stringify(data) === right, 'getSettings: ' + JSON.stringify(data));
    });
});