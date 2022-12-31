// CREDITS TO https://github.com/mtsev/seba
// google excel script + discord bot script adapted from there
import {getPad} from '../modules/random.js';
import {GoogleSpreadsheet} from "google-spreadsheet";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config()
const seed = process.env.SEED;
const sheetDiscordColumn = 2;
const sheetVerifiedColumn = 6;
const verifiedRoleId = process.env.DEV ? "932585726535684098":"552784361104343040";
var doc:GoogleSpreadsheet;
var sheet;
let guild = process.env.DEV ? "703924979929972746" : "483615159068131339";
// module.exports = {
//     name: 'verify',
//     alias:['verify'],
//     description: "used to verify members, check your email for the code after filling out the form: https://forms.gle/3hhEv4Z9DDwVAKMJA",
//     usage: "verify XXXXXX",
//     example: "verify 123456",
//     allowedChannels:["932883883211505694"],
// }



import { CommandInteraction, Emoji, GuildEmoji, GuildMember, User } from "discord.js";
import { Discord, On, Slash, SlashOption } from "discordx";

@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @On("ready")
    async init () {
        
        doc = process.env.DEV ? new GoogleSpreadsheet("1AVVJ3ImlSS0YpnaCEFvUp0uCcfD8g0_GKifj4Z-_b1U") : new GoogleSpreadsheet('12lhHiN9Xbh-lF2N2-ii9bD6YAUZ5wNqC0UYqH7xQlYU');
            await doc.useServiceAccountAuth({client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '', private_key: process.env?.GOOGLE_PRIVATE_KEY || ''});
            await doc.loadInfo();
            console.log("opened sheet: " + doc.title);
            sheet = doc.sheetsByIndex[0];
            await sheet.loadCells({startRowIndex: 0, endRowIndex: sheet.rowCount, startColumnIndex:0, endColumnIndex: sheet.columnCount});
    }
    @Slash("verify")
    async verify(
      @SlashOption("code", { type: "INTEGER" }) code: number,
      interaction: CommandInteraction
    ) {
        await doc.loadInfo();
        sheet = doc.sheetsByIndex[0];
        await sheet.loadCells({startRowIndex: 0, endRowIndex: sheet.rowCount, startColumnIndex:0, endColumnIndex: sheet.columnCount});
        const userTag = interaction.user.tag.toLowerCase();
        if (code.toString()==getPad(userTag + seed, 6)) {
            // add to database
            // scan discord names for a match
            for (var i = 1; i < sheet.rowCount; i++) {
                let val = sheet.getCell(i,sheetDiscordColumn).value;
                if (val == null) break;
                let sheetDiscordTag = val?.toString();
                console.log([sheetDiscordTag.toLowerCase(), userTag])
                if (sheetDiscordTag.toLowerCase() == userTag) {
                    sheet.getCell(i,sheetVerifiedColumn).value = "true";
                    await sheet.saveUpdatedCells();
                    interaction.guild?.members.resolve(interaction.user)?.roles.add(verifiedRoleId);
                    interaction.reply({content:`verification successful <@${interaction.user.id}>`,ephemeral:true})
                    return;
                }
            }
            interaction.reply({content:`verification unsuccessful <@${interaction.user.id}>. please make sure your details are correct`,ephemeral:true})
        } else {
            interaction.reply({content:`verification unsuccessful <@${interaction.user.id}>. please make sure your details are correct`,ephemeral:true})
        }
    }
}