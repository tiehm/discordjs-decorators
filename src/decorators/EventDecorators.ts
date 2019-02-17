/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

/**
 * Initialize the event and run it every time its emitted
 * @param event {string} Event name
 */
export function On(event: string) {
    return setMetaData({ once: false, name: event });
}

/**
 * Initialize the event and run it once
 * @param event {string} Event name
 */
export function Once(event: string) {
    return setMetaData({ once: true, name: event });
}

/**
 * Set values to the Event class
 * @param data
 * @private
 */
export function setMetaData(data: { once: boolean, name: string }): ClassDecorator {

    return function<T extends Function>(target: T): T {
        Object.defineProperty(target.prototype, 'eventName', {
            value: data.name,
            configurable: true,
            enumerable: true,
            writable: true,
        });
        Object.defineProperty(target.prototype, 'once', {
            value: data.once,
            configurable: true,
            enumerable: true,
            writable: true,
        });
        return target;
    };
}
