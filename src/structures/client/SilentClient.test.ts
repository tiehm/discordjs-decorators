/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { SilentClient } from './SilentClient';

describe('SilentClient', () => {

    let client: SilentClient;

    beforeEach(() => {
        client = new SilentClient({
            token: 'DISCORD_TOKEN',
            owner: 'DISCORD_OWNER',
            prefix: 'PREFIX',
            commandDir: 'commands/',
            eventDir: 'events/',
            commandNotFoundError: 'Sorry, this command does not exist.',
            mentionPrefix: true,
            baseCommands: true,
            rateLimitExceededError: true,
            baseDir: './base-dir',
            logLevel: 'ALL',
            defaultHelpCommand: { showAll: true }
        });
    });

    test('should return owned id for #owner', () => {
        expect(client.owner).toEqual('DISCORD_OWNER');
    });

    test('should call #login with token', (done) => {
        expect.assertions(1);
        // @ts-ignore
        client.login = async function (token: string) {
            expect(token).toEqual('DISCORD_TOKEN');
            done();
        };

        client.connect();
    });

    test('should return prefix if its string', () => {
        expect(client.defaultPrefix).toEqual('PREFIX');
    });

    test('should return first prefix if its array', () => {
        client.prefix = ['foo', 'bar'];
        expect(client.defaultPrefix).toEqual('foo');
    });

    test('should return prefix as user serialized if its a user', () => {
        client.prefix = undefined;
        client.mentionPrefix = true;
        // @ts-ignore
        client.user = { id:'CLIENT_USER' };

        expect(client.defaultPrefix).toEqual('<@CLIENT_USER>');
    });

});
