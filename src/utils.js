var id = 0;

module.exports = {
    /**
     * Unique Id
     * @type {Number}
     */
    uniqueId: function() {
        return id++;
    },

    /**
     * Object merger
     * @param {Objects}
     * @return {Object}
     */
    extend: function(base) {
        var args = arguments,
            idx = 1, length = args.length,
            key, merger;
        for (; idx < length; idx++) {
            merger = args[idx];

            for (key in merger) {
                base[key] = merger[key];
            }
        }

        return base;
    }
};