/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message } from 'discord.js';
import { Alias, Description, Name, Throttle } from '../../..';
import { Command } from '../Command';

@Name('ping')
@Alias('pong')
@Description('Showing the current ping to the Discord API.')
@Throttle(30, 5, true)
export class PingCommand extends Command {

    public async run(msg: Message) {
        const sent = await msg.channel.send('Pinging...');
        // tslint:disable-next-line:max-line-length
        await (sent as Message).edit(`Pong! Ping: \`${(sent as Message).createdTimestamp - msg.createdTimestamp} ms\` | Heartbeat: \`${this.client.ping} ms\``);
        return {};
    }
}
