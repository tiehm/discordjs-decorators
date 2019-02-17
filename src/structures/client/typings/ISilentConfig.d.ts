/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Snowflake } from 'discord.js';

export interface ISilentConfig {
    owner: Snowflake|Snowflake[];
    prefix?: string|string[];
    mentionPrefix?: boolean;
    defaultPrefix?: string|'mention';
    baseDir?: string;
    commandDir: string;
    eventDir: string;
    token: string;
    baseCommands?: boolean;
    commandNotFoundError?: string;
    rateLimitExceededError?: boolean;
    logLevel?: 'DEBUG'|'ALL'|'WARN'|'ERROR';
    defaultHelpCommand?: {showAll: boolean}|false;
}
