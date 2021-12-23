type listener = (
    name: string,
    fn: () => any) => Signal

export interface Signal {
    on: listener
    off: listener
    once: listener
    emit: (name: string, ...arg?: any[]) => Signal
    listeners: (name: string) => Signal
    names: () => string[]
    size: () => number
    clear: (name: string) => Signal
}
declare const proto: Signal

export default proto