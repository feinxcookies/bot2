import { CommandInteraction, GuildMember, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";



@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @Slash("hello")
    hello(
      @SlashOption("user", { type: "USER" }) user: GuildMember | User,
      interaction: CommandInteraction
    ) {
      interaction.reply(`${user}`);
    }
}