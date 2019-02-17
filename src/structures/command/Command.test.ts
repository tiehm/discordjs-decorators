/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Collection, Role, Snowflake } from 'discord.js';
import { Command } from './Command';
import { ICommandOptions } from './typings/ICommandOptions';
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

    let cmd: Command;
    let base;

    afterEach(() => {
        cmd = null;
        base = null;
    });

    beforeEach(() => {
        base = class CMD extends Command {

            public commandName = null;

            constructor(options?) {
                super(options);
            }

            public async run (...values): Promise<IVerify> {
                return undefined;
            }

        };
        cmd = new base() as Command;
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
            extendedVerify: (msg, client) => ({ syntax: true }),
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
        expect(() => {
            cmd._init({} as any);
        }).toThrowError(TypeError);
    });

    test('commandName is given', () => {
        cmd.commandName = 'foobar';
        expect(cmd._init({} as any)).toMatchObject(cmd);
    });

    describe('Command Execution throttle', () => {

        test('No throttle', () => {
            cmd.ratelimit = {} as any;
            cmd.client = { owner: ['x'] } as any;
            expect(cmd.throttle('x')).toBeNull();
        });

        test('First use', () => {
            cmd.client = { owner: 'y', setTimeout: (a, b) => 1 } as any;
            cmd.ratelimit = { all: false, timeout: 10000, times: 4 };
            expect(cmd.throttle('x')).toMatchObject({
                // @ts-ignore
                start: expect.toBeLikeDate(Date.now()),
                uses: 0,
                timeout: 1
            });
        });

        test('Exclude the owner', () => {
            cmd.client = { owner: 'y', setTimeout: (a, b) => 1 } as any;
            cmd.ratelimit = { all: false, timeout: 10000, times: 4 };
            expect(cmd.throttle('y')).toBeNull();
        });

    });

    describe('Command Verifier', () => {

        test('Do not run without providing a client', () => {
            expect(cmd.verify({} as any)).rejects.toEqual(new Error('Can not use verify without client.'));
        });

        test('Disabled owner commands to users', () => {
            cmd.ownerOnly = true;
            cmd.client = { owner: 'y' } as any;
            expect(cmd.verify({ author: { id: 'x' } } as any, { owner: 'y' } as any)).resolves.toMatchObject({
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
                expect(cmd.verify({ content: 'foobar', author: { id: 'x' } } as any,
                    { client: {} } as any)).resolves.toMatchObject({
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
                expect(cmd.verify({ content: 'foobar', author: { id: 'x' } } as any,
                    { client: {} } as any)).resolves.toMatchObject({ verify: true });
            });

            test('extension without a restriction', () => {
                cmd.ownerOnly = false;
                cmd.client = { owner: 'y' } as any;
                cmd.only = {} as any;
                cmd.extendedVerify = (msg) => {
                    if (msg.content === 'foobar') {
                        return {};
                    }
                    return {
                        verify: true
                    };
                };
                expect(cmd.verify({ content: 'foobar', author: { id: 'x' } } as any,
                    { client: {} } as any)).resolves.toMatchObject({ channel: false });
            });

            test('async extension without a restriction', () => {
                cmd.ownerOnly = false;
                cmd.client = { owner: 'y' } as any;
                cmd.only = {} as any;
                cmd.extendedVerify = (msg) => {
                    if (msg.content === 'foobar') {
                        return Promise.resolve({});
                    }
                    return {
                        verify: true
                    };
                };
                expect(cmd.verify({ content: 'foobar', author: { id: 'x' } } as any,
                    { client: {} } as any)).resolves.toMatchObject({ channel: false });
            });

        });

        describe('Restriction', () => {

            test('user restriction with user id', () => {

                cmd.restricted = { users: ['x'], roles: [] } as any;
                cmd.ownerOnly = false;
                cmd.client = {} as any;
                expect(cmd.verify(
                    { member: { roles: new Collection<Snowflake, Role>() }, guild: true, author: { id: 'y' } } as any
                )).resolves.toMatchObject({
                    restricted: true
                });

            });

            test('user restriction with role id', () => {

                cmd.restricted = { users: ['y'], roles: ['y'] } as any;
                cmd.ownerOnly = false;
                cmd.client = {} as any;
                expect(cmd.verify({
                    member: {
                        roles: (new Collection<Snowflake, Role>()).set('y', {} as any)
                    }, guild: true, author: { id: 'y' }
                } as any)).resolves.toMatchObject({
                    restricted: true
                });

            });

        });

    });

    describe('Ratelimit', () => {

        test('not exceeding threshold', async () => {
            cmd.only = {} as any;
            cmd.client = {
                owner: 'y', setTimeout: (fn, delay) => setTimeout(fn, delay)
            } as any;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: content => Promise.resolve(content)
            } as any);

            expect(cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any)).resolves.toMatchObject({
                channel: false
            });

        });

        test('exceeding threshold and getting a reply', async () => {

            cmd.only = { guild: false, dm: false } as any;
            cmd.client = {
                owner: 'y', setTimeout: (fn, delay) => setTimeout(fn, delay), rateLimitExceededError: true
            } as any;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: content => Promise.resolve(content)
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: content => Promise.resolve(content)
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: content => Promise.resolve(content)
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }, reply: content => Promise.resolve(content)
            } as any);

            const reply = jest.fn(x => x);

            expect(cmd.verify({
                reply, author: { id: 'x' }, channel: { id: 'yy' }
            } as any)).resolves.toMatchObject({
                throttle: true
            });
            // 51 chars > "This command is throttled for another x.xx seconds."
            expect(reply.mock.calls[0][0]).toHaveLength(51);

        });

        test('exceeding threshold and not getting a reply', async () => {

            cmd.only = { guild: false, dm: false } as any;
            cmd.client = {
                owner: 'y', setTimeout: (fn, delay) => setTimeout(fn, delay), rateLimitExceededError: false
            } as any;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);

            const reply = jest.fn(x => x);

            expect(cmd.verify({
                reply, author: { id: 'x' }, channel: { id: 'yy' }
            } as any)).resolves.toMatchObject({
                throttle: true
            });

        });

        test('exceeding threshold and not getting a reply and reset after timeout', async (done) => {

            cmd.only = { guild: false, dm: false } as any;
            cmd.client = {
                owner: 'y', setTimeout: (fn, delay) => setTimeout(fn, delay), rateLimitExceededError: false
            } as any;
            cmd.throttled = new Map<Snowflake, { start: number, uses: number, timeout: Timer }>();
            cmd.ratelimit = { all: false, timeout: 5, times: 4 };

            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);
            await cmd.verify({
                author: { id: 'x' }, channel: { id: 'yy' }
            } as any);

            const reply = jest.fn(x => x);

            expect(cmd.verify({
                reply, author: { id: 'x' }, channel: { id: 'yy' }
            } as any)).resolves.toMatchObject({
                throttle: true
            });

            setTimeout(() => {
                expect(cmd.verify({
                    author: { id: 'x' }, channel: { id: 'yy' }
                } as any)).resolves.toMatchObject({
                    channel: false
                });
                done();
            }, 6000);

        }, 6100);

    });

    test('user permissions', () => {
        cmd.client = { owner: 'y' } as any;
        cmd.userPermissions = ['ADMINISTRATOR'] as any;
        const mockMessage = {
            guild: true,
            member: {
                hasPermissions: jest.fn(perms => !perms)
            }
        };

        expect(cmd.verify(mockMessage as any)).resolves.toMatchObject({
            permission: true
        });
        expect(mockMessage.member.hasPermissions.mock.calls[0][0]).toMatchObject(['ADMINISTRATOR']);

    });

    test('nsfw channel', () => {
        cmd.client = { owner: 'y' } as any;
        cmd.nsfw = true;
        expect(cmd.verify({ channel: { nsfw: false }, guild: true } as any)).resolves.toMatchObject({
            nsfw: true
        });
    });

    test('guild restricted', () => {

        cmd.client = { owner: 'y' } as any;
        cmd.only = { guild: true } as any;
        expect(cmd.verify({ guild: false, channel: {} } as any)).resolves.toMatchObject({
            guild: true
        });

    });

    test('dm restricted', () => {

        cmd.client = { owner: 'y' } as any;
        cmd.only = { dm: true } as any;
        expect(cmd.verify({ guild: true, channel: {} } as any)).resolves.toMatchObject({
            dm: true
        });

    });

    describe('min role', () => {

        test('role too low', () => {
            cmd.client = { owner: 'y' } as any;
            cmd.minRole = 'bar';
            const msg = {
                channel: {},
                guild: {
                    roles: (new Collection()).set('foo', { name: 'bar', id: 'foobar' })
                },
                member: {
                    highestRole: {
                        comparePositionTo: jest.fn(role => -1)
                    }
                }
            };
            expect(cmd.verify(msg as any)).resolves.toMatchObject({
                role: true
            });

            cmd.minRole = 'foobar';
            expect(cmd.verify(msg as any)).resolves.toMatchObject({
                role: true
            });
            expect(msg.member.highestRole.comparePositionTo.mock.calls[0][0]).toMatchObject({
                name: 'bar',
                id: 'foobar'
            });
        });

        test('role high enough', () => {
            cmd.client = { owner: 'y' } as any;
            cmd.minRole = 'bar';
            cmd.only = {} as any;
            const msg = {
                channel: {},
                guild: {
                    roles: (new Collection()).set('foo', { name: 'bar', id: 'foobar' })
                },
                member: {
                    highestRole: {
                        comparePositionTo: jest.fn(role => 1)
                    }
                }
            };
            expect(cmd.verify(msg as any)).resolves.toMatchObject({
                channel: false
            });

            cmd.minRole = 'foobar';
            expect(cmd.verify(msg as any)).resolves.toMatchObject({
                channel: false
            });
            expect(msg.member.highestRole.comparePositionTo.mock.calls[0][0]).toMatchObject({
                name: 'bar',
                id: 'foobar'
            });
        });
    });

    test('specific channel restricted', async () => {

        cmd.client = { owner: 'y' } as any;
        cmd.only = { dm: false, guild: false, x: true };
        expect(cmd.verify({ guild: true, channel: { id: 'x' } } as any)).resolves.toMatchObject({
            channel: false
        });
        expect(cmd.verify({ guild: true, channel: { id: 'y' } } as any)).resolves.toMatchObject({
            channel: true
        });

    });

});
