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
                'click a' : '__onclick'
            },

            select : function(hash, silent) {
                var self = this;
                
                // silent是一个内部参参数，用于屏蔽事件触发
                if (!silent) {
                    self.__select(hash, silent);
                }

                 return self;
            },

            sync : function(hash) {
                var self = this;

                self.select(hash, true);

                return self;
            },

            __select : function(hash) {
                var self = this;

                self.trigger(Trigger.EVENT_SELECT, hash);
                self.trigger(View.EVENT_SYNC, hash);
            },

            __onclick : function(event) {
                var self = this,
                     hash = event.currentTarget.href;

                event.preventDefault();

                if (hash.indexOf('#') === -1) {
                    return;
                }
                hash = hash.split('#').pop();

                self.select(hash, false);
            }
        }, {
             EVENT_SELECT : 'select:trigger'
        });


     return Trigger;

 });