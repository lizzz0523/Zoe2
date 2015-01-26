define([
    'service/index',
    'service/utils',
    'service/cache'
], function(module) {

    module.factory('zoeQueue', ['zoeUtils', 'zoeCache', function(utils, cache) {

        var _isArray = utils.isArray,
            _clone = utils.clone,
            _each = utils.each;

        var settings = {
                CACHE : 'queues'
            };

        function Queue(context) {
            cache.set(this, settings.CACHE, {});
            this.context = context || this;
        }

        Queue.prototype = {
            add : function(name, callback) {
                var queues = cache.get(this, settings.CACHE),
                    players = queues[name] || (queues[name] = []);

                if (_isArray(callback)) {
                    queues[name] = _clone(callback);
                } else {
                    players.push({
                        context : this.context,
                        callback : callback
                    });
                }
            },

            next : function(name) {
                var queues = cache.get(this, settings.CACHE),
                    players = queues[name],
                    player;

                if (!players) return;
                player = players.shift();

                if (player) {
                    player.callback.call(player.context);
                }

                if (!players.length) {
                    delete queues[name];
                }
            },

            clear : function(name) {
                var queues = cache.get(this, settings.CACHE),
                    players = queues[name];

                players && (delete queues[name]);
            },

            size : function(name) {
                var queues = cache.get(this, settings.CACHE),
                    players = queues[name];

                return players ? players.length : 0;
            }
        };


        // 对外接口

        Queue.create = function(context) {
            return new Queue(context);
        };


        // 全局列队系统

        Queue.global = new Queue(window);

        _each('add next clear size'.split(' '), function(value) {
            Queue.create[value] = function() {
                Queue.global[value].apply(Queue.global, arguments);
            };
        });

        
        return Queue.create;
        
    }]);

});