define([
    'jquery',

    'directive/index',
    'service/utils',
    'service/queue'
], function($, module) {

    ;module

    .constant('zoeSliderConfig', {
        TYPE_PREV: 1,
        TYPE_NEXT: 2,

        speed: 500,
        loop: true,
        dir: 'horizontal'
    })

    .controller('zoeSliderCtrl', [
        '$scope',

        'zoeUtils',
        'zoeQueue',
        'zoeSliderConfig',
    function($scope, utils, queue, sliderConfig) {
        var _parser = utils.parseConfig,
            _isFunction = utils.isFunction,
            _isBoolean = utils.isBoolean,
            _isString = utils.isString,
            _isFinite = utils.isFinite,
            _uniqueId = utils.uniqueId,
            _defaults = utils.defaults,
            _defer = utils.defer,
            _delay = utils.delay,
            _wrap = utils.wrap,
            _find = utils.find,

            self = this;

        self.queue = queue(self);
        self.qname = 'zoe-slider';
                
        self.slider = {
            curIndex: -1,
            minIndex: 0,
            maxIndex: 0
        };

        self.slidees = [];

        self.init = function(elem, attr) {
            var slider = self.slider;

            self.config = _defaults(_parser(attr.zoeSlider), sliderConfig);
            
            slider.$elem = $(elem);
            slider.$mask = slider.$elem.find('>.zoe-slider_mask');
            slider.$view = slider.$mask.find('>.zoe-slider_view');

            slider.$view.addClass(self.config.dir === 'vertical' ? 'zoe-slider_view__v' : 'zoe-slider_view__h');
        };

        self.append = function(elem, attr) {
            var slider = self.slider,
                slidees = self.slidees;

            slidees.push({
                $elem: $(elem).hide(),

                hash: attr.id || attr.name || 'zoe-slidee-' + _uniqueId(),
                index: slider.maxIndex
            });

            slider.maxIndex++;
        };

        self.remove = function(elem) {
            var slidees = self.slidees,
                slidee;

            slidee = _find(slidees, function(slidee) {
                return slidee.$elem.is(elem);
            });

            slidees.splice(slidee.index, 1);
        };

        self.select = function(hash) {
            var slider = self.slider,
                curIndex = slider.curIndex,

                force = hash === 'prev' ? true : hash === 'next' ? false : void 0,
                index = validIndex(hash);

            if (index !== curIndex) {
                slideBuffer(index, force);
            }
        };

        self.prev = function() {
            self.select('prev');
        };

        self.next = function() {
            self.select('next');
        };
                
        function validIndex(index) {
            var config = self.config,
                isLoop = config.loop,

                slider = self.slider,
                curIndex = slider.curIndex,
                minIndex = slider.minIndex,
                maxIndex = slider.maxIndex,

                slidees = self.slidees,
                slidee;

            if (index === 'next') {
                index = curIndex + 1;
            }

            if (index === 'prev') {
                index = curIndex - 1;
            }

            if (_isString(index)) {
                slidee = _find(slidees, function(slidee) {
                    return slidee.hash === index;
                });

                if (slidee) {
                    index = slidee.index;
                }
            }

            if (_isFinite(index)) {
                index = +index;

                if (index > maxIndex) {
                    index = isLoop ? minIndex : maxIndex;
                }

                if (index < minIndex) {
                    index = isLoop ? maxIndex : minIndex;
                }
            } else {
                index = minIndex;
            }

            return index;
        }

        function slideBuffer(index, force) {
            var slider = self.slider,
                curIndex = slider.curIndex,
                isAnimated = slider.isAnimated,

                queue = self.queue,
                qname = self.qname,
                isEmpty = !!queue.size(qname);

            queue.clear(qname);

            // curIndex == -1
            // 说明控件仍未初始化
            if (curIndex == -1) {
                queue.add(qname, function(){
                    _defer(function(){
                        queue.next(qname);
                    });
                });

                queue.add(qname, function() {
                    slider.isAnimated = true;

                    showSlidee(index);

                    slider.curIndex = index;
                    slider.isAnimated = false;

                    queue.next(qname);
                });
            } else {
                queue.add(qname, function(){
                    // 加一个160毫秒的delay
                    // 可以减缓响应速度
                    // 感觉更真实
                    _delay(function(){
                        queue.next(qname);
                    }, 160);
                });

                queue.add(qname, function() {
                    slider.isAnimated = true;

                    slideTo(index, force, function() {
                        slider.isAnimated = false;
                        // 这里是为了在动画结束后
                        // 马上启动buffer的其他动画
                        queue.next(qname);
                    });

                    slider.curIndex = index;
                });
            }

            if (!isEmpty && !isAnimated) {
                queue.next(qname);
            }
        }

        function slideTo(index, force, callback) {
            var config = self.config,
                isVertical = config.dir === 'vertical',
                slideSpeed = config.speed,

                slider = self.slider,
                curIndex = slider.curIndex,
                
                isFromPrev = _isBoolean(force) ? force : index > curIndex,
                slideType = isFromPrev ? sliderConfig.TYPE_NEXT : sliderConfig.TYPE_PREV;

            moveSlidee(index, isFromPrev);
            showSlidee(index);

            if (_isFunction(callback)) {
                callback = _wrap(callback, function(callback) {
                    hideSlidee(curIndex);
                    callback.call(self);
                });
            } else {
                callback = function() {
                    hideSlidee(curIndex);
                }
            }

            slide(slideSpeed, slideType, isVertical, callback);
        }

        function slide(slideSpeed, slideType, isVertical, callback) {
            var init = {},
                dest = {};

            switch (slideType) {
                case sliderConfig.TYPE_PREV :
                    if (isVertical) {
                        init.top = '-100%';
                        dest.top = '0';
                    } else {
                        init.left = '-100%';
                        dest.left = '0';
                    }

                    break;

                case sliderConfig.TYPE_NEXT :
                    if (isVertical) {
                        init.top = '0';
                        dest.top = '-100%';
                    } else {
                        init.left = '0';
                        dest.left = '-100%';
                    }

                    break;
            }

            if (_isFunction(callback)) {
                callback = _wrap(callback, function(callback) {
                    moveView({left : 0, top : 0});
                    callback.call(self);
                });
            } else {
                callback = function() {
                    moveView({left : 0, top : 0});
                }
            }

            moveView(init);
            animView(dest, slideSpeed, callback);
        };

        function moveView(pos) {
            var slider = self.slider;

            slider.$view.css(pos);
        }

        function animView(pos, speed, callback) {
            var slider = self.slider;

            slider.$view.animate(pos, speed, callback);
        }

        function moveSlidee(index, append) {
            var slider = self.slider,

                slidees = self.slidees,
                slidee = slidees[index];

            if (append) {
                slider.$view.append(slidee.$elem);
            } else {
                slider.$view.prepend(slidee.$elem);
            }
        }

        function showSlidee(index) {
            var slidees = self.slidees,
                slidee = slidees[index];

            slidee.$elem.show();
        }

        function hideSlidee(index) {
            var slidees = self.slidees,
                slidee = slidees[index];

            slidee.$elem.hide();
        }
    }])

    .directive('zoeSlider', [
        // no-di
    function() {
        return {
            restrict: 'A',
            templateUrl: 'zoe/template/slider/slider.html',
            replace: true,
            transclude: true,

            controller: 'zoeSliderCtrl',
            require: 'zoeSlider',
            scope: {
                bind: '=?zoeBind'
            },

            link: function($scope, elem, attr, ctrl) {
                ctrl.init(elem, attr);

                $scope.$watch('bind', function(value) {
                    if (value !== void 0) {
                        ctrl.select(value);
                    }
                });

                $scope.bind = ctrl.config.init || 0;
            }
        };
    }])

    .directive('zoeSlidee', [
        // no-di
    function() {
        return {
            restrict: 'A',
            templateUrl: 'zoe/template/slider/slidee.html',
            replace: true,
            transclude: true,
            
            require: '^zoeSlider',
            scope: {
            },

            link: function($scope, elem, attr, ctrl) {
                ctrl.append(elem, attr);

                $scope.$on('$destroy', function() {
                    ctrl.remove(elem);
                });
            }
        };
    }]);

});