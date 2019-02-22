/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import * as glob from 'glob';
import * as path from 'path';
import { SilentClient } from '../client/SilentClient';
import { Event } from './Event';
import { EventRegistry } from './EventRegistry';

export class EventLoader {

    /**
     * @property {SilentClient} client
     * @private
     * @readonly
     */
    private readonly client: SilentClient;
    /**
     * @property {EventRegistry} events
     * @private
     */
    private events: EventRegistry;

    /**
     * @param client {SilentClient}
     * @constructor
     */
    constructor(client: SilentClient) {
        this.client = client;
        this.events = client.events;
    }

    /**
     * Load all files from a specific path
     * @param pathPattern {String}
     */
    public loadFromPath(pathPattern: string): void {

        const resolvedPath: string = path.resolve(`${this.client.baseDir || ''}${pathPattern}`);
        const files = glob.sync(`${resolvedPath}/**/*.js`);
        const loadedEvents: Event[] = [];

        for (const file of files) {
            delete require.cache[require.resolve(file)];
            const loadedFile = require(file);
            const foundExport = Object.keys(loadedFile);

            if (foundExport.length === 1) {

                // @ts-ignore
                const foundClass: new () => Event =
                          (loadedFile as {[x: string]: unknown})[foundExport[0]] as Event<SilentClient>;
                // TODO: Implement prototype checking, e.g. export can also be a class which is not an event
                if (!foundClass) {
                    console.warn(`File ${file} is in the event directory but is not exporting an event`);
                    continue;
                }
                const foundInstance: Event = new foundClass();
                loadedEvents.push(foundInstance);
            }

            // TODO: Implement more than 1 export

        }

        for (const event of loadedEvents) {
            event._init(this.client);
            this.events.registerEvent(event);
        }

    }

}
