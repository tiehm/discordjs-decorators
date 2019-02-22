/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message } from 'discord.js';
import { Alias, Description, Name, Throttle } from '../../..';
import { Command } from '../Command';

@Name('ping')
@Alias('pong', 'reply')
@Description('Showing the current ping to the Discord API.')
@Throttle(30, 5, true)
export class PingCommand extends Command {

    public async run(msg: Message) {
        await msg.reply('pong');
        return {};
    }
}
