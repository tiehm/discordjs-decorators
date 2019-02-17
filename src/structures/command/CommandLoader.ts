/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import * as glob from 'glob';
import * as path from 'path';
import { SilentClient } from '../..';
import { logger, Logger } from '../../util/Logger';
import { Command } from './Command';
import { CommandRegistry } from './CommandRegistry';

export class CommandLoader {

    @logger()
    private readonly logger: Logger;
    private readonly client: SilentClient;
    private commands: CommandRegistry;

    constructor(client: SilentClient) {
        this.client = client;
        this.commands = client.commands;
    }

    public loadFromPath(pathPattern: string, baseCommands: boolean = true): void {

        this.logger.debug(`Starting to load commands from ${pathPattern}, including baseCommands: ${baseCommands}`);
        const resolvedPath: string = path.resolve(baseCommands ?
                                                  `${__dirname}/base` :
                                                  `${this.client.baseDir || ''}${pathPattern}`);
        const files = glob.sync(`${resolvedPath}/**/*.js`);
        this.logger.debug(`Found ${files.length} commands to load`);
        let loadedCommands: Command[] = [];

        for (const file of files) {
            this.logger.debug(`Loading ${file}`);
            delete require.cache[require.resolve(file)];
            const loadedFile = require(file) as any;
            const foundExport = Object.keys(loadedFile);

            if (foundExport.length === 1) {
                const foundClass: new () => Command = loadedFile[foundExport[0]];
                if (!foundClass) {
                    this.logger.warn(`File ${file} is in the commands directory but is not exporting a command`);
                    continue;
                }
                const foundInstance: Command = new foundClass();
                // Defining the class name within the command class
                // This is used for the method decorators as they have no access
                // To the defined/custom command name set by a decorator
                Object.defineProperty(foundInstance, '_className', {
                    value: foundClass.name,
                    enumerable: true,
                    writable: false,
                    configurable: false
                });
                loadedCommands.push(foundInstance);
            } else this.logger.debug(`Could not find any export on file ${file}`);

            // TODO: Implement more than 1 export (type checking)

        }

        if (loadedCommands.length === 0) this.logger.error(new Error('Could not load any commands'));
        if (!this.client.defaultHelpCommand) {
            loadedCommands = loadedCommands.filter(value => value.commandName !== 'help');
        }
        for (const command of loadedCommands) {
            this.logger.debug(`Registering command ${command.commandName}`);
            this.client.commands.registerInternalCommand(command);
        }

    }

}
