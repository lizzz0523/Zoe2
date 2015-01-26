define([
    'jquery',

    'directive/index',
    'service/utils'
], function($, module) {

    ;module

    .directive('zoeTabs', [
        // no-di
    function() {
        return {
            restrict: 'A',
            scope: {
                bind: '=?zoeBind'
            },
            link: function($scope, elem, attr) {
                var $elem = $(elem);

                $elem.on('click', 'a', function(event) {
                    var hash = event.currentTarget.href;

                    event.preventDefault();

                    if (hash.indexOf('#') === -1) {
                        return;
                    }
                    hash = hash.split('#').pop();

                    $scope.$apply(function() {
                        $scope.bind = hash;
                    });
                });
            }
        }
    }])

});