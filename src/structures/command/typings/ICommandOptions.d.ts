/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message, PermissionFlags, Snowflake } from 'discord.js';
import { SilentClient } from '../../..';
import { IOnlyOptions } from './IOnlyOptions';
import { IVerify } from './IVerify';

export interface ICommandOptions {
    commandName: string;
    alias?: string[];
    only: IOnlyOptions;
    ratelimit?: {
        times: number;
        timeout: number;
        all: boolean;
    };
    extendedVerify?: (msg: Message, client: SilentClient) => IVerify|Promise<IVerify>;
    userPermissions: PermissionFlags[];
    restricted: {roles: Snowflake[], users: Snowflake[]};
    desc: string;
    usage: string;
    ownerOnly: boolean;
    nsfw: boolean;
    minRole: string|Snowflake;
    hidden: boolean;
    category: string;
}
