var extend = require('./extend'),
    Signal = require('./Signal');

/**
 * Klass-like extend method
 * @param  {Function} constructor
 * @param  {Object} extension   prototype extension
 * @return {Function} constructor
 */
module.exports = function(constructor, extension) {
    var hasConstructor = (typeof constructor === 'function');
    if (!hasConstructor) { extension = constructor; }

    var fn = function() {
            var ret = Signal.apply(this, arguments);
            if (hasConstructor) {
                ret = constructor.apply(this, arguments);
            }
            return ret;
        };

    // Add properties to the object
    extend(fn, Signal);

    // Duplicate the prototype
    var NoOp = function() {};
    NoOp.prototype = Signal.prototype;
    fn.prototype = new NoOp();

    // Merge the prototypes
    extend(fn.prototype, Signal.prototype, extension);
    fn.prototype.constructor = constructor || fn;

    return fn;
};