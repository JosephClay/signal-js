/**
 * Holds cached, parsed event keys by string
 * @type {Object}
 */
var cache = {};

var parse = function(name) {
    var index = name.indexOf('.');
    
    if (index === -1) {
        return {
            e: name,
            ns: '',
            hasNs: false,
        };
    }

    return {
        e: name.substr(0, index),
        ns: name.substr(index + 1).split('.').sort().join('.'),
        hasNs: true
    };
};

module.exports = function(name) {
    return cache[name] || (cache[name] = parse(name));
};