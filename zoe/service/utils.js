define([
    'underscore',
    'service/index'    
], function(_, module) {

    function slice(arr, start, end) {
        return end != void 0
        ? [].slice.call(arr, start, end)
        : [].slice.call(arr, start);
    }

    function push(obj, key, value) {
        // 如果push到某一key值的value不至一个
        // 那么我们应该把他push到一个数组当中
        
        if (key in obj) {
            obj[key].length == +obj[key].length || (obj[key] = [obj[key]]);
            obj[key].push(value);
        } else {
            obj[key] = value;
        }

        return obj;
    }

    module.factory('zoeUtils', [function() {
        
        var utils = {
                guid : function() {
                    var d = new Date().getTime(), r;

                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);

                        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                    });
                }
            };


        var rtrim = /^\s+|\s+$/g,
            rencode = /[&<>"']/g,
            rdecode = /&(?:amp|lt|gt|quot|#39);/g,
            rescape = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            rcamelCase = /-([\da-z])/gi,
            rdashCase = /([\dA-Z])/g,

            mencode = {
                '<'  : '&lt;',
                '>'  : '&gt;',
                '&'  : '&amp;',
                '"'  : '&quot;',
                '\'' : '&#39;'
            },

            mdecode = {
                '&lt;'   : '<',
                '&gt;'   : '>',
                '&amp;'  : '&',
                '&quot;' : '"',
                '&#39;'  : '\''
            },

            mescape = {
                '\b' : '\\b',
                '\t' : '\\t',
                '\n' : '\\n',
                '\f' : '\\f',
                '\r' : '\\r',
                '"'  : '\\"',
                '\\' : '\\\\'
            };

        _.extend(utils, {
            trim : function(str) {
                if(str == null) return '';

                return String(str).replace(rtrim, '');
            },

            encode : function(str) {
                if(str == null) return '';

                return String(str).replace(rencode, function(match) {
                    return mencode[match];
                });
            },

            decode : function(str) {
                if (str == null) return '';

                return String(str).replace(rdecode, function(match) {
                    return mdecode[match];
                });
            },

            escape : function(str) {
                if (str == null) return '';

                return String(str).replace(rescape, function(match) {
                    return mescape[match] || '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
                });
            },

            camelCase : function(str) {
                if (str == null) return '';

                return String(str).replace(rcamelCase, function(all, first) {
                    return first.toUpperCase();
                });
            },

            dashCase : function(str) {
                if (str == null) return '';

                return String(str).replace(rdashCase, function(all, first) {
                    return '-' + first.toLowerCase();
                });
            }
        });


        var rjsonclear = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            rjsonchars = /^[\],:{}\s]*$/,
            rjsonescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rjsontokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rjsonbraces = /(?:^|:|,)(?:\s*\[)+/g,
            rurl = /(?:([\w\d\-]+):\/\/|([^\/?#]+)|(\/[^?#]+)|\?([\w\d\-\/=&%]+)|#([\w\d\-\/]+))/g,
            rquery = /^(?:[^?]*\?)?([\w\d\-\/=&%]+)/,

            // 常见协议端口定义
            mport = {
                'ftp'    : 21,
                'mailto' : 25,
                'https'  : 443,
                'http'   : 80
            },

            aurl = 'all protocol host pathname query hash'.split(' ');

        _.extend(utils, {
            parseJSON : (function() {
                // 参考: http://json.org/json2.js

                function walk(key, list, reviver){
                    var value = list[key];

                    if (value && _.isObject(value)) {
                        _.each(value, function(k, v, value) {
                            v = walk(k, value, reviver);
                            if (v != void 0) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        });
                    }

                    return reviver.call(list, key, value);
                }

                return function(str, reviver) {
                    var res;

                    // 如果浏览器支持JSON对象
                    // 那么应该直接调用
                    if (JSON && _.isFunction(JSON.parse)) {
                        return JSON.parse(str);
                    }

                    if (str != null) {
                        // 清洗字符串
                        str = String(str).replace(rjsonclear, function(a) {
                            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }).replace(rtrim, '');

                        if (rjsonchars.test(str
                            .replace(rjsonescape, '@')
                            .replace(rjsontokens, ']')
                            .replace(rjsonbraces, '')
                        )) {
                            res = (new Function('return ' + str))();

                            return _.isFunction(reviver)
                            ? walk('', {'': res}, reviver)
                            : res;
                        }
                    }

                    return [];
                }

            })(),

            parseURL : function(url) {
                var location = window.location,
                    match = null,
                    index = 1,
                    part,
                    res = {},
                    auth,
                    host,
                    file;

                url = url || location.toString();

                rurl.lastIndex = 0;
                while (match = rurl.exec(url)) {
                    while (!match[index]) index++;
                    res[aurl[index]] = match[index];
                };

                // 获取传输协议
                res.protocol = res.protocol || location.protocol;

                // 获取主机信息
                res.host = res.host || location.host;

                host = res.host.split('@');
                if (host.length == 1) {
                    // 不包含用户名密码
                    auth = ['', ''];
                    host = host[0].split(':');
                } else {
                    // 包含用户名密码
                    auth = host[0].split(':');
                    host = host[1].split(':');
                }

                res.user = auth[0];
                res.password = auth[1] || '';

                res.hostname = host[0];
                res.port = +host[1] || mport[res.protocol.toLowerCase()] || location.port;

                // 获取文件路径
                res.pathname = res.pathname || location.pathname;

                // 获取文件名
                file = res.pathname.split('/').pop();
                if (file.indexOf('.') != -1) {
                    res.file = file;
                } else {
                    if (file != '') {
                        res.pathname += '/';
                    }

                    res.file = '';
                }

                // 获取参数信息
                res.query = res.query || '';
                res.hash = res.hash || '';

                return res;
            },

            parseQuery : function(str, separator) {
                var query = String(str).match(rquery),
                    key,
                    value;

                if (query == null) return {};

                query = query.pop();
                separator = separator || '&';

                return _.reduce(query.split(separator), function(hash, pair) {
                    if (pair.indexOf('=') == -1) return hash;

                    pair = decodeURIComponent(pair).split('=');

                    key = pair.shift();

                    // 如果query中某个变量值包含等号
                    // 我们应该重新组合起来
                    value = pair.join('=');

                    if (value != void 0) {
                        value = value.replace('+', ' ');
                    }

                    return push(hash, key, value);
                }, {});
            },

            parseConfig : function(str) {
                var key = '',
                    hash = {},

                    phase = 2,
                    first,
                    index,

                    stack = [],
                    last = str,

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

                while (str) {
                    first = str.charAt(0);

                    if (first.match(rsign)) {
                        str = str.slice(1);
                        phase = first == ',' ? 0 : 1;

                        continue;
                    } else if (str.charAt(0) == '[') {
                        pushStack();

                        str = str.slice(1);
                        phase = 0;

                        continue;
                    } else if (str.charAt(0) == ']') {
                        popStack();

                        str = str.slice(1);
                        phase = 2;

                        continue;
                    }

                    rterm.lastIndex = 0;

                    switch (phase) {
                        case 0 :
                            // 找key值
                            index = rterm.exec(str) ? rterm.lastIndex : -1;

                            key = parseKey(index < 0 ? str : str.slice(0, index));
                            hash[key] = true;

                            str = str.slice(index);
                            phase = 2;

                            break;

                        case 1 :
                            // 找value值
                            index = rterm.exec(str) ? rterm.lastIndex : -1;

                            hash[key] = parseValue(index < 0 ? str : str.slice(0, index));
                            key = '';

                            str = str.slice(index);
                            phase = 2;

                            break;

                        default :
                            str = str.slice(1);
                            phase = 2;

                            break;
                    }
                }

                while (stack.length) {
                    popStack();
                }

                return hash[key];
            }
        });


        return _.extend(_, utils);

    }]);

});