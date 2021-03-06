define([
    'jquery',

    'directive/index',
    'service/utils'
], function($, module) {

    ;module

    .constant('zoePanelConfig', {
        init: 0,
        speed: 500
    })

    .controller('zoePanelCtrl', [
        '$scope',

        'zoeUtils',
        'zoePanelConfig',
    function($scope, utils, panelConfig) {

        var _parser = utils.parseConfig,
            _isString = utils.isString,
            _isFinite = utils.isFinite,
            _uniqueId = utils.uniqueId,
            _defaults = utils.defaults,
            _find = utils.find,

            self = this;

        self.panel = {
            curIndex: -1,
            minIndex: 0,
            maxIndex: -1
        };

        self.panes = [];

        self.init = function(elem, attr) {
            var panel = self.panel,

                $elem = $(elem),
                $view = $elem.find('>.zoe-panel_view');

            self.config = _defaults(_parser(attr.zoePanel), panelConfig);
            
            panel.$elem = $elem;
            panel.$view = $view;

            return self;
        };

        self.append = function(elem, attr) {
            var panel = self.panel,
                panes = self.panes;

            panes.push({
                $elem: $(elem).hide(),

                attr: attr,
                hash: attr.id || attr.name || 'zoe-pane-' + _uniqueId(),
                
                index: panes.length
            });

            panel.maxIndex++;

            return self;
        };

        self.remove = function(elem) {
            var panel = self.panel,

                panes = self.panes,
                pane;

            pane = _find(panes, function(pane) {
                return pane.$elem.is(elem);
            });

            panes.splice(pane.index, 1);

            panel.maxIndex--;

            return self;
        };

        self.select = function(hash) {
            var panel = self.panel,
                curIndex = panel.curIndex,

                index = validIndex(hash);

            if (index !== curIndex) {
                if (curIndex === -1) {
                    hidePaneAll();
                    showPane(index);
                } else {
                    hidePane(curIndex);
                    showPane(index, true);
                }

                panel.curIndex = index;
            }

            return self;
        };

        function validIndex(index) {
            var panel = self.panel,
                minIndex = panel.minIndex,
                maxIndex = panel.maxIndex,

                panes = self.panes,
                pane;

            if (_isString(index)) {
                pane = _find(panes, function(pane) {
                    return pane.hash === index;
                });

                if (pane) {
                    index = pane.index;
                }
            }

            if (_isFinite(index)) {
                index = +index;

                if (index > maxIndex) {
                    index = maxIndex;
                }

                if (index < minIndex) {
                    index = minIndex;
                }
            } else {
                index = minIndex;
            }

            return index;
        }

        function showPane(index, fade) {
            var config = self.config,
                speed = config.speed,

                panes = self.panes,
                pane = panes[index];

            if (fade) {
                pane.$elem.fadeIn(speed);
            } else {
                pane.$elem.show();
            }
        }

        function hidePane(index, fade) {
            var config = self.config,
                speed = config.speed,

                panes = self.panes,
                pane = panes[index];

            if (fade) {
                pane.$elem.fadeOut(speed);
            } else {
                pane.$elem.hide();
            }
        }

        function hidePaneAll(fade) {
            var panel = self.panel,
                i = -1,
                len = panel.maxIndex;

            while (++i < len) {
                hidePane(i, fade);
            }
        }

    }])

    .directive('zoePanel', [
        // no-di
    function() {

        return {
            restrict: 'A',
            templateUrl: 'zoe/template/panel/panel.html',
            replace: true,
            transclude: true,

            controller: 'zoePanelCtrl',
            require: 'zoePanel',
            scope: {
                selected: '=?zoeBind'
            },

            link: function($scope, elem, attr, ctrl) {
                $scope.$watch('selected', function(value) {
                    if (value !== void 0) {
                        ctrl.select(value);
                    } else {
                        ctrl.select(ctrl.config.init);
                    }
                });

                ctrl.init(elem, attr);
            }
        };

    }])

    .directive('zoePane', [
        // no-di
    function() {

        return {
            restrict: 'A',
            templateUrl: 'zoe/template/panel/pane.html',
            replace: true,
            transclude: true,
            
            require: '^zoePanel',
            scope: {
            },

            link: function($scope, elem, attr, ctrl) {
                $scope.$on('$destroy', function() {
                    ctrl.remove(elem);
                });
                
                ctrl.append(elem, attr);
            }
        };
        
    }]);

});