var util = require('util'),
    request = require('request');

var vars = {},
    cache = {},
    cachedTime = 10;

var settingsAppUrl = function (obj) {
        return util.format(vars.apiUrl + '/companies/%s/buckets/%s/apps/%s/custom?app_key=%s', obj.groupId, obj.bucketName, obj.appName, obj.appKey);
    },
    profilesAppUrl = function (obj) {
        return util.format(vars.apiUrl + '/companies/%s/buckets/%s/profiles/%s?app_key=%s', obj.groupId, obj.bucketName, obj.profileId, obj.appKey);
    };

var getKeyForCache = function (name) {
    return name;
};

var getCache = function (name, params) {
    if (!cachedTime || params.noCache) {
        return false;
    }
    var key = getKeyForCache(name);
    if (cache.hasOwnProperty(key)) {
        if (cache[key].expired <= Date.now()) {
            delete cache[key];
            return false;
        } else {
            return cache[key].value;
        }
    }
    return false;
};

var setCache = function (name, params, value) {
    if (!cachedTime || params.noCache) {
        return;
    }
    var key = getKeyForCache(name);
    cache[key] = {
        expired: Date.now() + (cachedTime * 1000),
        value: value || true
    };
};

var expireCache = function (name) {
    var key = getKeyForCache(name);
    if (cache.hasOwnProperty(key)) {
        cache[key].expired = 0;
    }
};

exports = module.exports = {
    /**
     * Working with cache
     */
    clearCache: function () {
        cache = {};
    },
    setCachedTime: function (time) {
        cachedTime = time;
    },

    /**
     * Working with vars
     */
    getVars: function () {
        return vars;
    },
    setVars: function (obj) {
        vars = obj;
    },
    setVar: function (name, value) {
        vars[name] = value;
    },

    /**
     * Parse start session data
     */
    getDatas: function (req, callback) {
        var profile = req.body.profile,
            session = profile.sessions[0];

        if (!session.collectApp) {
            return callback(new Error('Custom not found'));
        }
        exports.setVar('collectApp', session.collectApp);

        if (!session.section) {
            return callback(new Error('Section not found'));
        }
        exports.setVar('section', session.section);

        if (!session.events[0].data) {
            return callback(new Error('Data not set'));
        }

        if (!profile.id) {
            return callback(new Error('Profile id not found'));
        }
        exports.setVar('profileId', profile.id);
        return callback(null, session.events[0].data);
    },

    /**
     * Get settings application
     * @param  Object   params   params have "vars"
     * @param  Function callback
     */
    getSettings: function (params, callback) {
        var cachedValue = getCache('settings' + params.vars.appName, params);
        if (cachedValue) {
            return callback(null, cachedValue);
        }
        var url = settingsAppUrl({
            groupId: params.vars.groupId,
            bucketName: params.vars.bucketName,
            appName: params.vars.appName,
            appKey: params.vars.appKey
        });
        request.get(url, function (error, response) {
            if (error) {
                return callback(error);
            }
            var body;
            try {
                body = JSON.parse(response.body);
            } catch (e) {
                return callback(new Error('Parse JSON settings (' + url + ')'));
            }
            if (!body.hasOwnProperty('custom')) {
                return callback(new Error('Custom not found'));
            }
            setCache('settings' + params.vars.appName, params, body.custom);
            return callback(null, body.custom);
        });
    },

    /**
     * Update data profile by id
     * @param  Object   params   params have "vars" and "data"
     * @param  Function callback
     */
    setAttributes: function (params, callback) {
        var url = profilesAppUrl({
            groupId: params.vars.groupId,
            bucketName: params.vars.bucketName,
            profileId: params.vars.profileId,
            appKey: params.vars.appKey
        });
        request.post({
            url: url,
            body: {
                id: params.vars.profileId,
                attributes: [{
                    collectApp: params.vars.collectApp,
                    section: params.vars.section,
                    data: params.data
                }]
            },
            json: true
        }, function (error) {
            if (error) {
                return callback(error);
            }
            expireCache('attributes' + params.vars.profileId);
            return callback(null);
        });
    },

    /**
     * Get data profile by id
     * @param  Object   params   params have "vars"
     * @param  Function callback
     */
    getAttributes: function (params, callback) {
        var cachedValue = getCache('attributes' + params.vars.profileId, params);
        if (cachedValue) {
            return callback(null, cachedValue);
        }
        var url = profilesAppUrl({
            groupId: params.vars.groupId,
            bucketName: params.vars.bucketName,
            profileId: params.vars.profileId,
            appKey: params.vars.appKey
        });
        request.get(url, function (error, response) {
            if (error) {
                return callback(error);
            }
            var body;
            try {
                body = JSON.parse(response.body);
            } catch (e) {
                return callback(new Error('Parse JSON profile (' + url + ')'));
            }
            var profile = body.profile;
            if (!profile) {
                return callback(new Error('Profile not found'));
            }
            var attributes = [];
            if (profile.attributes &&
                profile.attributes.length) {
                attributes = profile.attributes;
            }
            setCache('attributes' + params.vars.profileId, params, attributes);
            return callback(null, attributes);
        });

    }
};