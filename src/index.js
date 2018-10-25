import Signal from './Signal';
import key from './key';

const create = function() {
	const signal = function signal() {
		return create();
	};
	signal[key] = new Map();
	signal.__proto__ = Signal;
	return signal;
};

// create a pub/sub to expose a signal singleton
const signal = create();

// version
signal.VERSION = '2.0.0';

// expose
export default signal;