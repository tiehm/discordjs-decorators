
/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message, PermissionResolvable, RichEmbed, Role } from 'discord.js';
import { Description, Name, Only, Usage } from '../../..';
import { Command } from '../Command';
import { IVerify } from '../typings/IVerify';

@Name('help')
@Description('Shows all commands (available to you) or information about one command.')
@Only('guild')
@Usage('[command]')
export class HelpCommand extends Command {

    private shouldShowCommand = (cmd: Command, msg: Message) => {
        if (cmd.ownerOnly && this.client.owner !== msg.author.id) return false;
        if (cmd.minRole) {
            const role: Role = msg.guild.roles.find(r => r.name.toLowerCase() === this.minRole.toLowerCase() ||
                r.id === this.minRole);
            if (msg.member.highestRole.comparePositionTo(role) < 0) {
                return false;
            }
        }
        if (cmd.restricted &&
            (!this.restricted.users.includes(msg.author.id) ||
                msg.guild && !msg.member.roles.some(r => this.restricted.roles.includes(r.id)))
        ) {
            return false;
        }
        return !(cmd.userPermissions && !msg.member.hasPermissions(this.userPermissions as PermissionResolvable));
        // tslint:disable-next-line
    };

    public async run(msg: Message, args: string[]): Promise<IVerify> {

        if (args.length === 0) {
            const commands: Array<{
                name: string,
                usage: string,
                desc: string,
                alias: string[]
            }> = (this.client.defaultHelpCommand as {showAll: boolean}).showAll ?
                 this.client.commands.filter(value => !value.hidden).map((value) => {
                     return {
                         name: value.commandName,
                         usage: value.usage,
                         desc: value.desc,
                         alias: value.alias
                     };
                 }) :
                 this.client.commands
                    .filter(value => !value.hidden).filter(value => this.shouldShowCommand(value, msg))
                    .map((value) => {
                        return {
                            name: value.commandName,
                            usage: value.usage,
                            desc: value.desc,
                            alias: value.alias
                        };
                    });

            const embed: RichEmbed = new RichEmbed()
            .setTimestamp()
            .setTitle('Help')
            .setColor('#79a8ff')
            .setFooter('Automatically generated.');

            for (const cmd of commands.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            })) {
                const aliases: string = cmd.alias.length > 0 ? cmd.alias.join(', ') : 'None';
                embed.addField(cmd.name, // tslint:disable-next-line
                    `${cmd.desc || ''}\nUsage: \`${this.client.defaultPrefix}${cmd.name} ${cmd.usage}\` \nAlias: \`${aliases}\``,
                    true);
            }

            await msg.reply(embed);

        } else if (args.length === 1) {

            const command: Command = this.client.commands.get(args[0].toLowerCase()) as Command;
            if (!command) {
                await msg.reply('Could not find this command. Use the `help` command to see a list of commands.');
                return {};
            }
            if (!(this.client.defaultHelpCommand as {showAll: boolean}).showAll &&
                (command.hidden || !this.shouldShowCommand(command, msg))) {
                await msg.reply(
                    'You do not have enough permissions to view this command or this command does not exist.');
                return {};
            }

            // TODO: Make more detailed
            const embed: RichEmbed = new RichEmbed()
                .setTitle(`Help - ${command.commandName}`)
                .setTimestamp()
                .addField('Alias', command.alias.length === 0 ? 'None' : command.alias.join(', '), true)
                .addField('Description', command.desc || 'No description provided.')
                .addField('Usage', `\`${this.client.defaultPrefix}${command.commandName} ${command.usage}\``, true);

            await msg.reply(embed);

        } else return { syntax: true };

        return {};
    }

}
