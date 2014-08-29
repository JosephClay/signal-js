$(function() {

    module('Extend');
    test('extend', function() {

        var CustomConstructor = signal.extend(function(arg) {

            this.arg = arg;
            this.isCustom = true;

        }, {
            customFunc: function() {
                return 1;
            }
        });

        ok(CustomConstructor, 'can create a constructor');
        ok(_.isFunction(CustomConstructor), 'constructor is a function');

        var custom = new CustomConstructor(1);
        ok(custom, 'can construct an new instance from constructor');
        ok(custom instanceof CustomConstructor, 'identity of constructor is maintained');

        ok(custom.isCustom, 'custom constructor called');
        ok(custom.arg, 'custom arg was passed');

        var hasCalled = false;
        custom.on('foo', function() { hasCalled = true; });
        custom.trigger('foo');
        ok(hasCalled, 'custom object is a signal');

    });

});