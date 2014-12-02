define([
    'jquery',
    'underscore',
    'base/Trigger'
], function($, _, Trigger) {

    console.log('zoe Tabs');


    var defaults = {
            current : ''
        };


    var Tabs = Trigger.extend({
            initialize : function(options) {
                var self = this,
                    res;

                res = Trigger.prototype.initialize.call(self, options);

                options = _.defaults(options, defaults);

                self._current = options.current

                return res;
            },

            setElement : function(el) {
                var self = this,
                    res;

                res = Trigger.prototype.setElement.call(self, el);

                self.$el.addClass(Tabs.CLASS_ELEM);

                self._tabKit = {};
                self.$(Tabs.SELECTOR_ITEM).each(function() {
                    var elem = this,
                        hash = elem.href,

                        $elem = $(elem);

                    if (hash.indexOf('#') === -1) {
                        return;
                    }
                    hash = hash.split('#').pop();

                    self._tabKit[hash] = {
                        hash : hash,
                        elem : elem,

                        active : function() {
                            $elem.addClass(Tabs.CLASS_ACTIVE);
                        },

                        inactive : function() {
                            $elem.removeClass(Tabs.CLASS_ACTIVE);
                        },

                        show : function() {
                            $elem.removeClass(Tabs.CLASS_HIDE);
                        },

                        hide : function() {
                            $elem.addClass(Tabs.CLASS_HIDE);
                        }
                    };

                    $elem.addClass(Tabs.CLASS_ITEM);
                });

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

            _validTab : function(hash) {
                var self = this,
                    tabKit = self._tabKit,
                    tab;

                if (hash in tabKit) {
                    tab = hash;
                } else {
                    tab = _.keys(tabKit).shift();
                }

                return tab;
            },

            _updateTab : function(tab) {
                var self = this,
                    tabKit = self._tabKit;

                // 重置所有的tab为非active状态
                _.invoke(tabKit, 'inactive');
                // 设置当前tab为active状态
                tabKit[tab].active();

                self._current = tab;
            },

            select : function(hash, silent) {
                var self = this,
                    current = self._current,
                    tab = self._validTab(hash),
                    res;

                res = Trigger.prototype.select.call(self, tab, silent);

                if (tab !== current) {
                    self._updateTab(tab);
                }

                return res;
            }
        }, {
            CLASS_ELEM   : 'zoe-tabs',
            CLASS_ITEM   : 'zoe-tabs_item',
            CLASS_HIDE   : 'zoe-tabs_item__hide',
            CLASS_ACTIVE : 'zoe-tabs_item__active',

            SELECTOR_ITEM : 'a'
        });

    
    return Tabs;

});