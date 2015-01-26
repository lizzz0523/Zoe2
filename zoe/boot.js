define([
    'angular',
    'zoe'
], function(angular, zoe) {

    zoe.run([
        '$rootScope',
    function($rootScope) {
        $rootScope.zoe = {};
    }])

    angular.bootstrap(document.body, [zoe.name]);

});