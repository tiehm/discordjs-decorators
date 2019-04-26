/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import {
    Client, Collection, Guild, Message, PermissionFlags, Role, Snowflake, TextChannel, User } from 'discord.js';
import { SilentClient } from '../..';
import { Command } from './Command';
import { ICommandOptions } from './typings/ICommandOptions';
import { IOnlyOptions } from './typings/IOnlyOptions';
import { IRateLimit } from './typings/IRateLimit';
import { IVerify } from './typings/IVerify';
import Timer = NodeJS.Timer;

expect.extend({
    toBeLikeDate(received: number, date: number) {

        const pass: boolean = date - received <= 10;

        return {
            pass,
            message: () => {
                if (pass) return `expected ${received} not to be within 10ms range of test`;
                return `expected ${received} to be within 10ms range of test`;
            }
        };
    }
});

describe('Command', () => {

    process.env.XDEVELOPMENT = 'true';

    let cmd: Partial<Command>;
    const base = class CMD extends Command {

        public commandName = 'foobar';

        constructor(options?: ICommandOptions) {
            super(options);
        }

        public async run (...values: Array<unknown>): Promise<IVerify> {
            return {};
        }

    };

    beforeEach(() => {
        cmd = new base();
    });

    test('Initialize with options', () => {
        cmd = new base({
            commandName: 'foobar',
            alias: ['foo', 'bar'],
            only: {
                guild: true,
                dm: false
            },
            ratelimit: {
                timeout: 1,
                times: 1,
                all: true
            },
            extendedVerify: () => ({ syntax: true }),
            userPermissions: ['VIEW_CHANNEL'],
            restricted: {
                roles: [],
                users: []
            },
            desc: 'wow',
            usage: 'just do it',
            ownerOnly: true,
            nsfw: true,
            minRole: 'barfoo',
            hidden: true
        } as ICommandOptions);
    });

    test('Initialize with options [no content]', () => {
        cmd = new base({} as ICommandOptions);
    });

    test('Error as no commandName is given', () => {
        cmd = new base({} as ICommandOptions);
        expect(() => {
            cmd.commandName = undefined;
            cmd._init!({} as SilentClient);
        }).toThrowError(TypeError);
    });

    test('commandName is given', () => {
        cmd.commandName = 'foobar';
        expect(cmd._init!({} as SilentClient)).toMatchObject(cmd);
    });

    describe('Command Execution throttle', () => {

        test('No throttle', () => {
            cmd.ratelimit = {} as IRateLimit;
            cmd.client = { owner: ['x'] } as SilentClient;
            expect(cmd.throttle!('x')).toBeNull();
        });

        test('First use', () => {
            // @ts-ignore
            cmd.client = ({
                owner: 'y', setTimeout: (fn: Function, timeout: number) => 1
            } as Partial<SilentClient>) as SilentClient;
            cmd.ratelimit = { all: false, timeout: 10000, times: 4 };
            expect(cmd.throttle!('x')).toMatchObject({
                // @ts-ignore
                start: expect.toBeLikeDate(Date.now()),
                uses: 0,
                timeout: 1
            });
        });

        test('Exclude the owner', () => {
            // @ts-ignore
            cmd.client = ({
                owner: 'y', setTimeout: (fn: Function, timeout: number) => 1
            } as Partial<SilentClient>) as SilentClient;
            cmd.ratelimit = { all: false, timeout: 10000, times: 4 };
            expect(cmd.throttle!('y')).toBeNull();
        });

    });

    describe('Command Verifier', () => {

        test('Do not run without providing a client', () => {
            expect(cmd.verify!({} as Message)).rejects.toEqual(new Error('Can not use verify without client.'));
        });

        test('Disabled owner commands to users', () => {
            cmd.ownerOnly = true;
            cmd.client = { owner: 'y' } as SilentClient;
            expect(
                cmd.verify!({ author: { id: 'x' } } as Message, { owner: 'y' } as SilentClient)
            ).resolves.toMatchObject({
                owner: true
            });
        });

        describe('Extended Verifier', () => {

            test('non async extension', () => {
                cmd.ownerOnly = false;
                cmd.extendedVerify = (msg) => {
                    if (msg.content === 'foobar') {
                        return {
                            verify: true
                        };
                    }
                    return {
                        verify: false
                    };
                };
                expect(cmd.verify!({ content: 'foobar', author: { id: 'x' } } as Message,
                    ({ client: {} } as Partial<SilentClient>) as SilentClient)).resolves.toMatchObject({
                        verify: true
                    });
            });

            test('async extension', () => {
                cmd.ownerOnly = false;
                cmd.extendedVerify = (msg) => {
                    if (msg.content === 'foobar') {
                        return Promise.resolve({
                            verify: true
                        });
                    }
                    return {
                        verify: false
                    };
                };
                expect(cmd.verify!({ content: 'foobar', author: { id: 'x' } } as Message,
                    ({ client: {} } as Partial<SilentClient>) as SilentClient)).resolves.toMatchObject({
                        verify: true
                    });
            });

            test('extension without a restriction', () => {
                cmd.ownerOnly = false;
                cmd.client = { owner: 'y' } as SilentClient;
                cmd.only = {} as IOnlyOptions;
                cmd.extendedVerify = (msg) => {
                    if (msg.content === 'foobar') {
                        return {};
                    }
                    return {
                        verify: true
                    };
                };
                expect(cmd.verify!({ content: 'foo', author: { id: 'x' } } as Message,
                    ({ client: {} } as Partial<SilentClient>) as SilentClient)).resolves.toMatchObject({
                        verify: true
                    });
            });

            test('async extension without a restriction', () => {
                cmd.ownerOnly = false;
                cmd.client = { owner: 'y' } as SilentClient;
                cmd.only = {} as IOnlyOptions;
                cmd.extendedVerify = (msg) => {
                    if (msg.content === 'foobar') {
                        return Promise.resolve({ verify: true });
                    }
                    return {
                        verify: true
                    };
                };
                expect(cmd.verify!({ content: 'foobar', author: { id: 'x' } } as Message,
                    ({ client: {} } as Partial<SilentClient>) as SilentClient)).resolves.toMatchObject({
                        verify: true
                    });
            });

        });

        describe('Restriction', () => {

            test('user restriction with user id', () => {

                cmd.restricted = { users: ['x'], roles: [] } as {users: string[], roles: string[]};
                cmd.ownerOnly = false;
                cmd.client = {} as SilentClient;
                expect(cmd.verify!(
                    ({ member: {
                        roles: new Collection<Snowflake, Role>() },
                        guild: {} as Guild, author: { id: 'y' } as User } as Partial<Message>) as Message
                )).resolves.toMatchObject({
                    restricted: true
                });

            });

            test('user restriction with role id', () => {

                cmd.restricted = { users: ['y'], roles: ['y'] } as {users: string[], roles: string[]};
                cmd.ownerOnly = false;
                cmd.client = {} as SilentClient;
                expect(cmd.verify!(({
                    member: {
                        roles: (new Collection<Snowflake, Role>()).set('y', {} as Role)
                    }, guild: {} as Guild, author: { id: 'y' } as User
                } as Partial<Message>) as Message)).resolves.toMatchObject({
                    restricted: true
                });

            });

        });

    });

    describe('Ratelimit', () => {

        test('not exceeding threshold', async () => {
            cmd.only = {} as IOnlyOptions;
            // @ts-ignore
            cmd.client = ({
                owner: 'y', setTimeout: (fn: Function, delay: number) => setTimeout(fn, delay)
            } as Partial<SilentClient>) as SilentClient;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify!(({
                author: { id: 'x' } as User,
                channel: ({ id: 'yy',
                    reply: (content: string) => Promise.resolve(content) } as Partial<TextChannel>) as TextChannel
            } as Partial<Message>) as Message);

            expect(cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message)).resolves.toMatchObject({
                channel: false
            });

        });

        test('exceeding threshold and getting a reply', async () => {

            cmd.only = { guild: false, dm: false } as IOnlyOptions;
            // @ts-ignore
            cmd.client = {
                owner: 'y', setTimeout: (fn, delay) => setTimeout(fn, delay), rateLimitExceededError: true
            } as SilentClient;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            // @ts-ignore
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: (content: string) => Promise.resolve(content)
            } as Message);
            // @ts-ignore
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: (content: string) => Promise.resolve(content)
            } as Message);
            // @ts-ignore
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: (content: string) => Promise.resolve(content)
            } as Message);
            // @ts-ignore
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: (content: string) => Promise.resolve(content)
            } as Message);

            const reply = jest.fn(x => x);

            expect(cmd.verify!(({
                reply, author: { id: 'x' } as User, channel: ({ id: 'yy' } as Partial<TextChannel>) as TextChannel
            } as Partial<Message>) as Message)).resolves.toMatchObject({
                throttle: true
            });
            // 51 chars > "This command is throttled for another x.xx seconds."
            expect(reply.mock.calls[0][0]).toHaveLength(51);

        });

        test('exceeding threshold and not getting a reply', async () => {

            cmd.only = { guild: false, dm: false } as IOnlyOptions;
            // @ts-ignore
            cmd.client = {
                owner: 'y',
                setTimeout: (fn: Function, delay: number) => setTimeout(fn, delay), rateLimitExceededError: false
            } as SilentClient;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);

            const reply = jest.fn(x => x);

            // @ts-ignore
            expect(cmd.verify!({
                reply, author: { id: 'x' }, channel: { id: 'yy' }
            } as Message)).resolves.toMatchObject({
                throttle: true
            });

        });

        test('exceeding threshold and not getting a reply and reset after timeout', async (done) => {

            cmd.only = { guild: false, dm: false } as IOnlyOptions;
            // @ts-ignore
            cmd.client = {
                owner: 'y',
                setTimeout: (fn: Function, delay: number) => setTimeout(fn, delay), rateLimitExceededError: false
            } as SilentClient;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);
            await cmd.verify!({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as Message);

            const reply = jest.fn(x => x);

            // @ts-ignore
            expect(cmd.verify!({
                reply, author: { id: 'x' }, channel: { id: 'yy' }
            } as Message)).resolves.toMatchObject({
                throttle: true
            });

            setTimeout(() => {
                expect(cmd.verify!({
                    author: { id: 'x' }, channel: { id: 'yy' }
                } as Message)).resolves.toMatchObject({
                    channel: false
                });
                done();
            }, 6000);

        }, 6100);

    });

    test('user permissions', () => {
        cmd.client = { owner: 'y' } as SilentClient;
        cmd.userPermissions = ['ADMINISTRATOR'] as PermissionFlags[];
        const mockMessage = {
            guild: true,
            member: {
                hasPermissions: jest.fn(perms => !perms)
            }
        };

        // @ts-ignore
        expect(cmd.verify!(mockMessage as Message)).resolves.toMatchObject({
            permission: true
        });
        expect(mockMessage.member.hasPermissions.mock.calls[0][0]).toMatchObject(['ADMINISTRATOR']);

    });

    test('nsfw channel', () => {
        cmd.client = { owner: 'y' } as SilentClient;
        cmd.nsfw = true;
        // @ts-ignore
        expect(cmd.verify!({ channel: { nsfw: false }, guild: true } as Message)).resolves.toMatchObject({
            nsfw: true
        });
    });

    test('guild restricted', () => {

        cmd.client = { owner: 'y' } as SilentClient;
        cmd.only = { guild: true } as IOnlyOptions;
        // @ts-ignore
        expect(cmd.verify!({ guild: false, channel: {} } as Message)).resolves.toMatchObject({
            guild: true
        });

    });

    test('dm restricted', () => {

        cmd.client = { owner: 'y' } as SilentClient;
        cmd.only = { dm: true } as IOnlyOptions;
        // @ts-ignore
        expect(cmd.verify!({ guild: true, channel: {} } as Message)).resolves.toMatchObject({
            dm: true
        });

    });

    describe('min role', () => {

        test('role too low', () => {
            cmd.client = { owner: 'y' } as SilentClient;
            cmd.minRole = 'bar';
            const msg = {
                channel: {},
                guild: {
                    roles: (new Collection()).set('foo', { name: 'bar', id: 'foobar' })
                },
                member: {
                    highestRole: {
                        comparePositionTo: jest.fn(() => -1)
                    }
                }
            };
            // @ts-ignore
            expect(cmd.verify!(msg as Message)).resolves.toMatchObject({
                role: true
            });

            cmd.minRole = 'foobar';
            // @ts-ignore
            expect(cmd.verify!(msg as Message)).resolves.toMatchObject({
                role: true
            });
            expect(msg.member.highestRole.comparePositionTo.mock.calls[0][0]).toMatchObject({
                name: 'bar',
                id: 'foobar'
            });
        });

        test('role high enough', () => {
            cmd.client = { owner: 'y' } as SilentClient;
            cmd.minRole = 'bar';
            cmd.only = {} as IOnlyOptions;
            const msg = {
                channel: {},
                guild: {
                    roles: (new Collection()).set('foo', { name: 'bar', id: 'foobar' })
                },
                member: {
                    highestRole: {
                        comparePositionTo: jest.fn(() => 1)
                    }
                }
            };
            // @ts-ignore
            expect(cmd.verify!(msg as Message)).resolves.toMatchObject({
                channel: false
            });

            cmd.minRole = 'foobar';
            // @ts-ignore
            expect(cmd.verify!(msg as Message)).resolves.toMatchObject({
                channel: false
            });
            expect(msg.member.highestRole.comparePositionTo.mock.calls[0][0]).toMatchObject({
                name: 'bar',
                id: 'foobar'
            });
        });
    });

    test('specific channel restricted', async () => {

        cmd.client = { owner: 'y' } as SilentClient;
        cmd.only = { dm: false, guild: false, x: true };
        // @ts-ignore
        expect(cmd.verify!({ guild: true, channel: { id: 'x' } } as Message)).resolves.toMatchObject({
            channel: false
        });
        // @ts-ignore
        expect(cmd.verify!({ guild: true, channel: { id: 'y' } } as Message)).resolves.toMatchObject({
            channel: true
        });

    });

});
