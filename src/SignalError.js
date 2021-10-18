import key from './key';
import { single, multiple } from './caller';

class SignalError extends Error {}

export default function SignalErrorFactory(method, message) {
	return new SignalError(`.${method}: ${message}`);
};