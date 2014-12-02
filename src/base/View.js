/*
 * 所有zoe组件的基类，实现ViewBinding功能接口，
 * 控制View的整个生命周期（initialize，render，destory），
 * 对外提供了组件基本的show，hide接口，
 * 并派生出MultiView，FormKit，PopUp，Trigger四类具有不同特性的复合组件
 *
 * 直接继承View的组件
 * - video
 * - map
 * - tooltip
 * - form
 */
 define([
    'underscore',
    'backbone'
], function(_, B) {

    console.log('zoe View');


    var _slice = Array.prototype.slice,

        _super = {
            setElement : B.View.prototype.setElement,
            trigger    : B.View.prototype.trigger
        },

        _rmessage = /^(\S+)\s*(.*)$/,

        _extractMessage = function(messages, message, view) {
            var res = [],
                key,
                match,
                name,
                rname,
                subview;

            for (key in messages) {
                match = key.match(rmessage);
                name = match[1];
                subview = match[2];

                rname = new RegExp(name.replace('*', '[\\w]*'));

                if (!rname.test(message.name)) {
                    continue;
                }

                if (subview && _getChildView(subview) !== message.source) {
                    continue;
                }

                res.push({
                    name    : name,
                    subview : subview,
                    value   : hash[key]
                });
            }

            return res.length ? res[0].value : null;
        },

        _getChildView = function(view) {
            
        },

        _getParentView = function(view) {
            var parent = null,

                $elem = view.$el,
                $parent = $elem.parent();

            while ($parent.size() > 0 && $parent.get(0) !== document.body) {
                parent = $parent.data('view');

                if (parent && parent instanceof View) {;
                    break;
                } else {
                    parent = null;
                }

                $parent = $parent.parent();
            }

            return parent;
        };

    var View = B.View.extend({
            inited : false,

            initialize : function() {
                var self = this;

                self.inited = true;

                return self;
            },

            render : function() {
                var self = this;

                return self;
            },

            destory : function() {
                var self = this,
                    key,

                    $elem = self.$el;

                self.off();    

                for (key in self) {
                    if (!_.has(self, key)) continue;

                    if (self[key].jquery && self[key] !== $elem) {
                        self[key].off();
                    }

                    delete self[key];
                }

                $elem.off();
                $elem.remove();

                self.destory = new Function();
                 
                return self;
            },

            // 重载setElement方法
            setElement : function(el) {
                var self = this,
                    res;

                // 触发B.View上的serElement方法
                res = _super.setElement.call(self, el);

                self.$el.data('view', self);

                return res;
            },

            // 重载trigger方法
            trigger : function(name) {
                var self = this,
                    args = _slice.call(arguments, 1),
                    names,
                    parent,
                    message,
                    callback,
                    res;

                // 触发B.View上的trigger方法
                res = _super.trigger.apply(self, arguments);

                if (name.indexOf(' ') > -1) {
                    names = name.split(/\s+/);
                } else {
                    names = [name];
                }

                _.each(names, function(name) {
                    parent = _getParentView(self);

                    message = {
                        name   : name,
                        source : self
                    };

                    while (parent) {
                        if ('messages' in parent && _.isObject(parent.messages)) {
                            callback = _extractMessage(parent.messages, message, parent);

                            if (callback === null) {
                                continue;
                            }

                            // 如果callback是view的一个属性
                            if (_.isString(callback) && callback in parent) {
                                callback = parent[callback];
                            }

                            if (!_.isFunction(callback)) {
                                throw new Error('不存在方法' + callback);
                            }

                            // 检测callback的返回值，如果返回值为false，则停止冒泡
                            if (callback.apply(parent, args) === false) {
                                break;
                            }
                        }

                        message.source = parent;
                        parent = _getParentView(parent);
                    }
                });

                return res;
            },
             
            show : function() {
                var self = this;

                self.$el.show();

                return self;
            },

            hide : function () {
                var self = this;

                self.$el.hide();

                return self;
            },

            sync : function(status) {
                var self = this;

                return self;
            }
        }, {
            EVENT_SYNC : 'sync:view'
        });


    return View;

});