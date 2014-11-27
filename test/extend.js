var _ = require('underscore'),
    signal = require('../src');

exports.Extend = function(test) {
    test.expect(7);

    var CustomConstructor = signal.extend(function(arg) {

        this.arg = arg;
        this.isCustom = true;

    }, {
        customFunc: function() {
            return 1;
        }
    });

    test.ok(CustomConstructor, 'can create a constructor');
    test.ok(_.isFunction(CustomConstructor), 'constructor is a function');

    var custom = new CustomConstructor(1);
    test.ok(custom, 'can construct an new instance from constructor');
    test.ok(custom instanceof CustomConstructor, 'identity of constructor is maintained');

    test.ok(custom.isCustom, 'custom constructor called');
    test.ok(custom.arg, 'custom arg was passed');

    var hasCalled = false;
    custom.on('foo', function() { hasCalled = true; });
    custom.trigger('foo');
    test.ok(hasCalled, 'custom object is a signal');

    test.done();
};