import Benchmark from 'benchmark';
import signal from '../src';

const suite = new Benchmark.Suite();
const randStr = () => Math.random().toString().split('.')[1];
const staticEvent = 'foo';
signal.on(staticEvent, () => {});

suite
	.add('signal#on', function() {
		signal.on(randStr(), () => {});
	})
	.add('signal#off', function() {
		signal.off(randStr());
	})
	.add('signal#trigger', function() {
		signal.trigger(staticEvent, Math.random());
	})
	.on('cycle', function(event) {
		console.log(String(event.target));
	})
	.run();