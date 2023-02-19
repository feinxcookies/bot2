import { ApplicationCommandOptionType, CommandInteraction, GuildMember, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import sharp from "sharp";


@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @Slash({name:"asciify", "description":"convert an image to greyscale ascii"})
    async asciify(
      @SlashOption({name:"url", description:"url for the image", type: ApplicationCommandOptionType.String, required:true}) url: string,
      @SlashOption({name:"width", description:"width of the image in characters. Recommended < 50", type: ApplicationCommandOptionType.Number, maxValue:50}) w: number = 50,
      @SlashOption({name:"height", description:"height of the image in characters. Recommended < 35", type: ApplicationCommandOptionType.Number, maxValue:48}) h: number = 35,
      interaction: CommandInteraction
    ) {
        var gscale = ' ░▒▓';



        
        const garray = gscale.split("");
        var txt = new Array<string>();

        const response = await fetch(url);
        const buf = await response.arrayBuffer();
        const img = await sharp(new Uint8Array(buf)).resize(w,h, {fit:sharp.fit.fill}).greyscale().raw().toBuffer();
        console.log(img);
            for (var i = 0; i < img.length; i++) {
                txt[i] = garray[Math.floor(1.0 * img[i] / 256 * garray.length)];
            }
            var m:string = '```';
            var size = 0;
            for (var y = 0; y < h; y++) {
                var line = '';
                if (size + w+1 >= 2000) {
                    m += '```';
                    interaction.reply(m);
                    m = '```'; 
                    size = 0.0;
                }
                for (var x = 0; x < w; x++) {
                    line += txt[y*w + x];
                }
                size += w+1;
                line += "\n";
                m+= line;
            }
            m+= '```'; 
            interaction.reply(m);

      
    }
}