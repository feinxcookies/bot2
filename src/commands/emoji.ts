import { CommandInteraction, GuildMember, User, Message, MessageReaction, CollectorFilter, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";


@Discord()

export default abstract class Example {
    @Slash({name:"emoji", description:"prints out all emoji"})
    async emoji(interaction: CommandInteraction){
        if (interaction.guild==null) {
            interaction.reply("use the command in a server!")
            return
        }
        const e = interaction.guild.emojis;
        await interaction.reply(`There are **${e.cache.size}** emoji in this server:\n`)
        var m = ``;
        var j = 0;
        e.cache.forEach((element) => {
            var str = e.resolveIdentifier(element);
            if (element.animated) {
                m += `<${str}>`;
            } else {
                m += `<:${str}>`;
            }
            j++;
            if (j % 24 == 0 ) {
                interaction.followUp({content:m, fetchReply:true});
                j = 0;
                m = '';
            }
            //m+= element;
            //message.channel.send(`<${e.resolveIdentifier(element)}>`);
            //:${e.resolveID(element)}
            //message.channel.send(`${element}`);
            
        });
        interaction.followUp(m);
    }
}