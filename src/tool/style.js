/* 内置样式表
 * by lizzz (http://lizzz0523.github.io/)
 */

define([
    'underscore',
    'tool/utils'
], function(_, utils) {

    var doc = window.document,

        head = doc.head || doc.getElementsByTagName('head').get(0),

        style = doc.createElement('style'),
        styleId = 'zoe-style',

        sheet;

    style.type = 'text/css';
    style.id = styleId;
    head.appendChild(style);

    sheet = style.sheet || (function() {
        var sheets = [].slice.call(doc.styleSheets, 0);
        
        return _.find(sheets, function(sheet) {
            return sheet.ownerNode.id == styleId;
        });
    })();


    return {
        insert : function(selector, rules) {
            var ruleText = '';

            _.each(rules, function(value, name) {
                ruleText += utils.dashCase(name) + ':' + value + ';';
            });

            ruleText = selector + '{' + ruleText + '}';

            if (sheet.insertRule) {
                sheet.insertRule(ruleText, 0);
            } else if (sheet.addRule) {
                sheet.addRule(ruleText, 0);
            }
        },

        remove : function(selector) {
            var rules = [].slice.call(sheet.cssRules || sheet.rules, 0);

            _.each(rules, function(rule, index) {
                if (rule.selectorText !== selector) return;

                if (sheet.deleteRule) {
                    sheet.deleteRule(index);
                } else if (sheet.removeRule) {
                    sheet.removeRule(index);
                }
            })
        }
    };

});