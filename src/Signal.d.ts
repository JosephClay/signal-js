type listener = (
    eventName: string,
    listener: (...args: any[]) => any) => Signal

export interface Signal {
    on: listener
    off: listener
    once: listener
    emit: (eventName: string, ...arg?: any[]) => Signal
    listeners: (name: string) => Signal
    names: () => string[]
    size: () => number
    clear: (eventName: string) => Signal
}
declare const proto: Signal

export default proto