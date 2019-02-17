/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message } from 'discord.js';
import { Event, logger, Logger, On } from '../../dist';
@On('message')
export class MessageEvent extends Event {

    @logger()
    public logger: Logger;

    public async run(msg: Message) {
        if (msg.content.toLowerCase().includes('wow')) return false;
        return true;
    }

}
