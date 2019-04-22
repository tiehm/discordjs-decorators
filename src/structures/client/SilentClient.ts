/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Client, ClientOptions, Snowflake } from 'discord.js';
import { ConfigError } from '../../util/ConfigError';
import { Listener } from '../../util/Listener';
import { logger, Logger } from '../../util/Logger';
import { CommandLoader } from '../command/CommandLoader';
import { CommandRegistry } from '../command/CommandRegistry';
import { EventLoader } from '../event/EventLoader';
import { EventRegistry } from '../event/EventRegistry';
import { ISilentConfig } from './typings/ISilentConfig';

/**
 * The SilentClient class
 * @extends Client
 * @class
 */
export class SilentClient extends Client {

    // Configurable options
    /**
     * @property {Snowflake|Snowflake[]} owner
     * @public
     */
    public owner: Snowflake|Snowflake[];
    /**
     * @property {String|String[]} prefix
     * @public
     */
    public prefix?: string|string[];
    /**
     * @property {Boolean} mentionPrefix
     * @public
     */
    public mentionPrefix?: boolean;
    /**
     * @property {String} commandDir
     * @public
     */
    public commandDir: string;
    /**
     * @property {String} eventDir
     * @public
     */
    public eventDir: string;
    /**
     * @property {String} baseDir="dist/"
     * @public
     */
    public baseDir: string = 'dist/';
    /**
     * @property {Boolean} baseCommands=true
     * @public
     */
    public baseCommands: boolean = true;
    /**
     * @property {String} commandNotFoundError
     * @public
     */
    public commandNotFoundError?: string;
    /**
     * @property {Boolean} rateLimitExceededError=true
     * @public
     */
    public rateLimitExceededError: boolean = true;

    /**
     * @property {{showAll: boolean}} defaultHelpCommand
     * @public
     */
    public defaultHelpCommand: {showAll: boolean}|false = { showAll: false };

    /**
     * @property {String|'mention'} defaultPrefixForce
     * @public
     */
    public defaultPrefixForce!: string|'mention';
    // Internal
    /**
     * @property {CommandRegistry} commands
     * @public
     */
    public commands!: CommandRegistry;
    /**
     * @property {EventRegistry} events
     * @public
     */
    public events!: EventRegistry;

    /**
     * This is named _token as token is already used by discord.js itself
     * @property {String} _token
     * @private
     * @readonly
     */
    private readonly _token: string;
    @logger()
    private readonly _logger!: Logger;

    constructor(silent: ISilentConfig, config?: ClientOptions) {
        super(config);

        process.env.LOGLEVEL = silent.logLevel || 'WARN';

        if (silent.prefix) this.prefix = silent.prefix;
        if (silent.mentionPrefix !== undefined) this.mentionPrefix = silent.mentionPrefix;
        if (silent.baseDir) this.baseDir = silent.baseDir;
        if (silent.baseCommands !== undefined) this.baseCommands = silent.baseCommands;
        if (silent.commandNotFoundError) this.commandNotFoundError = silent.commandNotFoundError;
        if (silent.rateLimitExceededError !== undefined) this.rateLimitExceededError = silent.rateLimitExceededError;
        if (silent.defaultHelpCommand === false || silent.defaultHelpCommand) {
            this.defaultHelpCommand = silent.defaultHelpCommand;
        }
        if (silent.defaultPrefix) this.defaultPrefixForce = silent.defaultPrefix;

        this._token = silent.token;
        this.owner = silent.owner;
        this.commandDir = silent.commandDir;
        this.eventDir = silent.eventDir;

        this.checkConfig();

        if (!process.env.DEVELOPMENT) {
            this.commands = new CommandRegistry(this);
            const commandLoader = new CommandLoader(this);
            if (this.baseDir) commandLoader.loadFromPath(null, true);
            commandLoader.loadFromPath(this.commandDir, false);

            this.events = new EventRegistry(this);
            const eventLoader = new EventLoader(this);
            eventLoader.loadFromPath(this.eventDir);
        }

        const listener: Listener = new Listener(this, true);
        this.on('message', listener.handleMessageEvent.bind(listener));

    }

    /**
     * Connect to the Discord API
     */
    public connect(): this {
        this._logger.debug('Trying to log in');
        this.login(this._token).then(() => {
            this._logger.debug('Successfully logged in');
        }).catch((err) => {
            this._logger.error(new ConfigError(err.message));
            process.exit(1);
        });
        return this;
    }

    /**
     * If multiple prefixes are set, this gets the default prefix.
     */
    public get defaultPrefix(): string {
        if (this.defaultPrefixForce) return this.defaultPrefixForce;
        if (Array.isArray(this.prefix)) return this.prefix[0];
        if (!this.prefix && this.mentionPrefix) return `<@${this.user.id}>`;
        return this.prefix as string;
    }

    /**
     * Checking the configurations
     * @throws ConfigError
     * @private
     */
    // TODO: Check all configs
    public checkConfig(): void {

        this._logger.debug('Checking SilentConfig');

        if ((!this.prefix && !this.mentionPrefix) || (!Array.isArray(this.prefix) && typeof this.prefix !== 'string')) {
            this._logger.error(new ConfigError('A prefix or mention prefix has to be set.'));
            process.exit(1);
        }

        if (!this.owner || (!Array.isArray(this.owner) && typeof this.owner !== 'string')) {
            this._logger.error(new ConfigError('The owner property has to be set.'));
            process.exit(1);
        }

        if (!this.commandDir || typeof this.commandDir !== 'string') {
            this._logger.error(new ConfigError('The commandDir property has to bet set.'));
            process.exit(1);
        }

        if (!this.eventDir || typeof this.eventDir !== 'string') {
            this._logger.error(new ConfigError('The eventDir property has to be set'));
            process.exit(1);
        }

        if (!this._token || typeof this._token !== 'string') {
            this._logger.error(new ConfigError('The token has to be set.'));
            process.exit(1);
        }

        this._logger.debug('SilentConfig Check done');

    }

}
