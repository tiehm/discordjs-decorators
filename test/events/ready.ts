/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Event, logger, Logger, Once } from '../../dist';

@Once('ready')
export class Ready extends Event {

    @logger()
    public logger: Logger;

    public run() {
        this.logger.log(`Logged in as ${this.client.user.tag}`);
    }

}
