import { CommandInteraction, GuildMember, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import Jimp from "jimp";


@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @Slash("asciify2")
    asciify2(
      @SlashOption("url", { type: "STRING" }) url: string,
      @SlashOption("width", {type:"INTEGER"}) w: number,
      @SlashOption("height", {type:"INTEGER"}) h: number,
      interaction: CommandInteraction
    ) {
        var gscale = ' ░▒▓';
        var gscale = "▗▖▝▘▙▚▛▜▞▟▉"


        


        
        const garray = gscale.split("");
        var txt = new Array<string>();
        Jimp.read(url).then( (img) => {
            img.resize(w,h).quality(60).greyscale();
            for (var i = 0; i < w*h; i++) {
                txt[i] = garray[Math.floor(1.0 * img.bitmap.data[i*4] / 256 * garray.length)];
            }
            var m = '```'; 
            var size = 0;
            for (var y = 0; y < h; y++) {
                var line = '';
                if (size + w >= 2000) {
                    m += '```';
                    interaction.reply(m);
                    m = '```'; 
                    size = 0.0;
                }
                for (var x = 0; x < w; x++) {
                    line += txt[y*w + x];
                }
                size += w;
                line += "\n";
                m+= line;
            }
            m+= '```'; 
            interaction.reply(m);
        });

      
    }
}