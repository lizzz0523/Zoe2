define([
    'jquery',
    'underscore',
    'base/Trigger'
], function($, _, Trigger) {

    console.log('zoe Page');


    var defaults = {
            total   : 0,
            range   : 5,
            current : 1
        };


    var Page = Trigger.extend({
            template : _.template([

                '<% for(var i = 1; i <= data.total; i++){ %>',
                    '<a class="zoe-page_item',
                        '<% if(i < data.first || i > data.last){ %> zoe-page_item__hide<% } %>',
                        '<% if(i == data.center){ %> zoe-page_item__active<% } %>',
                    '" href="#<%= i %>"><%= i %></a>',
                '<% } %>'

            ].join(''), {variable : 'data'}),

            initialize : function(options) {
                var self = this,
                    res;

                res = Trigger.prototype.initialize.call(self, options);

                options = _.defaults(options, defaults);

                self._total = options.total;
                self._range = options.range;
                self._current = options.current;

                return self;
            },

            setElement : function(el) {
                var self = this,
                    res;

                res = Trigger.prototype.setElement.call(self, el);

                self.$el.html(Page.TEMPLATE)
                self.$el.addClass(Page.CLASS_ELEM);

                self.$inner = self.$(Page.SELECTOR_INNER);
                self.$prev = self.$(Page.SELECTOR_PREV);
                self.$next = self.$(Page.SELECTOR_NEXT);
                self.$first = self.$(Page.SELECTOR_FIRST);
                self.$last = self.$(Page.SELECTOR_LAST);

                return res;
            },

            _getPageRange : function(center) {
                var self = this,
                    total = self._total,
                    range = self._range,
                    first,
                    last;

                first = center - Math.floor(range / 2);
                last = center + Math.ceil(range / 2) - 1;

                if (total < range) {
                    first = 1;
                    last = total;
                } else if (first <  1) {
                    first = 1;
                    last = first + range - 1;
                } else if (last > total) {
                    last = total;
                    first = last - range + 1;
                }

                return {
                    first  : first,
                    last   : last,
                    total  : total,
                    center : center
                };
            },

            render : function() {
                var self = this,
                    tmpl = self.template,
                    current = self._current,
                    range = self._getPageRange(current),

                    $inner = self.$inner,
                    $prev = self.$prev,
                    $next = self.$next,
                    $first = self.$first,
                    $last = self.$last;

                $inner.html(tmpl(range));

                $prev.toggleClass(Page.CLASS_DISABLED, range.center === 1);
                $next.toggleClass(Page.CLASS_DISABLED, range.center === range.total);

                $first.toggleClass(Page.CLASS_HIDE, range.first === 1);
                $last.toggleClass(Page.CLASS_HIDE, range.last === range.total);

                return self;
            },

            _validPage : function(hash) {
                var self = this,
                    total = self._total,
                    current = self._current,
                    page;

                switch (hash) {
                    case 'next' :
                        page = current + 1;
                        break;

                    case 'prev' :
                        page = current - 1;
                        break;

                    case 'first' :
                        page = 1;
                        break;

                    case 'last' :
                        page = total;
                        break;

                    default :
                        if (_.isFinite(hash)) {
                            page = +hash;
                        } else {
                            page = current;
                        }
                        break;
                }

                if (page < 1) {
                    page = 1;
                }

                if (page > total) {
                    page = total;
                }

                return page;
            },

            _updatePage : function(page) {
                var self = this,
                    range = self._getPageRange(page);

                    $inner = self.$inner,
                    $prev = self.$prev,
                    $next = self.$next,
                    $first = self.$first,
                    $last = self.$last;

                $inner.find(Page.SELECTOR_ITEM).each(function() {
                    var elem = this,
                        hash = elem.href,
                        page,

                        $elem = $(this);

                    if (hash.indexOf('#') === -1) {
                        return;
                    }
                    hash = hash.split('#').pop();
                    page = +hash;

                    if (page < range.first || page > range.last) {
                        $elem.addClass(Page.CLASS_HIDE);
                    } else {
                        $elem.removeClass(Page.CLASS_HIDE);
                    }

                    if (page === range.center) {
                        $elem.addClass(Page.CLASS_ACTIVE);
                    } else {
                        $elem.removeClass(Page.CLASS_ACTIVE);
                    }
                });

                $prev.toggleClass(Page.CLASS_DISABLED, range.center === 1);
                $next.toggleClass(Page.CLASS_DISABLED, range.center === range.total);

                $first.toggleClass(Page.CLASS_HIDE, range.first === 1);
                $last.toggleClass(Page.CLASS_HIDE, range.last === range.total);

                self._current = page;
            },

            select : function(hash, silent) {
                var self = this,
                    current = self._current,
                    page = self._validPage(hash),
                    res;

                res = Trigger.prototype.select.call(self, page, silent);

                if (page !== current) {
                    self._updatePage(page);
                }

                return res;
            }
        }, {
            TEMPLATE       : [
            
                '<span class="zoe-page_nav">',
                    '<a class="zoe-page_item zoe-page_prev" href="#prev">&lt;</a>',
                '</span>',

                '<span class="zoe-page_nav">',
                    '<a class="zoe-page_item zoe-page_first" href="#first">...</a>',
                '</span>',

                '<span class="zoe-page_inner"></span>',

                '<span class="zoe-page_nav">',
                    '<a class="zoe-page_item zoe-page_last" href="#last">...</a>',
                '</span>',
                
                '<span class="zoe-page_nav">',
                    '<a class="zoe-page_item zoe-page_next" href="#next">&gt;</a>',
                '</span>'

            ].join(''),

            CLASS_ELEM     : 'zoe-page',
            CLASS_HIDE     : 'zoe-page_item__hide',
            CLASS_ACTIVE   : 'zoe-page_item__active',
            CLASS_DISABLED : 'zoe-page_item__disabled',

            SELECTOR_INNER : '.zoe-page_inner',
            SELECTOR_ITEM  : '.zoe-page_item',
            SELECTOR_PREV  : '.zoe-page_prev',
            SELECTOR_NEXT  : '.zoe-page_next',
            SELECTOR_FIRST : '.zoe-page_first',
            SELECTOR_LAST  : '.zoe-page_last'
        });


    return Page;

});