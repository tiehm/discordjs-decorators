/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

export class ConfigError extends Error {

    /**
     * @property {String} [name="ConfigError"]
     * @public
     */
    public name = 'ConfigError';

    constructor (msg: string) {
        super(msg);
    }

}
