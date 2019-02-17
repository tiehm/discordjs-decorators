import { Message } from 'discord.js';
import { Command, GuildOnly, Msg, Name, Usage } from '../../../src';

@Name('ping')
@Usage('<prefix>ping', 'Gets the ping.')
@GuildOnly()
export class Ping extends Command {

    public async run(@Msg msg: Message) {
        const sent = await msg.channel.send('Pinging...') as Message;
        await sent.edit(`Pong! Took ${sent.createdTimestamp - msg.createdTimestamp}ms`);
    }

}
