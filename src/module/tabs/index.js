define([
    'jquery',
    'underscore',
    'base/Trigger'
], function($, _, Trigger) {

    console.log('zoe Tabs');


    var defaults = {
            current : ''
        },

        super = {
            initialize : Trigger.prototype.initialize,
            setElement : Trigger.prototype.setElement
        };


    var Tab = Trigger.extend({
            tagName : 'li',

            className : 'zoe-tabs_item',

            initialize : function(options) {
                var self = this,
                    res;

                res = super.initialize.call(self, options);

                self._active = false;
            },

            select : function(toggle) {
                var self = this;

                self.$el.toggleClass(Tab.CLASS_ACITVE, toggle);

                self._active = !!toggle;
            
                return self;
            },
        }, {
            CLASS_ACITVE : 'zoe-tabs_item__active'
        }),

        List = Trigger.extend({
            initialize : function(options) {
                var self = this,
                    res;

                res = super.initialize.call(self, options);

                options = _.defaults(options, defaults);

                self._current = options.current

                return res;
            },

            setElement : function(el) {
                var self = this,
                    tab = null,
                    tabKit = [],
                    res;

                res = super.setElement.call(self, el);

                self.$tabs = self.$el.children();

                self.$el.prepend(List.TMPL);
                self.$el.addClass(List.CLASS);

                self.$list = self.$('ul');
                self.$tabs.each(function() {
                    tab = new Tab();
                    tabKit.push(tab);

                    self.$list.append(tab.$el.append(this));
                });

                self._tabKit = tabKit;

                return res;
            },

            render : function() {
                var self = this,
                    tabKit = self._tabKit,
                    current = self._current;

                if (!current) {
                    // 如果没有设置current，这默认为tabKit中的第一个tab
                    current = self._current = _.keys(tabKit).shift();
                }

                tabKit[current].hide();
                tabKit[current].active();
                tabKit[current].show();

                return self;
            },

            select : function(hash) {
                var self = this,
                    tabKit = self._tabKit,
                    target = message.source;

                _.each(tabKit, function(tab) {
                    if (target === tab) {
                        tab.select(true);
                    } else{
                        tab.select(false);
                    }
                });
            },

            update : function(target, hash) {
                var self = this,
                    tabKit = self._tabKit,
                    res;

                res = Trigger.prototype.update.call(self, target, hash);

                _.each(tabKit, function(tab) {
                    if (target === tab) {
                        tab.select(true);
                    } else{
                        tab.select(false);
                    }
                });
            }
        }, {
            TMPL  : '<ul class="zoe-tabs_list"></ul>'
            CLASS : 'zoe-tabs'
        });

    
    return List;

});