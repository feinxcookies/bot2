import { CommandInteraction, GuildMember, Message, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
@Discord()
export default abstract class Example {
    myCustomText = "del??"
    @Slash("delemoji")
    hello(
      interaction: CommandInteraction
    ) {
        let n = 0;
        let m = interaction.reply(`${n} emojis deleted`);
        interaction.guild?.emojis.cache.forEach(async (e) => {
            await e.delete();
             n++;
             interaction.fetchReply().then(m => {
                if (m instanceof Message) {
                    m.edit(`${n} emojis deleted`);
                }
            
            })
        });
    }
}