import { CommandInteraction, Emoji, GuildEmoji, GuildMember, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import Jimp from "jimp";


@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @Slash("colorascii")
    async asciify(
      @SlashOption("url", { type: "STRING" }) url: string,
      @SlashOption("width", {type:"INTEGER"}) w: number,
      @SlashOption("height", {type:"INTEGER"}) h: number,
      interaction: CommandInteraction
    ) {
        await interaction.reply({content: "message"});
        var txt = new Array<string>();
        Jimp.read(url).then( async (img) => {
            img.resize(w,h).rgba(false);
            for (var i = 0; i < w*h; i++) {
                var r = Math.floor(img.bitmap.data[i*4]/64);
                var g = Math.floor(img.bitmap.data[i*4+1]/64);
                var b = Math.floor(img.bitmap.data[i*4+2]/64);
                txt[i] = `${r}${g}${b}`
            }
            var m = '```'; 
            for (var y = 0; y < h; y++) {
                var line = '';
                for (var x = 0; x < w; x++) {
                    //line += txt[y*w + x];
                    let guild = await interaction.client.guilds.fetch("483615159068131339");
                    var tempEmoji:GuildEmoji | undefined = guild?.emojis.cache.find(emoji => emoji.name === txt[y*w + x]);
                    line += tempEmoji?.toString();
                }
                if (interaction.channel){
                    interaction.channel.send(line);
                }
                // line += "\n";
                // m+= line;
            }
            if (interaction.channel){
                interaction.channel.send("done");
            }
            m+= '```'; 
            // let pos:number = 0;
            // while((pos < m.length) && interaction.channel) {
            //     interaction.channel.send({content:m.slice(pos, pos + 2000)});
            //     pos = pos + 2000;
            // }
        });

      
    }
}