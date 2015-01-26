define([
    'angular',

    'directive/index',
    'directive/panel',
    'directive/slider',

    'service/index',
    'service/utils',
    'service/cache',
    'service/queue'
], function(angular) {

    return angular.module('zoe', [
        'zoe.directive',
        'zoe.service'
    ]);

});