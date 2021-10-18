export const multiple = (fns, args) => {
	for (const fn of fns) fn(...args);
};

export const single = (fns, arg) => {
	for (const fn of fns) fn(arg);
};