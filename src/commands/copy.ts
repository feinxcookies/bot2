import { CommandInteraction, GuildChannel, GuildMember, Message, MessageAttachment, Snowflake, TextBasedChannel, User } from "discord.js";
import { Discord, Guild, Slash, SlashChoice, SlashOption, SlashGroup } from "discordx";



@Discord()

@SlashGroup({ name: "post", description: "Manage permissions" })
export default abstract class Example {
    @Slash("add")
    add(
        @SlashOption("msg", { type: "STRING" }) msg: string,
      @SlashOption("day", { type: "INTEGER" }) day: number,
      @SlashChoice(...Array.from({length: 12}, (_, i) => i + 1))
      @SlashOption("month", { type: "INTEGER" }) month: number,
      @SlashChoice(2022,2023)
      @SlashOption("year", { type: "INTEGER" }) year: number,
      @SlashChoice(...Array.from({length: 12}, (_, i) => i))
      @SlashOption("hour", { type: "INTEGER" }) hour: number,
      @SlashChoice("AM", "PM")
      @SlashOption("am_pm", { type: "STRING" }) offset: string,
      @SlashOption("minute", { type: "INTEGER" }) minute: number,
      @SlashOption("imageurl", { type: "STRING", required:false}) url: string,
      interaction: CommandInteraction
    ) {

        var date = new Date(year,month-1,day,hour,minute);
        if (offset == "PM") {
            date.setTime(date.getTime() + 12 * 60 * 60 * 1000);
        }
        var myAttachments:MessageAttachment[] | undefined = [];
        if (url) {
            var myAttach = new MessageAttachment(url);
            myAttachments.push(myAttach)
        } else {
            myAttachments = undefined;
        }


    
        interaction.reply({content:`scheduled post for ${date}. `, ephemeral: true, attachments: myAttachments, fetchReply:true}).then( () => {
                interaction.followUp({content:`message:\n ${msg}`, ephemeral: true, allowedMentions: {"parse": []}});
            }
        )
        setTimeout(() => interaction.channel?.send(msg), date.getTime() - Date.now());
    }
    @Slash ("list") 
    list(


    ) {
        
    }
}