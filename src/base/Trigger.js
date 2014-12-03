/*
 * 继承自View，是可触发（triggable）组件大类的基类，
 * 主要是捕捉组件内的a标签的点击事件，向外发送与a标签对应的hash
 *
 * 直接继承自Trigger的组件
 * - page
 * - tabs
 */
define([
    'base/View'
], function(View) {

    console.log('zoe Trigger');


    var Trigger = View.extend({
            events : {
                'click a' : '_onclick'
            },

            messages : {
                'select' : '_onselect'
            }

            select : function(hash) {
                var self = this;

                return self;
            },

            update : function(target, hash) {
                var self = this;

                self.trigger(Trigger.EVENT_SELECT, hash);
                self.trigger(View.EVENT_SYNC, hash);

                return self;
            },

            _onselect : function(message, hash) {
                var self = this;

                self.update(message.source, hash);
            }

            _onclick : function(event) {
                var self = this,
                     hash = event.currentTarget.href;

                event.preventDefault();

                if (hash.indexOf('#') === -1) {
                    return;
                }
                hash = hash.split('#').pop();

                self._onselect(false, hash);
            }
        }, {
             EVENT_SELECT : 'select'
        });


     return Trigger;

 });