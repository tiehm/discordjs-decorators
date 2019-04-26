/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { ClientUser, Collection, Message } from 'discord.js';
import 'jest';
import { Command, SilentClient } from '..';
import { argumentStore } from './ArgumentMetadata';
import { Listener } from './Listener';

describe('Listener', () => {

    process.env.XDEVELOPMENT = 'true';

    let listener: Listener;

    describe('handle message event', () => {

        describe('custom message event', () => {

            test('Return from custom message event [normal]', () => {

                listener = new Listener({
                    events: new Collection().set('message', {
                        run: (msg: Message) => {
                            return msg.content !== 'x';
                        }
                    })
                } as SilentClient);
                expect(listener.handleMessageEvent({ content: 'x' } as Message)).resolves.toBe(false);

            });

            test('Return from custom message event [promise]', () => {

                listener = new Listener({
                    events: new Collection().set('message', {
                        run: (msg: Message) => {
                            return Promise.resolve(msg.content);
                        }
                    })
                } as SilentClient);
                expect(listener.handleMessageEvent({ content: '' } as Message)).resolves.toBe(false);

            });

        });

        describe('command not found', async () => {

            listener = new Listener({
                commandNotFoundError: 'not found',
                events: new Collection()
            } as SilentClient);
            listener._findCommandInMessage = jest.fn(() => ({ hasCommandInit: true }));

            const msg: Partial<Message> = {
                content: 'foobar',
                reply: jest.fn(() => Promise.resolve())
            };
            const handled = await listener.handleMessageEvent(msg as Message);

            expect(handled).toBe(false);
            expect(msg.reply).toBeCalledWith('not found');
            expect((listener._findCommandInMessage as jest.Mock).mock.calls[0][0]).toMatchObject(msg);

        });

        describe('verify command', () => {

            test('failed verification [channel]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        channel: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };

                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('This command can not be used in this channel.');

            });

            test('failed verification [dm]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        dm: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('This command can only be used within DMs.');

            });

            test('failed verification [guild]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        guild: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('This command can only be used within guilds.');

            });

            test('failed verification [nsfw]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        nsfw: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('This command can only be used in NSFW channels.');

            });

            test('failed verification [owner]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        owner: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('This command can only be used by the Bot Owner.');

            });

            test('failed verification [permission]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        permission: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('You do not have enough permissions to use this command.');

            });

            test('failed verification [restricted]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        restricted: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('You can not use this command.');

            });

            test('failed verification [role]', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        role: true
                                    });
                                }
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith('Your role is too low to use this command.');

            });

            test('failed verification [syntax]', async () => {

                listener = new Listener({
                    events: new Collection(),
                    defaultPrefix: '!'
                } as SilentClient);
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                verify () {
                                    return Promise.resolve({
                                        syntax: true
                                    });
                                },
                                commandName: 'foobar',
                                usage: '[use it]'
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg: Partial<Message> = {
                    reply: jest.fn(() => Promise.resolve())
                };

                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(false);
                expect(msg.reply).toBeCalledWith(
                    'You used this command in the wrong way.\nSyntax: `!foobar [use it]`.');

            });

        });

        describe('running command', () => {

            test('with argumentStore', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                const run = jest.fn();
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                run,
                                verify () {
                                    return Promise.resolve({});
                                },
                                _className: 'foo'
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg = {
                    content: 'x'
                };
                argumentStore.push({
                    name: 'foo',
                    index: 0,
                    value: () => 'X'
                });
                argumentStore.push({
                    name: 'foo',
                    index: 1,
                    value: () => 'Y'
                });
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(true);
                expect(run.mock.calls[0][0]).toBe('X');
                expect(run.mock.calls[0][1]).toBe('Y');

            });

            test('default handle', async () => {

                listener = new Listener({
                    events: new Collection()
                } as SilentClient);
                const run = jest.fn();
                listener._findCommandInMessage = (): {cmd?: Command; hasCommandInit?: boolean} => {
                    return ({cmd:
                            ({
                                run,
                                verify () {
                                    return Promise.resolve({});
                                },
                                _className: 'foo'
                            } as Partial<Command<SilentClient>>) as Command<SilentClient>
                    });
                };
                const msg = {
                    content: '!test this command'
                };
                // @ts-ignore
                argumentStore = [];
                const handled = await listener.handleMessageEvent(msg as Message);

                expect(handled).toBe(true);
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
                } as SilentClient);

                expect(listener._findCommandInMessage(({
                    content: '!test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Partial<Message>) as Message).cmd).toBe('COMMAND FOUND');
            });

            test('find the command by alias', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', { alias: 'yeet' })
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '!yeet this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toMatchObject({ alias: 'yeet' });
            });

            test('find the command with spaces around', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '! test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBe('COMMAND FOUND');
            });

            test('test a message without the prefix', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: 'test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBeNull();
            });

            test('test a message with the wrong prefix', () => {
                listener = new Listener({
                    prefix: '!',
                    mentionPrefix: false,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '!!test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBeNull();
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
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '<@CLIENT> test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBe('COMMAND FOUND');
            });

            test('find command with alias', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', { alias: 'yeet' })
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '<@CLIENT> yeet this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toMatchObject({ alias: 'yeet' });
            });

            test('do not find command', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '<@CLIENT> tust this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBeNull();
            });

            test('no prefix', () => {
                listener = new Listener({
                    mentionPrefix: true,
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: 'test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBeNull();
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
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '!test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBe('COMMAND FOUND');

                expect(listener._findCommandInMessage({
                    content: '!!test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBe('COMMAND FOUND');

                expect(listener._findCommandInMessage({
                    content: '-test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBe('COMMAND FOUND');
            });

            test('find command with alias', () => {

                listener = new Listener({
                    mentionPrefix: true,
                    prefix: ['!', '!!', '-'],
                    user: {
                        id: 'CLIENT'
                    },
                    commands: new Collection().set('test', 'COMMAND FOUND')
                } as SilentClient);

                expect(listener._findCommandInMessage({
                    content: '!test this command',
                    isMemberMentioned: (client: ClientUser) => {
                        return client.id === 'CLIENT';
                    }
                } as Message).cmd).toBe('COMMAND FOUND');

            });

        });

    });

});
