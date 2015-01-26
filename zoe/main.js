require.config({
    paths : {
        'directive'          : 'directive',
        'service'            : 'service',

        'underscore'         : 'vendor/underscore',
        'jquery'             : 'vendor/jquery',
		'angular'            : 'vendor/angular'
    },

    shim : {
        'jquery'             : {exports : '$'},
        'underscore'         : {exports : '_'},
        'angular'            : {exports : 'angular', deps : ['jquery']}
    },

    map : {
        '*'                  : {
            'jquery'     : '$',
            'underscore' : '_'
        },

        '$'                  : {'jquery' : 'jquery'},
        '_'                  : {'underscore' : 'underscore'}
    }
});

define('$', ['jquery'], function($) {
    return $.noConflict(true);
});

define('_', ['underscore'], function(_) {
    return _.noConflict(true);
});

require(['boot']);