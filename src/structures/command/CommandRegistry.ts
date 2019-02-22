/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Collection } from 'discord.js';
import { SilentClient } from '../../';
import { logger, Logger } from '../../util/Logger';
import { Command } from './Command';

export class CommandRegistry extends Collection<string, Command> {
    protected client: SilentClient;

    @logger()
    private readonly logger!: Logger;

    constructor(client: SilentClient) {
        super();
        this.client = client;
    }

    /**
     * This should only be used by external libraries
     * @param command {Command}
     */
    public registerExternalCommand(command: Command) {
        this.logger.log(`Loaded external command: ${name}`);
        this.registerInternalCommand(command);
    }

    /**
     * Used for registering commands
     * @private
     * @param command
     */
    public registerInternalCommand(command: Command) {
        this.logger.debug(`Internally registering command ${command.commandName}`);
        if (this.get(command.commandName)) {
            this.logger.debug(`Overwriting command ${command.commandName}`);
            this.delete(command.commandName);
        }

        this.set(command.commandName, command);
        command._init(this.client);
    }

}
