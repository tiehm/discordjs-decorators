/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message, PermissionFlags, Snowflake } from 'discord.js';
import { IVerify } from '../structures/command/typings/IVerify';

/**
 * Set a name for the Command
 * @method Name
 * @param name {String} The name of the command
 * @returns {ClassDecorator}
 */
export function Name(name: string): ClassDecorator {
    return setMetaData('commandName', name);
}

/**
 * Only allow the command to be executed in a guild channel
 * @method GuildOnly
 * @returns {ClassDecorator}
 */

export function Only(...types: string[]): ClassDecorator {

    const x = {};

    for (const type of types) {
        x[type] = true;
    }

    return setMetaData('only', x);
}

/**
 * This extends the default command verifier and the given function runs
 * BEFORE any other part of the verifier runs
 * @method Verify
 * @param func {Function} The custom verifier part you want to use
 * @returns {ClassDecorator}
 */
export function Verify(func: (msg: Message, client?) => IVerify|Promise<IVerify>) {
    return setMetaData('extendedVerify', func);
}

/**
 * Throttles commands to be only usable for x times per y seconds
 * @method Throttle
 * @param interval {Number} The time in seconds
 * @param times {Number} How often the command can be executed in X seconds
 * @param [all] {Boolean} Weather to throttle all (true) users or exclude the owner
 * @returns {ClassDecorator}
 */
export function Throttle(interval: number, times: number, all: boolean = false): ClassDecorator {
    return setMetaData('ratelimit', {
        all,
        times,
        timeout: interval
    });
}

/**
 * Set the aliases for a command
 * @param aliases {String[]} The aliases to apply
 * @returns {ClassDecorator}
 */
export function Alias(...aliases: string[]): ClassDecorator {
    return setMetaData('alias', aliases);
}

/**
 * Limit command execution based on needed user permissions
 * @param perms {PermissionFlags[]} Permission Flags
 * @returns {ClassDecorator}
 */
export function UserPermissions(...perms: PermissionFlags[]): ClassDecorator {
    return setMetaData('userPermissions', perms);
}

/**
 * Restrict the command to users or roles which are added here
 * @param data {{roles: Snowflake[], users: Snowflake[]}}
 * @returns {ClassDecorator}
 */
export function Restricted(data: {roles: Snowflake[], users: Snowflake[]}): ClassDecorator {
    return setMetaData('restricted', data);
}

/**
 * Adding the command description
 * @param desc {String} The Description
 * @returns {ClassDecorator}
 */
export function Description(desc: string): ClassDecorator {
    return setMetaData('desc', desc);
}

/**
 * Adding the Usage of a command
 * @param usage {String} The Usage
 * @returns {ClassDecorator}
 */
export function Usage(usage: string): ClassDecorator {
    return setMetaData('usage', usage);
}

/**
 * Limiting the command to the owner
 * @returns {ClassDecorator}
 */
export function OwnerOnly(): ClassDecorator {
    return setMetaData('ownerOnly', true);
}

/**
 * Limit the command to NSFW channels
 * @returns {ClassDecorator}
 */
export function NSFW(): ClassDecorator {
    return setMetaData('nsfw', true);
}

/**
 * Set a minimum role for command execution
 * @param role {String|Snowflake} Min GetRole
 * @returns {ClassDecorator}
 */
export function MinRole(role: string|Snowflake): ClassDecorator {
    return setMetaData('minRole', role);
}

/**
 * Hide the command from the help message
 * @returns {ClassDecorator}
 */
export function Hidden(): ClassDecorator {
    return setMetaData('hidden', true);
}
/**
 * Private function to set the meta data for each command
 * @param key {string}
 * @param value {*}
 * @private
 * @returns {ClassDecorator}
 */
function setMetaData(key: string, value: any): ClassDecorator {
    return function<T extends Function>(target: T): T {
        Object.defineProperty(target.prototype, key, {
            value,
            enumerable: false,
            configurable: true,
            writable: true
        });
        return target;
    };
}
