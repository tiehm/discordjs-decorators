/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Snowflake } from 'discord.js';
import { argumentStore } from '../util/ArgumentMetadata';

/**
 * Get the arguments from the message content
 * @param [splitter] {RegExp}
 */
export function Args(splitter: RegExp = / +/g) {
    return function (target: Object, key: string, index: number) {
        argumentStore.push({
            index,
            value: msg => msg.content.trim().split(splitter).slice(1),
            name: target.constructor.name.toLowerCase()
        });
    };
}

/**
 * Get the message Object
 */
export function Msg() {
    return function (target: Object, key: string, index: number) {
        argumentStore.push({
            index, value: msg => msg, name: target.constructor.name.toLowerCase()
        });
    };
}

/**
 * Get the roles of the message author
 */
export function Roles() {
    return function (target: Object, key: string, index: number) {
        argumentStore.push({
            index,
            value: msg => msg.guild ? msg.member.roles
                  : console.warn('You can only use the @Roles decorator with the @GuildOnly command decorator.'),
            name: target.constructor.name.toLowerCase()
        });
    };
}

/**
 * Get a specific role from a user
 * @param role {String|Snowflake} The role ID or role name
 */
export function GetRole(role: string|Snowflake) {
    return function (target: Object, key: string, index: number) {
        argumentStore.push({
            index,
            value: (msg) => {
                if (!msg.member) return null;
                return msg.member.roles.find(r => r.id === role || r.name.toLowerCase() === role.toLowerCase());
            },
            name: target.constructor.name.toLowerCase()
        });
    };
}
