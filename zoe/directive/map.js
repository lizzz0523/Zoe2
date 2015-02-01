define([
    'jquery',

    'directive/index',
    'service/utils',
    'service/bmap'
], function($, module) {

    ;module

    .constant('zoeMapConfig', {
        init: 0,
        speed: 500,
        // 纬度
        lat: 39.943146,
        // 经度
        lng: 116.337284,
        // 地图缩放级别
        zoom: 13,
        // 中心点偏移量
        offset: 0.01,
        // 是否添加导航控件
        navigation: false,
        // 是否添加右下角缩略图
        overview: false,
        // 自定义标点信息
        marker: {
            url: 'http://img4.bitauto.com/dealer/dealersite/20140626/images/map_i24.png',
            size: {w: 28, h: 35},
            anchor: {w: 14, h: 33},
            events: [
                { 
                    name: 'click',
                    fn: function () { }
                }
            ]
        },
        // 自定义浮层信息
        label: {
            content: '',
            size: {w: 0, h: 0},
            style: {
                'border-color' : '#ccc'
            }
        }
    })

    .controller('zoeMapCtrl', [
        '$scope',

        'zoeUtils',
        'zoeBMap',
        'zoeMapConfig',
    function($scope, utils, bmap, mapConfig) {

        var _parser = utils.parseConfig,
            _isString = utils.isString,
            _isFinite = utils.isFinite,
            _uniqueId = utils.uniqueId,
            _defaults = utils.defaults,
            _each = utils.each,
            _find = utils.find,

            self = this;

        self.map = {
            curIndex: -1,
            minIndex: 0,
            maxIndex: -1
        };

        self.sites = [];

        self.init = function(elem, attr) {
            var map = self.map,
                sites = self.sites,

                $elem = $(elem),
                $view = $elem.find('>.zoe-map_view'); 

            self.config = _defaults(_parser(attr.zoeMap), mapConfig);

            map.$elem = $elem;
            map.$view = $view;

            createMap();

            return self;
        };

        self.append = function(elem, attr) {
            var map = self.map,
                sites = self.sites;

            sites.push({
                $elem: $(elem),

                attr: attr,
                hash: attr.id || attr.name || 'zoe-map-' + _uniqueId(),

                lng: attr.zoeLng,
                lat: attr.zoeLat,
                
                index: sites.length
            });

            map.maxIndex++;

            return self;
        };

        self.remove = function(elem) {
            var map = self.map,

                sites = self.sites,
                site;

            site = _find(sites, function(site) {
                return site.$elem.is(elem);
            });

            sites.splice(site.index, 1);

            map.maxIndex--;

            return self;
        };

        self.select = function(hash) {
            var map = self.map,
                curIndex = map.curIndex,

                index = validIndex(hash);

            if (index !== curIndex) {
                if (curIndex === -1) {
                    showSite(index);
                } else {
                    showSite(index, true);
                }

                map.curIndex = index;
            }

            return self;
        }

        function validIndex(index) {
            var map = self.map,
                minIndex = map.minIndex,
                maxIndex = map.maxIndex,

                sites = self.sites,
                site;

            if (_isString(index)) {
                site = _find(sites, function(site) {
                    return site.hash === index;
                });

                if (site) {
                    index = site.index;
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

        function createMap() {
            var config = self.config,
                lng = config.lng,
                lat = config.lat,
                zoom = config.zoom,
            
                hasNavigation = config.navigation,
                hasOverview = config.overview,
            
                markerOpt = config.marker,
                labelOpt = config.label,

                map = self.map,
                sites = self.sites;

            map.view = bmap.create(map.$view.get(0));

            if (hasNavigation) {
                bmap.addNavigation(map.view);
            }

            if (hasOverview) {
                bmap.addOverview(map.view);
            }

            if (sites.length) {
                _each(sites, function(site) {
                    site.lng = site.lng || lng;
                    site.lat = site.lat || lat;

                    bmap.addMarker(map.view, site.lng, site.lat, markerOpt);
                    bmap.addLabel(map.view, site.lng, site.lat, labelOpt);
                });
            } else {
                bmap.addMarker(map.view, lng, lat, markerOpt);
                bmap.addLabel(map.view, lng, lat, labelOpt);

                bmap.zoom(map.view, lng, lat, zoom);
            }
        }

        function showSite(index, move) {
            var config = self.config,
                zoom = config.zoom,

                map = self.map,

                sites = self.sites,
                site = sites[index];

            if (move) {
                bmap.move(map.view, site.lng, site.lat, zoom);
            } else {
                bmap.zoom(map.view, site.lng, site.lat, zoom);
            }
        }

    }])

    .directive('zoeMap', [
        // no-di
    function() {

        return {
            restrict: 'A',
            templateUrl: 'zoe/template/map/map.html',
            replace: true,
            transclude: true,

            controller: 'zoeMapCtrl',
            require: 'zoeMap',
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

    .directive('zoeSite', [
        // no-di
    function() {

        return {
            restrict: 'A',
            templateUrl: 'zoe/template/map/site.html',
            replace: true,
            transclude: true,

            require: '^zoeMap',
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