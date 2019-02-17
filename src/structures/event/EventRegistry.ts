/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Collection } from 'discord.js';
import { SilentClient } from '../..';
import { Event } from './Event';

export class EventRegistry extends Collection<string, Event> {

    /**
     * @property {SilentClient} client
     * @protected
     */
    protected client: SilentClient;

    /**
     * @param client {SilentClient}
     * @constructor
     */
    constructor(client: SilentClient) {
        super();
        this.client = client;
    }

    /**
     * Used for registering events.
     * @param event {Event}
     * @private
     */
    public registerEvent(event: Event) {
        // Deleting the existing event if it is loading again
        if (this.get(event.eventName)) this.delete(event.eventName);

        this.set(event.eventName, event);
        event._init(this.client);
        this.client.on(event.eventName, event.run.bind(event));
    }

}
