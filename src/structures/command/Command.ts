/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message, PermissionFlags, PermissionResolvable, Role, Snowflake, TextChannel } from 'discord.js';
import { SilentClient } from '../../';
import { ICommandOptions } from './typings/ICommandOptions';
import { IOnlyOptions } from './typings/IOnlyOptions';
import { IRateLimit } from './typings/IRateLimit';
import { IVerify } from './typings/IVerify';
import Timer = NodeJS.Timer;

/**
 * The Command class to create and initialise new commands
 * @abstract
 */
export abstract class Command<S extends SilentClient = SilentClient> {

    /**
     * The base name of the command. This is used in error message about the command and to find it.
     * @property {String} commandName - The name of the command
     * @public
     */
    public commandName!: string;

    /**
     * An array of aliases for the command.
     * @property {String[]} alias - An array of command aliases
     * @public
     */
    public alias!: string[];

    /**
     * Restricting the command usage to specific regions like guild, dm, etc
     * @property {IOnlyOptions} only - Object of restricting attributes
     * @public
     */
    public only!: IOnlyOptions;

    /**
     * Ratelimit information
     * @namespace
     * @property {Object} ratelimit - Holding information about the ratelimit options
     * @property {Number} ratelimit.times - How often a command can be used within x interval
     * @property {Number} ratelimit.timeout - The interval between clearing the data
     * @property {Boolean} ratelimit.all - Weather to include owners in the ratelimit
     * @public
     */
    public ratelimit!: IRateLimit;

    /**
     * Additional verify function to inhibit command usage.
     * @property {?Function} extendedVerify - An extending verify function
     * @public
     */
    public extendedVerify!: (msg: Message, client: S) => IVerify | Promise<IVerify>;

    /**
     * Restricting command to users who do not have set permissions.
     * @property {PermissionFlags[]} userPermissions - Holding required permissions for users to have
     * @public
     */
    public userPermissions!: PermissionFlags[];

    /**
     * Restricting command to specific roles or users
     * @property {{roles: Snowflake[], users: Snowflake[]}} restricted - information about how is able to use a cmd
     * @public
     */
    public restricted!: {roles: Snowflake[], users: Snowflake[]};

    /**
     * The description of the command
     * @property {string} desc - Description of command
     */
    public desc!: string;

    /**
     * Example usage of the command
     * @property {string} usage - Usage of command
     */
    public usage!: string;

    /**
     * Restricting the command to the owner
     * @property {boolean} ownerOnly
     */
    public ownerOnly!: boolean;

    /**
     * Restricting the command to NSFW channels
     * @property {boolean} nsfw
     */
    public nsfw!: boolean;

    /**
     * The category of a command
     * @property {string} category
     */
    public category!: string;

    /**
     * Setting a minimum role (in hierarchy) for command execution
     * @property {string|Snowflake} minRole
     */
    public minRole!: string|Snowflake;

    /**
     * Hide the command from the default help message
     * @property {boolean} hidden
     */
    public hidden!: boolean;

    /**
     * @property {String} _className
     * @private
     */
    public _className!: string;

    /**
     * @property {Object} client - The client instance
     * @public
     */
    public client!: S;
    /**
     * @namespace ThrottleObject
     * @property {Number} ThrottleObject.start - Start of the throttling process
     * @property {Number} ThrottleObject.uses - Command uses since start
     * @property {Timer} ThrottleObject.timeout - The timeout function to delete this object after the interval
     */
    /**
     * Map of current throttles
     * @property {Map<Snowflake, ThrottleObject>} - Storage of the ratelimit
     * @protected
     */
    public throttled: Map<Snowflake, {
        start: number; uses: number, timeout: Timer;
    }> = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();

    protected constructor (options?: ICommandOptions) {
        if (options) {
            if (options.commandName) this.commandName = options.commandName;
            if (options.alias) this.alias = options.alias;
            if (options.only) this.only = options.only;
            else this.only = { guild: false, dm: false };
            if (options.extendedVerify) this.extendedVerify = options.extendedVerify;
            if (options.ratelimit) this.ratelimit = options.ratelimit;
            if (options.userPermissions) this.userPermissions = options.userPermissions;
            if (options.restricted) this.restricted = options.restricted;
            if (options.desc) this.desc = options.desc;
            if (options.usage) this.usage = options.usage;
            if (options.ownerOnly) this.ownerOnly = true;
            if (options.nsfw) this.nsfw = true;
            if (options.minRole) this.minRole = options.minRole;
            if (options.hidden) this.hidden = true;
            if (options.category) this.category = options.category;
        }
    }

    /**
     * Initializes the command to set all needed properties and check the configurations for errors
     * @param client - The client object
     * @returns {Command}
     * @private
     */
    public _init (client: S): this {
        this.client = client;
        if (!this.commandName) throw new TypeError('Cannot initiate command without a name.');
        if (!this.usage) this.usage = '';
        if (this.alias === undefined) this.alias = [];
        return this;
    }

    /**
     * Get the current status of a user's ratelimit
     * @param userID {Snowflake} The user ID of the person to limit
     * @returns {ThrottleObject}
     * @public
     */
    public throttle (userID: Snowflake): {
        start: number; uses: number, timeout: Timer;
    }|null {
        if (!this.ratelimit.all && (this.client.owner.includes(userID) || !this.ratelimit)) return null;

        let throttleObj = this.throttled.get(userID);
        if (!throttleObj) {
            throttleObj = {
                start: Date.now(),
                uses: 0,
                timeout: this.client.setTimeout(() => {
                    this.throttled.delete(userID);
                }, this.ratelimit.timeout * 1000)
            };
            this.throttled.set(userID, throttleObj);
        }

        return throttleObj;

    }

    /**
     * This is used to verify that the command is a valid command and all requirements for it are met
     * You can customize this with the @VerifyExtend decorator
     * @param msg {Message}
     * @param [client] {Object} The client object
     * @returns {Promise<Boolean>}
     * @public
     */
    public async verify (msg: Message, client?: S): Promise<IVerify> {

        if (!client && !this.client) throw new Error('Can not use verify without client.');
        if (client) this.client = client;

        if (this.ownerOnly && msg.author.id !== client!.owner) return { owner: true };

        if (this.extendedVerify !== undefined) {
            let extendedResult: IVerify = this.extendedVerify(msg, this.client) as IVerify;
            if (extendedResult.constructor.name === 'Promise') {
                extendedResult = await extendedResult;
            }
            if (typeof extendedResult === 'object' &&
                Object.values(extendedResult).includes(true)) {
                return extendedResult;
            }
        }

        if (this.restricted &&
            (!this.restricted.users.includes(msg.author.id) ||
                (msg.guild && !msg.member.roles.some(r => this.restricted.roles.includes(r.id))))
        ) return { restricted: true };

        if (this.ratelimit) {
            const throttle = this.throttle(msg.author.id);
            throttle!.uses++;
            if (throttle && throttle.uses > this.ratelimit.times) {
                if (this.client.rateLimitExceededError) {
                    const timeout = (throttle.start + (this.ratelimit.timeout * 1000) - Date.now()) / 1000;
                    await msg.reply(`This command is throttled for another ${timeout.toFixed(2)} seconds.`);
                }
                return { throttle: true };
            }
        }

        if (msg.guild &&
            this.userPermissions &&
            !msg.member.hasPermissions(this.userPermissions as PermissionResolvable)
        ) {
            return { permission: true };
        }
        if (msg.guild && !(msg.channel as TextChannel).nsfw && this.nsfw) return { nsfw: true };
        if (msg.guild && this.minRole) {
            const role: Role = msg.guild.roles.find(r =>
                r.name.toLowerCase() === this.minRole.toLowerCase() ||
                r.id === this.minRole);
            if (msg.member.highestRole.comparePositionTo(role) < 0) {
                return { role: true };
            }
        }

        if (this.only && this.only.guild && !msg.guild) return { guild: true };
        if (this.only && this.only.dm && msg.guild) return { dm: true };

        const temp: Snowflake[] = (this.only &&
            Object.keys(this.only).filter(value => value !== 'guild' && value !== 'dm')) || [];

        return { channel: temp.length > 0 && !temp.includes(msg.channel.id) };
    }

    /**
     * Run the command
     * @param values {*[]}
     * @abstract
     * @public
     */
    public abstract async run(...values: Array<unknown>): Promise<IVerify>;

}
