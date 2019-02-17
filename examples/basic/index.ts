import { SilentClient } from '../../src';

const client: SilentClient = new SilentClient({
    owner: 'Owner ID',
    base: true,
    baseDir: 'dist/',
    eventDir: 'events/',
    commandDir: 'commands/',
    waitForMessage: true,
    notFoundError: 'Command not found.',
    mentionPrefix: true,
    prefix: ['-', '!'],
    token: 'Super secret token'
}).start();
