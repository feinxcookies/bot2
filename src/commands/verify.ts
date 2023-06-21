// CREDITS TO https://github.com/mtsev/seba
// google excel script + discord bot script adapted from there
import {getPad} from '../modules/random.js';
import {GoogleSpreadsheet, GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config()
const seed = process.env.SEED;
const sheetDiscordColumn = 2;
const sheetVerifiedColumn = 8;
const verifiedRoleId = process.env.DEV === "true" ? "932585726535684098":"552784361104343040";
var doc:GoogleSpreadsheet;
var verifiedSheet:GoogleSpreadsheetWorksheet;
var variablesSheet:GoogleSpreadsheetWorksheet;


var channelID_loc = [0,1];
var messageID_loc = [1,1];
var welcomeChannelID_loc = [2,1];
var channelID:string;
var messageID:string;
var welcomeChannelID:string;

const verifyMessage = 
`[Server Verification]
**How do I receive the member role?**
**1.** Fill in the verification form: https://forms.gle/3hhEv4Z9DDwVAKMJA
**2.** then come here with **a code** received via email`;
const row = new ActionRowBuilder<ButtonBuilder>()
.addComponents(
[new ButtonBuilder()
.setCustomId('verify')
.setLabel('I have a code!')
.setStyle(ButtonStyle.Primary),
]
);

const modal = new ModalBuilder()
    .setTitle("AUNSW Verification")
    .setCustomId("modal")
    .addComponents([
        new ActionRowBuilder<TextInputBuilder>()
        .addComponents(
            [new TextInputBuilder()
                .setCustomId("code")
                .setLabel("code")
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMinLength(6)
                .setMaxLength(6)
            ]
        )
    ])

import { CommandInteraction,GuildBasedChannel, Emoji, GuildEmoji, GuildMember, User, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ComponentType, Channel, Message, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionResponse, IntegrationApplication, TextBasedChannel, ApplicationCommandOptionType, ChannelType} from "discord.js";
import { ArgsOf, Discord, On, Slash, SlashOption, Client } from "discordx";

@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @On({event:'ready'})
    async init ([event]:ArgsOf<"ready">, client:Client) {
        
        doc = new GoogleSpreadsheet('12lhHiN9Xbh-lF2N2-ii9bD6YAUZ5wNqC0UYqH7xQlYU');

            await doc.useServiceAccountAuth({client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '', private_key: process.env?.GOOGLE_PRIVATE_KEY || ''});
            await doc.loadInfo();
            verifiedSheet = doc.sheetsByIndex[0];
            variablesSheet = doc.sheetsByIndex[1];
            await verifiedSheet.loadCells({startRowIndex: 0, endRowIndex: verifiedSheet.rowCount, startColumnIndex:0, endColumnIndex: verifiedSheet.columnCount});
            await variablesSheet.loadCells({startRowIndex: 0, endRowIndex: variablesSheet.rowCount, startColumnIndex:0, endColumnIndex: variablesSheet.columnCount});
            //console.log("opened sheet: " + doc.title);
        // get ID's of button message and check if message exists
        channelID = variablesSheet.getCell(channelID_loc[0], channelID_loc[1]).value?.toString();
        messageID = variablesSheet.getCell(messageID_loc[0], messageID_loc[1]).value?.toString();
        welcomeChannelID = variablesSheet.getCell(welcomeChannelID_loc[0], welcomeChannelID_loc[1]).value?.toString();
        if (typeof channelID !== "string" || typeof messageID !== "string") return;
        var channel:Channel|null;
        try {
            channel = await client.channels.fetch(channelID);
        } catch (e) {
            console.log(e);
            return;
        }
        if (channel!=null && channel.isTextBased()) {
            channel.messages.fetch(messageID).then(message => {
                attach_collector(message);
                console.log(`message exists with url: ${message.url}`);
            }).catch(e=>console.log(e))
        }
        create_modal_collector(client);
    }


    @Slash({ name: "create_message", description:"help"})
    async button_msg(
        interaction:CommandInteraction,
    ) {
         await create_verify_message(interaction,variablesSheet);
    }
    @Slash({ name: "set_welcome_channel", description:"sets the welcome channel"})
    async set_channel(
        @SlashOption({name:"channel", description:"channel for the welcome message", type: ApplicationCommandOptionType.Channel}) channel: TextBasedChannel,
        interaction:CommandInteraction,
    ) {
        if (channel != null) {
        variablesSheet.getCell(welcomeChannelID_loc[0], welcomeChannelID_loc[1]).value = channel.id;
        await variablesSheet.saveUpdatedCells();
        welcomeChannelID = channel.id;
        interaction.reply({content:`successfully set welcome message channel to: ${welcomeChannelID}`});
        } else {
            interaction.reply({content:`welcome message channel is currently: ${welcomeChannelID}`});
        }
    }
}

function attach_collector(message:Message) {
    const collector = message.createMessageComponentCollector({componentType: ComponentType.Button})
    collector?.on('collect', i => {
        i.showModal(modal);    
    });
}
function create_modal_collector(client:Client) {
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId=== "modal") {
            const code = interaction.fields.getTextInputValue("code");
            var userName = interaction.user.username;
            var userTag = userName;
            if (userName.includes('#')) {
                userTag = userName.substring(0,userName.indexOf('#'));
            }
            if (code.toString()==getPad(userTag + seed, 6)) {
                // add to database
                // scan discord names for a match
                await verifiedSheet.loadCells({startRowIndex: 0, endRowIndex: verifiedSheet.rowCount, startColumnIndex:0, endColumnIndex: verifiedSheet.columnCount});
                for (var i = 1; i < verifiedSheet.rowCount; i++) {
                    let val = verifiedSheet.getCell(i,sheetDiscordColumn).value;
                    
                    if (val == null) continue;
                    let sheetDiscordTag = val?.toString();
                    if (sheetDiscordTag.toLowerCase() == userTag) {
                        verifiedSheet.getCell(i,sheetVerifiedColumn).value = "true";
                        await verifiedSheet.saveUpdatedCells();
                        try {
                        interaction.guild?.members.resolve(interaction.user)?.roles.add(verifiedRoleId);
                        } catch (e) {console.log(e)}
                        console.log(welcomeChannelID);
                        var channel = await interaction.guild?.channels.fetch(welcomeChannelID);
                        interaction.reply({content:`verification successful <@${interaction.user.id}>`,ephemeral:true})
                        
                        if (channel != null && channel.type == ChannelType.GuildText) {

                            channel.send(`Welcome <@${interaction.user.id}> feel free to leave an introduction in <#803848921804701718>`)
                        }
                        return;
                    }
                }
                await interaction.reply({ content: 'something went wrong. try again later', ephemeral:true});
            } else {
                await interaction.reply({ content: 'incorrect code.', ephemeral:true});
            }
            
        }
    })
};
async function create_verify_message(interaction:CommandInteraction,sheet:GoogleSpreadsheetWorksheet) {
    if (interaction.channel==null) return;
        var new_message = await interaction.channel.send({ content: verifyMessage, components: [row]});
        attach_collector(new_message);
        sheet.getCell(channelID_loc[0], channelID_loc[1]).value = interaction.channel.id;
        sheet.getCell(messageID_loc[0], messageID_loc[1]).value = new_message.id;
        await sheet.saveUpdatedCells();
        if (interaction.replied) {
            interaction.editReply({content:`created a message with url: ${new_message?.url}`,components:[]});
        } else {
            interaction.reply({content:`created a message with url: ${new_message?.url}`,ephemeral:true});
        }
}


