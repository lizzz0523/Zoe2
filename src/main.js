require.config({
    paths : {
        'jquery'     : 'lib/jquery',
        'underscore' : 'lib/underscore',
        'backbone'   : 'lib/backbone',
        'tool'       : 'tool',
        'base'       : 'base',    
        'module'     : 'module',
        'plugin'     : 'plugin'
    },

    shim : {
        'underscore' : {
            exports : '_'
        },

        'backbone' : {
            deps : ['jquery', 'underscore'],
            exports : 'Backbone'
        }
    },

    map : {
        '*' : {
            'jquery' : 'jquery-noConflict'
        },

        'jquery-noConflict' : {
            'jquery' : 'jquery'
        },

        'backbone-noConflict' : {
            'backbone' : 'backbone'
        }
    }
});

define('jquery-noConflict', ['jquery'], function(jQuery) {
    return jQuery.noConflict(true);
});

define('backbone-noConflict', ['backbone'], function(Backbone) {
    return Backbone.noConflict();
});

require([
    'zoe',
    'base/Trigger',

    'tool/cache',
    'tool/event',
    'tool/queue',
    'tool/state',
    'tool/utils',
    'tool/client'
], function(zoe, Trigger) {
    zoe(function() {
        var tabs = zoe('my-tabs');

        tabs.on(Trigger.EVENT_SELECT, function(hash) {
            console.log(hash);
        });
    });
});