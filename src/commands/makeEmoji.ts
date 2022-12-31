import { CommandInteraction, GuildEmoji, GuildMember, MessageAttachment, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import Jimp from "Jimp";
import { GifFrame, GifUtil, GifCodec, Gif } from 'gifwrap';
const width = 108, height = 108;

@Discord()
export default abstract class Example {
    myCustomText = "createEmoji"
    @Slash("emojicreate")
    hello(
        @SlashOption("gif", {type:"BOOLEAN"}) uploadGif: boolean,
      interaction: CommandInteraction
    ) {
        interaction.reply("creating emoji");
        //interaction.guild?.emojis.cache.forEach(e => console.log(e.name));
        for (let r = 0; r < 4; r++) {
            for (let g = 0; g < 4; g++) {
                for (let b = 0; b < 4; b++) {
                    new Jimp(width, height, Jimp.rgbaToInt(Math.floor(r/3*255), Math.floor(g/3*255), Math.floor(b/3*255),255), (err, image) => {
                        // try {
                        //     image.getBufferAsync(Jimp.MIME_PNG).then( async buf => {
                        //              await interaction.guild?.emojis.create(buf, `${r}${g}${b}`);
                        //             });
                        // } catch (e) {
                        //     let frame = new GifFrame(width, height);
                        //     frame.bitmap = image.bitmap;
                        //     frames.push(frame);
                        //     const codec = new GifCodec();
                        //     codec.encodeGif(frames, {loops:1}).then( async (gif) => {
                        //         await interaction.guild?.emojis.create(gif.buffer, `${r}${g}${b}`)
                        //     });
                        // }
                        
                        if (interaction.guild?.emojis.cache.some((emoji:GuildEmoji) => {return (emoji.name ==`${r}${g}${b}`)}) ) {
                            
                        } else {
                            console.log(`${r}${g}${b}`);
                            if (uploadGif == true) {
                                let frame = new GifFrame(width, height);
                                        const frames:GifFrame[] = [];
                                        frame.bitmap = image.bitmap;
                                        frames.push(frame);
                                        frames.push(frame);
                                        const codec = new GifCodec();
                                
                                        codec.encodeGif(frames, {loops:3}).then((gif) => {
                                            interaction.guild?.emojis.create(gif.buffer, `${r}${g}${b}`)
                                        });
                            } else {
                                image.getBufferAsync(Jimp.MIME_PNG).then( buf => {
                                    interaction.guild?.emojis.create(buf, `${r}${g}${b}`)
                                });
                            }   
                                // await image.getBufferAsync(Jimp.MIME_PNG).then( buf => {
                                //     interaction.guild?.emojis.create(buf, `${r}${g}${b}`).then((emoji) => console.log("emoji finished!"),(reason)=> {
                                //         console.log("emoji failed:" + `${r}${g}${b}`);
                                //         let frame = new GifFrame(width, height);
                                //         const frames:GifFrame[] = [];
                                //         frame.bitmap = image.bitmap;
                                //         frames.push(frame);
                                //         const codec = new GifCodec();
                                //         codec.encodeGif(frames, {loops:1}).then( async (gif) => {
                                //             console.log()
                                //             interaction.guild?.emojis.create(gif.buffer, `${r}${g}${b}`).then(() => console.log("gif finished!"), reason => console.log(reason))
                                //         });
                                //     })
                                // }, reason => console.log(reason));
                        }
                        // }
                        // if (interaction.guild?.emojis.cache.some((emoji:GuildEmoji) => {return (emoji.name===`${r}${g}${b}`)}) ) {
                        //     image.getBufferAsync(Jimp.MIME_GIF).then( buf => {
                        //         interaction.guild?.emojis.create(buf, `${r}${g}${b}`);
                        //     });
                        // } else {
                        //     image.getBufferAsync(Jimp.MIME_PNG).then( buf => {
                        //         interaction.guild?.emojis.create(buf, `${r}${g}${b}`);
                        //     });
                        // }
                    });
                }
            }    
        }
    }
}