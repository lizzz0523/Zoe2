define([
    'service/index',
    'service/utils'
], function(module) {

    module.factory('zoeCache', ['zoeUtils', function(utils) {

        var _isUndefined = utils.isUndefined,
            _uniqueId = utils.uniqueId,
            _size = utils.size;

        var hook = '_cache' + _uniqueId(),
            cache = [],
            cacheId = 1;
            
        function cacheData(key, value) {
            var id = this[hook],
                cacheData;

            if (!id) {
                this[hook] = id = cacheId++;
            }

            if (!cache[id]) {
                cache[id] = {};
            }

            cacheData = cache[id];

            if (!_isUndefined(value)) {
                cacheData[key] = value;
            }

            if (key) {
                value = cacheData[key];
            } else {
                value = cacheData;
            }

            return value;
        }

        function removeData(key) {
            var id = this[hook],
                cacheData;

            if (!id || !cache[id]) {
                return;
            }

            if (key) {
                cacheData = cache[id];

                if (cacheData && key in cacheData) {
                    delete cacheData[key];
                }

                if (!_size(cacheData)) {
                    delete cache[id];
                }
            } else {
                delete cache[id];
            }
        }

        
        return {
            get: function(context, key) {
                return cacheData.call(context, key);
            },

            set: function(context, key, value) {
                return cacheData.call(context, key, value);
            },

            remove: function(context, key) {
                removeData.call(context, key);
            }
        };
        
    }]);

});