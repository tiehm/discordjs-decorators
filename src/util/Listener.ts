import { Message } from 'discord.js';
import { Command, SilentClient } from '..';
import { IVerify } from '../structures/command/typings/IVerify';
import { argumentStore } from './ArgumentMetadata';
import { logger, Logger } from './Logger';

export class Listener {

    @logger()
    // @ts-ignore
    private readonly logger: Logger;
    /**
     * @property {SilentClient} client
     * @private
     * @readonly
     */
    private readonly client: SilentClient;
    /**
     * @property {Boolean} wait
     * @private
     * @readonly
     */
    private readonly wait: boolean;

    /**
     *
     * @param client {SilentClient}
     * @param [waitForImplementation=true] {Boolean}
     */
    constructor(client: SilentClient, waitForImplementation: boolean = true) {
        this.client = client;
        this.wait = waitForImplementation;
    }

    /**
     * Handle a message event
     * @param msg {Message}
     * @async
     * @public
     */
    public async handleMessageEvent(msg: Message) {

        this.logger.debug(`Handling incoming message with content: ${msg.content}`);

        // Runs the custom implemented message event
        // Option to wait for the return value of the custom event
        // Returns and blocks commands if the custom event returns
        // A falsie value or Promise resolving to such
        if (this.client.events.get('message')) {
            this.logger.debug('Executing custom message event');
            let ranEvent: unknown|Promise<unknown> = this.client.events.get('message')!.run(msg);
            if (this.wait) {
                if ((ranEvent as Object).constructor.name === 'Promise') {
                    ranEvent = await ranEvent;
                }
                if (!ranEvent) return false;
            }
        }

        const command = this._findCommandInMessage(msg);
        if (!command && this.client.commandNotFoundError) {
            await msg.reply(this.client.commandNotFoundError);
            return false;
        }
        if (!command) return false;

        this.logger.debug(`Message is a command, command found: ${command.commandName}`);

        const verify: IVerify = command.verify(msg, this.client) as IVerify;
        // @ts-ignore
        if (!(await this._verifyCheck(verify, msg, command))) return false;

        const args = msg.content.trim().split(/ +/g).slice(1);

        const properties = argumentStore
            .filter(value => value.name === command._className.toLowerCase())
            .sort((a, b) => a.index - b.index).map(value => value.value(msg));

        try {
            if (properties.length === 0) {
                this.logger.debug('Running command with default arguments');
                const cmdVerify = await command.run(msg, args);
                await this._verifyCheck(cmdVerify, msg, command);
            } else {
                this.logger.debug('Running command with decorator arguments');
                const cmdVerify = await command.run.apply(command, properties);
                await this._verifyCheck(cmdVerify, msg, command);
            }
        } catch (e) {
            this.logger.error(`Error on command execution: ${command.commandName}`);
            this.logger.error(e);
        }

        return true;
    }

    /**
     * Find a command in a message
     * @param msg {Message}
     * @private
     * @returns {Command}
     */
    public _findCommandInMessage(msg: Message): Command {

        let command: Command;

        if (msg.isMemberMentioned(this.client.user) &&
            this.client.mentionPrefix && (
                msg.content.startsWith(`<@${this.client.user.id}>`) ||
                msg.content.startsWith(`<@!${this.client.user.id}>`)
            )
        ) {
            const foundMsgCmd = msg.content.split(/ +/g)[1];
            if (this.client.commands.get(foundMsgCmd)) command = this.client.commands.get(foundMsgCmd) as Command;
            if (this.client.commands.find(c => c.alias && c.alias.includes(foundMsgCmd))) {
                command = this.client.commands.find(c => c.alias.includes(foundMsgCmd));
            }
        } else if (typeof this.client.prefix === 'string') {
            if (msg.content.startsWith(this.client.prefix)) {
                const foundMessageCmd =
                          msg.content.slice(this.client.prefix.length).trim().split(/ +/g)[0].toLowerCase();
                command = this.client.commands.get(foundMessageCmd) ||
                    this.client.commands.find((c) => {
                        if (c.alias) return c.alias.includes(foundMessageCmd);
                        return false;
                    });
            }
        } else if (Array.isArray(this.client.prefix)) {

            for (const prefix of this.client.prefix) {
                if (!msg.content.startsWith(prefix)) continue;
                const foundMsgCmd = msg.content.slice(prefix.length).trim().split(/ +/g)[0].toLowerCase();
                if (this.client.commands.get(foundMsgCmd)) command = this.client.commands.get(foundMsgCmd) as Command;
                if (this.client.commands.find(c => c.alias && c.alias.includes(foundMsgCmd))) {
                    command = this.client.commands.find(c => c.alias && c.alias.includes(foundMsgCmd));
                }
            }

        }

        // @ts-ignore
        return command;

    }

    private async _verifyCheck(verify: IVerify, msg: Message, command: Command): Promise<boolean> {
        // tslint:disable-next-line:no-parameter-reassignment
        if (verify.constructor && verify.constructor.name === 'Promise') verify = await verify;

        if (verify) {

            if (verify.channel) {
                await msg.reply('This command can not be used in this channel.').catch(this.logger.error);
            }
            // tslint:disable
            else if (verify.dm) await msg.reply('This command can only be used within DMs.').catch(this.logger.error);
            else if (verify.guild) await msg.reply('This command can only be used within guilds.').catch(this.logger.error);
            else if (verify.nsfw) await msg.reply('This command can only be used in NSFW channels.').catch(this.logger.error);
            else if (verify.owner) await msg.reply('This command can only be used by the Bot Owner.').catch(this.logger.error);
            else if (verify.permission) {
                await msg.reply('You do not have enough permissions to use this command.').catch(this.logger.error);
            } else if (verify.restricted) await msg.reply('You can not use this command.').catch(this.logger.error);
            else if (verify.role) await msg.reply('Your role is too low to use this command.').catch(this.logger.error);
            else if (verify.syntax) {
                // tslint:disable-next-line
                await msg.reply(`You used this command in the wrong way.\nSyntax: \`${this.client.defaultPrefix}${command.commandName} ${command.usage}\`.`).catch(this.logger.error);
            }
            if (Object.values(verify).includes(true)) return false;
        }
        return true;
    }

}
