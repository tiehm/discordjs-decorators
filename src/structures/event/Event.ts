/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { SilentClient } from '../../structures/client/SilentClient';
import { ConfigError } from '../../util/ConfigError';

export abstract class Event<S extends SilentClient = SilentClient> {

    /**
     * @property {Object} client
     * @public
     */
    public client: S;
    /**
     * @property {String} eventName
     * @public
     */
    public eventName: string;
    /**
     * @property {Boolean} once
     * @public
     */
    public once: boolean;

    /**
     * Create a new Event
     * @param options
     * @protected
     */
    protected constructor(options?: {
        once: boolean,
        name: string
    }) {
        if (options) {
            this.once = options.once;
            this.eventName = options.name;
        }
    }

    /**
     * Initiate an event
     * @param client {Object}
     * @private
     */
    public _init(client: S) {
        this.client = client;
        if (!this.eventName) throw new ConfigError('Cannot initiate Event without a specified name.');
    }

    /**
     * Run/Execute an event
     * @param args {*[]}
     */
    public abstract run(...args: any[]);

}
