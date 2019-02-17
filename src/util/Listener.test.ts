/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Collection } from 'discord.js';
import { argumentStore } from './ArgumentMetadata';
import { Listener } from './Listener';

describe('Listener', () => {

    let listener: Listener;

    afterEach(() => {
        listener = null;
    });

    describe('handle message event', () => {

        describe('custom message event', () => {

            test('Return from custom message event [normal]', () => {

                listener = new Listener({
                    events: new Collection().set('message', {
                        run: (msg) => {
                            return !msg.test;
                        }
                    })
                } as any);
                expect(listener.handleMessageEvent({ test: true } as any)).resolves.toBe(false);

            });

            test('Return from custom message event [promise]', () => {

                listener = new Listener({
                    events: new Collection().set('message', {
                        run: (msg) => {
                            return Promise.resolve(!msg.test);
                        }
                    })
                } as any);
                expect(listener.handleMessageEvent({ test: true } as any)).resolves.toBe(false);

            });

        });

        describe('command not found', () => {

            listener = new Listener({
                commandNotFoundError: 'not found',
                events: new Collection()
            } as any);
            listener._findCommandInMessage = jest.fn(() => false);

            const msg = {
                content: 'foobar',
                reply: jest.fn()
            } as any;

            expect(listener.handleMessageEvent(msg)).resolves.toBe(false);
            expect(msg.reply.mock.calls[0][0]).toBe('not found');
            expect((listener._findCommandInMessage as any).mock.calls[0][0]).toMatchObject(msg);

        });

        describe('verify command', () => {

            test('failed verification [channel]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                channel: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('This command can not be used in this channel.');

            });

            test('failed verification [dm]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                dm: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('This command can only be used within DMs.');

            });

            test('failed verification [guild]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                guild: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('This command can only be used within guilds.');

            });

            test('failed verification [nsfw]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                nsfw: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('This command can only be used in NSFW channels.');

            });

            test('failed verification [owner]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                owner: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('This command can only be used by the Bot Owner.');

            });

            test('failed verification [permission]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                permission: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('You do not have enough permissions to use this command.');

            });

            test('failed verification [restricted]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                restricted: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('You can not use this command.');

            });

            test('failed verification [role]', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                role: true
                            };
                        }
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe('Your role is too low to use this command.');

            });

            test('failed verification [syntax]', () => {

                listener = new Listener({
                    events: new Collection(),
                    defaultPrefix: '!'
                } as any);
                listener._findCommandInMessage = (): any => {
                    return {
                        verify () {
                            return {
                                syntax: true
                            };
                        },
                        commandName: 'foobar',
                        usage: '[use it]'
                    };
                };
                const msg = {
                    reply: jest.fn()
                };

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(false);
                expect(msg.reply.mock.calls[0][0]).toBe(
                    'You used this command in the wrong way.\nSyntax: `!foobar [use it]`.');

            });

        });

        describe('running command', () => {

            test('with argumentStore', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                const run = jest.fn();
                listener._findCommandInMessage = (): any => {
                    return {
                        run,
                        verify () {
                            return {};
                        },
                        _className: 'foo'
                    };
                };
                const msg = {
                    content: 'x'
                };
                argumentStore.push({
                    name: 'foo',
                    index: 0,
                    value: _ => 'X'
                });
                argumentStore.push({
                    name: 'foo',
                    index: 1,
                    value: _ => 'Y'
                });

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(true);
                expect(run.mock.calls[0][0]).toBe('X');
                expect(run.mock.calls[0][1]).toBe('Y');

            });

            test('default handle', () => {

                listener = new Listener({
                    events: new Collection()
                } as any);
                const run = jest.fn();
                listener._findCommandInMessage = (): any => {
                    return {
                        run,
                        verify () {
                            return {};
                        },
                        _className: 'foo'
                    };
                };
                const msg = {
                    content: '!test this command'
                };
                // @ts-ignore
                argumentStore = [];

                expect(listener.handleMessageEvent(msg as any)).resolves.toBe(true);
                expect(run.mock.calls[0][0]).toMatchObject(msg);
                expect(run.mock.calls[0][1]).toMatchObject(['this', 'command']);

            });

        });

    });

    describe('find command in message', () => {

        describe('find with singular prefix', () => {

            test('find the command', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '!test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');
            });

            test('find the command by alias', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', { alias: 'yeet' })
                } as any);

                expect(listener._findCommandInMessage({
                    content: '!yeet this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toMatchObject({ alias: 'yeet' });
            });

            test('find the command with spaces around', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '! test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');
            });

            test('test a message without the prefix', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: 'test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBeNull();
            });

            test('test a message with the wrong prefix', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '!!test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBeNull();
            });

        });

        describe('find command with mention', () => {

            test('find command', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '<@CLIENT> test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');
            });

            test('find command with alias', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', { alias: 'yeet' })
                } as any);

                expect(listener._findCommandInMessage({
                    content: '<@CLIENT> yeet this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toMatchObject({ alias: 'yeet' });
            });

            test('do not find command', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '<@CLIENT> tust this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBeNull();
            });

            test('no prefix', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: 'test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBeNull();
            });

        });

        describe('find command with prefix array', () => {

            test('find command', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    prefix: ['!', '!!', '-'],
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '!test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');

                expect(listener._findCommandInMessage({
                    content: '!!test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');

                expect(listener._findCommandInMessage({
                    content: '-test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');
            });

            test('find command with alias', () => {

                listener = new Listener({
                    mentionPrefix: true,
                    prefix: ['!', '!!', '-'],
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as any);

                expect(listener._findCommandInMessage({
                    content: '!test this command',
                    isMemberMentioned: (x) => {
                        return x.id === 'CLIENT';
                    }
                } as any)).toBe('COMMAND FOUND');

            });

        });

    });

});
