define([
    'angular',

    'directive/index',
    'directive/slider',
    'directive/panel',
    'directive/tabs',
    'directive/map',

    'service/index',
    'service/utils',
    'service/cache',
    'service/queue',
    'service/bmap'
], function(angular) {

    return angular.module('zoe', [
        'zoe.directive',
        'zoe.service'
    ]);

});