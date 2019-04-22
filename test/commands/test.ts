/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message, Role } from 'discord.js';
import { Alias, Command, Description, GetRole, Logger, logger, Msg, Name, Only, Usage, Verify } from '../../dist';
import { IVerify } from '../../dist/structures/command/typings/IVerify';

@Name('test')
@Alias('foo')
@Description('Always works as expected')
@Usage('[test]')
@Only('490170690507505675')
@Verify((msg => ({ channel: msg.channel.id === '489405221173198849' })))
export class TestCommand extends Command {

    @logger()
    private logger: Logger;

    public async run(@GetRole('Zenzy Owner') role: Role, @Msg() msg: Message): Promise<IVerify> {
        if (role) return { permission: true };
        await msg.reply(role.name);
        return null;
    }

}
