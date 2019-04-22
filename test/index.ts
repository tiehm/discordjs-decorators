/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { SilentClient } from '../dist';
import * as config from './config';

process.env.PRODUCTION = 'true';

const bot: SilentClient = new SilentClient({
    token: config.token,
    owner: '193394584271847425',
    commandDir: 'commands/',
    eventDir: 'events/',
    baseDir: 'test/',
    baseCommands: true,
    defaultHelpCommand: false,
    prefix: ['-', 's!', '?!'],
    mentionPrefix: true,
    logLevel: 'DEBUG'
}).connect();
