define([
	'jquery',
	'underscore',
	'tool/utils',
	'tool/event',
    'base/View'
], function($, _, utils, event, View) {

    function zoe(viewId) {
        if (_.isFunction(viewId)) {
            // 如果参数为回调，则加入到ready事件列队
            return zoe.on('ready', viewId);
        } else {
            // 否则当成选择器，调用zoe.find方法
            return zoe.find(viewId + '');
        }
    }


    _.extend(zoe, {
        version : 'zoe 1.0.1',

        log : 'console' in window
        ? function() {
            console.log.apply(console, arguments);
        }
        : function() {
            // 如果系统不支持console，则忽略
        }
    });


    _.extend(zoe, {
        _views : {},

        _zuid : 1,

        find : function(viewId) {
            if (viewId in zoe._views) {
                return zoe._views[viewId];
            } else {
                return null;
            }
        },

        push : function(viewId, view) {
            if (zoe.find(viewId) === null) {
                zoe._views[viewId] = view;
            }
        }
    });


    //为zoe添加事件支持

    /* 
     * zoe.on('ready', function() {
     *     // 编写你的代码
     * });
     *
     * zoe.emit('ready');
     * zoe.off('ready');
     *
     */
    _.extend(zoe, {
        _event : event(zoe)
    });

    _.each('on one off emit'.split(' '), function(method) {
        zoe[method] = function() {
            zoe._event[method].apply(zoe._event, arguments);
        };
    });


    // zoe的use方法，用于获取特定模块
    
    /* 
     * zoe.use(['slider', 'tabs', 'map'], function(Slider, Tabs, Map) {
     *     // 编写你的代码
     * });
     *
     */
    _.extend(zoe, {
        _tpath : 'module/{s}/index',

        use : function(modules, callback) {
            modules = _.isArray(modules) ? modules : [modules];
            // 根据module的名称，转换称对于的zoe路径
            modules = _.map(modules, function(module) {
            	return zoe._tpath.replace(/\{s\}/g, module.toLowerCase());
            });
            
            require(modules, function() {
                callback.apply(zoe, arguments);
            });
        }
    });


    // zoe的强大viewBind机制，能维持多个view之间的状态同步

    /*
     * zoe.watch(view1, view2, view3, ...);
     *
     */
    _.extend(zoe, {
        watch : function() {
            var views = [].slice.call(arguments, 0);
                view1,
                view2,
                i = -1,
                j,
                len = views.length;

            while (++i < len) {
                j = i + 1;

                while (j < len) {
                    view1 = views[i];
                    view2 = views[j];

                    view1.on(View.Event_SYNC, function(status) {
                        View.prototype.sync.call(view2, status);
                    });

                    view2.on(View.Event_SYNC, function(status) {
                        View.prototype.sync.call(view1, status);
                    });
                }
            }
        }
    });


    var inited,

        ready = 0,
        
        readyCheck = function() {
            // 只有当zoe初始化的扫描执行完毕
            // 并且，所有组件都初始化后，才会触发bind和ready事件
            if (!inited || ready != 0) return;

            _.defer(function() {
                zoe.emit('bind');
                zoe.emit('ready');
            });
        },

        rdata = /^([^\[]+)(\[[\w\s\-\.$,=\[\]]*\])?(?:[^\]]*)$/,

        parseData = function(str) {
            var data = String(str).match(rdata);

            if (data) {
                return {
                    module : data[1] || '',
                    params : data[2] || '[]'
                }
            }

            return false;
        },

        parseParam = function(params) {
            var key = '',
                hash = {},

                phase = 2,
                first,
                index,

                stack = [],
                last = params,

                // 设置global标致，是为了使用lastIndex
                rterm = /[^=\,\[\]]*/g,
                rsign =/^(?:=|,)$/;

            function parseValue(value) {
                value = utils.trim(value);

                if (value.length != 0) {
                    // 内部转换字符串到对应的值
                    if (_.isFinite(value)) {
                        // number
                        value = +value;
                    } else {
                        // boolean & string
                        value = value.match(/^(?:true|false)$/) ? value == 'true' : value;
                    }
                } else {
                    // 如果字符串为空，默认转换成true
                    value = true;
                }

                return value;
            }

            function parseKey(key) {
                key = utils.trim(key);

                // 将key中的非法字符去掉
                if (key = utils.escape(key)
                    .replace(/[^\w$-]/g, '-')
                    .replace('_', '-')
                ) {
                    return utils.camelCase(key);   
                } else {
                    return  '';
                }
            }

            function pushStack() {
                var temp = {hash : hash, key : key};

                stack.push(temp);

                hash = {};
                key = '';
            }

            function popStack() {
                var temp = stack.pop();

                temp.hash[temp.key] = hash;

                hash = temp.hash;
                key = '';
            }

            while (params) {
                first = params.charAt(0);

                if (first.match(rsign)) {
                    params = params.slice(1);
                    phase = first == ',' ? 0 : 1;

                    continue;
                } else if (params.charAt(0) == '[') {
                    pushStack();

                    params = params.slice(1);
                    phase = 0;

                    continue;
                } else if (params.charAt(0) == ']') {
                    popStack();

                    params = params.slice(1);
                    phase = 2;

                    continue;
                }

                rterm.lastIndex = 0;

                switch (phase) {
                    case 0 :
                        // 找key值
                        index = rterm.exec(params) ? rterm.lastIndex : -1;

                        key = parseKey(index < 0 ? params : params.slice(0, index));
                        hash[key] = true;

                        params = params.slice(index);
                        phase = 2;

                        break;

                    case 1 :
                        // 找value值
                        index = rterm.exec(params) ? rterm.lastIndex : -1;

                        hash[key] = parseValue(index < 0 ? params : params.slice(0, index));
                        key = '';

                        params = params.slice(index);
                        phase = 2;

                        break;

                    default :
                        params = params.slice(1);
                        phase = 2;

                        break;
                }
            }

            while (stack.length) popStack();

            return hash[key];
        };

    inited = false;

    $('[data-zoe]').each(function(index, elem) {
        var $elem = $(elem),
            
            viewId = $elem.data('id'),
            viewBind = $elem.data('for'), 
            viewData = $elem.data('zoe'),

            options;

        if (!viewId) {
            $elem.data('id', (viewId = 'z_view-' + zoe._zuid++));
        }
          
        if (!zoe.find(viewId)) {
            viewData = parseData(viewData);

            if (viewData) {
                options = parseParam(viewData.params);
                options.el = $elem.get(0);

                ready++;
                zoe.use(viewData.module, function(View) {
                    zoe.push(viewId,  (new View(options)).render());

                    if (viewBind) {
                        zoe.one('bind', function() {
                            try {
                                zoe.watch(zoe.find(viewId), zoe.find(viewBind));
                            } catch(e) {
                                zoe.log('View Binding Error:' + viewId + '-->' + viewBind);
                            }
                        });
                    }

                    ready--;
                    readyCheck();
                });
            }
        }
    });

    inited = true;

    readyCheck();


    return zoe;

});
