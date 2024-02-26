
import { CommandInteraction,GuildBasedChannel, Emoji, GuildEmoji, GuildMember, User, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ComponentType, Channel, Message, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionResponse, IntegrationApplication, TextBasedChannel, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits, AutocompleteInteraction} from "discord.js";
import { ArgsOf, Discord, On, Slash, SlashOption, Client, SlashChoice, SlashGroup, Guard } from "discordx";
import { on } from "events";
import { GoogleSpreadsheet, GoogleSpreadsheetCell, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { JWT } from 'google-auth-library';
import "dotenv/config"
"use strict";
interface UserCell {
    name:GoogleSpreadsheetCell;
    id:GoogleSpreadsheetCell;
    tags:Array<GoogleSpreadsheetCell>;
}
const colUser:number = 0;
const colId:number = 1;
const colTagsStart:number = 2;
const rowHeaders:number = 1;
const rowDataStart:number = 2;
class TagManager {
    sheet: GoogleSpreadsheetWorksheet;
    userCount=0;
    tagCount=0;
    tagCells:Array<GoogleSpreadsheetCell> = [];
    tagNames:Array<string> = [];
    lowerTagNames:Array<string> = [];
    userCells:Array<UserCell> = [];
    constructor (googleSheet:GoogleSpreadsheetWorksheet) {
        this.sheet = googleSheet
        this.init()
    }
    async init () {
        await this.sheet.loadCells({startRowIndex: 0, endRowIndex: this.sheet.rowCount, 
                                    startColumnIndex:0, endColumnIndex: this.sheet.columnCount});
        //this.userCount = this.sheet.getCell(0,0).value;
        // count users
        this.userCount = 0;
        var val = this.sheet.getCell(rowDataStart, colUser);
        while (val.value != null) {
            this.userCount++;
            val = this.sheet.getCell(rowDataStart + this.userCount,colUser);
        }
        // count tags
        this.tagCount = 0;
        var val = this.sheet.getCell(rowHeaders, colTagsStart);
        while (val.value != null) {
            this.tagCount++;
            val = this.sheet.getCell(1, 2 + this.tagCount);
        }
        // sort 
        this.tagCells = Array.from({ length: this.tagCount}, (_,j)=>this.sheet.getCell(1,2 + j)).sort((a,b) => a.stringValue!.localeCompare(b.stringValue!));
        this.tagNames = Array.from(this.tagCells, (tagCell) => {return tagCell.stringValue!});
        this.lowerTagNames = this.tagNames.map(function(item) { return item.toLowerCase();});
        this.userCells = Array.from({ length: this.userCount}, (_,i)=>{
            var userCell:UserCell = {
                name: this.sheet.getCell(rowDataStart + i,0),
                id: this.sheet.getCell(rowDataStart + i, 1),
                tags: Array.from(this.tagCells, (tagCell,j) => this.sheet.getCell(2 + i,tagCell.columnIndex))
            };
           // console.log(userCell.tags);
           // userCell.tags = Array.from({ length: this.tagCount}, (_,j)=>this.sheet.getCell(2 + i, 2 + j)).sort((a,b)=> this.sheet.getCell(1, a.columnIndex).value - this.sheet.getCell(1, b.columnIndex).value);
            return userCell;
        }).sort((a,b)=> a.name.stringValue!.localeCompare(b.name.stringValue!));
        
        console.log("initialized tagMgr");
    }
    async save_data () {
        this.sheet.getCell(0,0).value = this.userCount;
        this.sheet.getCell(0,2).value = this.tagCount;
        await this.sheet.saveUpdatedCells();
        this.init();
    }
    //async add_tag(message.author.id, args[1], data)
    async add_tag_user(user:User, tagName:string, data:string, ping:boolean) {
        var target = this.userCells.find((userCell)=>userCell.id.stringValue == user.id);
        if (target == undefined) {
            target = this.add_user(user);
        }
        // assume tag exists
        const index = this.lowerTagNames.findIndex((str)=> str == tagName);
        target.tags[index].value = JSON.stringify([data, ping]);
        this.save_data();
    }
    add_user(user:User) {
        var userCell:UserCell = {
            name:this.sheet.getCell(rowDataStart + this.userCount,colUser),
            id: this.sheet.getCell(2 + this.userCount, 1),
            tags: Array.from(this.tagCells, (tagCell,j) => this.sheet.getCell(2 + this.userCount,tagCell.columnIndex))
        };
        this.userCount++;
        userCell.name.value = user.username;
        userCell.id.value = user.id;
        return userCell;
    }
    remove_tag_user(user:User, tagName:string) {
        var target = this.userCells.find((userCell)=>userCell.id.value == user.id);
        if (target == undefined) {console.log("remove_tag_user failed, target wasn't found"); return}
        const index = this.lowerTagNames.findIndex((str)=> str == tagName);
        target.tags[index].value = null;
        this.save_data();
    }
    list_tags_user(user:User) {
        var target = this.userCells.find((userCell)=>userCell.id.value == user.id);
        if (target == undefined) {console.log("remove_tag_user failed, target wasn't found"); return}
        var target1 = target;
        const arr = Array.from({ length: this.tagCount}, (_,j)=> {
            var tag = target1.tags[j];
            if (tag.stringValue== null) return null;
            const val = JSON.parse(tag.stringValue);
           //console.log({name: this.tagNames[j], data: val[0], ping: val[1]});
            return {name: this.tagNames[j], data: val[0], ping: val[1]};
        }).filter((e)=> e != null);
        return arr;
    }
    list_users_tag (tagName:string) {
        var tagIndex = this.lowerTagNames.findIndex((str)=>str == tagName);
        if (tagIndex == undefined) return undefined;
        var arr = new Array<{name:string, data:string, ping: boolean, id:string}>;
        this.userCells.forEach((user,i)=> {
            const tag = user.tags[tagIndex];
            if (tag.stringValue != null) {
                const val = JSON.parse(tag.stringValue);
                arr.push({name: user.name.stringValue || "", data: val[0], ping: val[1], id: user.id.stringValue || ""});
            }
        });
        return arr;
    }

    add_tag (tagName:string) {
        var tagCell = this.sheet.getCell(1, 2 + this.tagCount);
        tagCell.value = tagName;
        this.tagCount++;
        this.save_data();
        return tagCell;
    }
    rm_tag (tagName:string) {
        var tagIndex = this.tagCells.findIndex((tagCell)=>tagCell.value == tagName);
        if (tagIndex == undefined) return undefined;
        this.userCells.forEach((user,i)=> {
            const tag = user.tags[tagIndex];
            tag.value = null;
        });
        this.tagCells[tagIndex].value = null;
        this.tagCount = this.tagCount - 1;
        this.save_data();
    }
    // cell_2_tag (cell) {
    //     var val = JSON.parse(cell.value);
    //     return {
    //         data: val[0],
    //         ping: val[1],
    //     }
    // }
}



var doc;
var tagMgr:TagManager;
var tagsAutocomplete = () => {
    return Array.from(tagMgr.tagNames, e => { return {name:e,value:e} })
}
@Discord()
@SlashGroup({ name: "game", description: "game"})
@SlashGroup({ name: "id", description: "id"})
export default abstract class Example {
    @On({event:'ready'})
    async tags_init ([event]:ArgsOf<"ready">, client:Client) {
        const SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
          ];
        if (typeof process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL != "string" || typeof process.env.GOOGLE_PRIVATE_KEY != "string") {console.log(".env setup incorrectly"); return}
        const jwtFromEnv = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY,
            scopes: SCOPES,
          });
        doc = new GoogleSpreadsheet('1l_BQXIBLxaZ9-xkKOJ0-EsoY25ESN0gYx5pHICeK7CY',jwtFromEnv); // the actual sheet is still private so ppl have to ask permission to view
        await doc.loadInfo();
        console.log("opened sheet: " + doc.title);
        const sheet = doc.sheetsByIndex[0];
        tagMgr = new TagManager(sheet);
        console.log(tagMgr.userCount)
        client.emit('tags_ready');
    }
    @SlashGroup("id")
    @Slash({name:"add", description:"add an id to your profile"})
    async add(
        @SlashOption({
            autocomplete: function (interaction:AutocompleteInteraction) {
                interaction.respond(tagsAutocomplete())
            },
            name:"game", description:"the game you wish to add your id to", type: ApplicationCommandOptionType.String})tag:string,
        @SlashOption({name:"id", description:"id to add", type: ApplicationCommandOptionType.String})id:string,
        @SlashOption({name:"ping", description:"whether or not you would like to be pinged", type: ApplicationCommandOptionType.Boolean})ping:boolean = false,
        interaction: CommandInteraction
    ){
        //var category = args[1].toLowerCase();
        tag = tag.toLowerCase();
            var tagIndex = tagMgr.lowerTagNames.findIndex((str)=>str == tag);
            if (tagIndex == undefined) {
                interaction.reply("game doesn't exist");
                return;
            };

            if (tagMgr.lowerTagNames.includes(tag)) {
                tagMgr.add_tag_user(interaction.user, tag, id, ping);
            interaction.reply(`added tag: \`${tagMgr.tagCells[tagIndex].value}\` with id: \`${id}\` and ping?: \`${ping}\` for user: \`${interaction.user.username}\``);
            // TODO would you like to add it? yes/no modal
            } else {interaction.reply("game doesn't exist")}


    }
    @SlashGroup("id")
    @Slash({name:"remove", description:"removes a game id from your profile"})
    async remove(
        @SlashOption({autocomplete: function (interaction:AutocompleteInteraction) {
            interaction.respond(tagsAutocomplete())
        },name:"game", description:"which game to remove", type: ApplicationCommandOptionType.String})tag:string,
        interaction: CommandInteraction
    ){
        tagMgr.remove_tag_user(interaction.user,tag);
        interaction.reply("Removed tag: `" + tag + "` from user: `" + interaction.user.username);
    }
    // TODO REMOVE USER MAYBE?
    @SlashGroup("game")
    @Slash({name:"list", description:"lists the games available"})
    async list(
        //@SlashChoice(...tagMgr.tagNames)
        @SlashOption({autocomplete: function (interaction:AutocompleteInteraction) {
            interaction.respond(tagsAutocomplete().concat({name:'all', value:'all'}))
        },name:"game", description:"if blank, view available categories", type: ApplicationCommandOptionType.String, required:false})game:string,
        interaction: CommandInteraction
    ){
        var m1 = '```asciidoc\n';
        if (game == undefined || game == "all") {
            m1 += "[Available tags]: \n";
            tagMgr.tagNames.forEach((tagStr) => {
                m1 += tagStr + "\n";
            })
        } else {
            var gameLower = game.toLowerCase();
            var tagIndex = tagMgr.lowerTagNames.findIndex((str)=>str == gameLower);
            if (tagIndex == -1) {
                interaction.reply(`game doesn't exist`);
                return
            };
            const arr: Array<{name:string,data:string,ping:boolean,id:string}> | undefined = tagMgr.list_users_tag(game);
            if (arr === undefined) {interaction.reply("could not find any games try adding one"); return }
            const wName = 20, wData = 20, wPing = 6;
            m1+= "[" + tagMgr.tagCells[tagIndex].value + "]\n"
            m1+= "Name".padEnd(wName) + " " + "Data".padEnd(wData)+"Ping?"+"\n";
            m1+= "\n".padStart(wName + 1 + wData + wPing, '=');
            arr.forEach((e)=> {
                m1 += ( e.name).padEnd(wName) + " " + e.data.padEnd(wData) + e.ping + '\n';
            })
        }
        m1 += '```';
        interaction.reply(m1);
    }
    @SlashGroup("id")
    @Slash({name:"list", description:"lists the ids for a single user"})
    async profile(
        @SlashOption({name:"user", description:"leave blank to get your own profile", type: ApplicationCommandOptionType.User, required:false})user:User,
        interaction: CommandInteraction
    ){
        if (user == undefined) {user = interaction.user}
        var target = tagMgr.userCells.find((userCell)=>userCell.id.value == user.id);
        if (target == undefined) {
            interaction.reply("user not found");
            return
        }
        var tags = tagMgr.list_tags_user(user);
        if (tags == undefined) {interaction.reply("no tags to list :("); return}
        var m1 = '```asciidoc\n';
        const wName = 15, wData = 15, wPing = 6;
        m1+= "["+user.username+"]\n";
        m1+= "Tag Name".padEnd(wName) + " " + "Data".padEnd(wData)+"Ping?"+"\n";
        m1+= "\n".padStart(wName + 1 + wData + wPing, '=');
        tags.forEach((set) => {
            if (set==null) return;
            m1 += set.name.padEnd(wName) + " " + set.data.padEnd(wData) + set.ping + '\n';
        })
        m1 += '```';
        interaction.reply(m1);

    }
    @SlashGroup("game")
    @Slash({name:"add", description:"add a game to register tags with"})
    addCat(
        @SlashOption({autocomplete: function (interaction:AutocompleteInteraction) {
            interaction.respond(tagsAutocomplete())
        },name:"game", description:"game name to add", type: ApplicationCommandOptionType.String})game:string,
        interaction: CommandInteraction
    ){
    if (!tagMgr.tagNames.includes(game)) {
        tagMgr.add_tag(game);
        interaction.reply("added tag: `" + game + "`!");
    } else {
        interaction.reply('tag already exists!');
    }

    }
    @SlashGroup("game")
    @Slash({name:"remove", description:"remove a game from the list [MOD ONLY]"})
    async remcat(
        @SlashOption({autocomplete: function (interaction:AutocompleteInteraction) {
            interaction.respond(tagsAutocomplete())
        },name:"game", description:"game name to add", type: ApplicationCommandOptionType.String})game:string,
        interaction: CommandInteraction
    ){
        if (interaction.guild == null) return
        var usertest = await interaction.guild.members.fetch(interaction.user);
        if (usertest.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.reply({content:"you need to be an admin to use this command", ephemeral:true})
            return
        }
        if (!tagMgr.tagNames.includes(game)) {
            interaction.reply("game doesn't exist");
            return
        }
        tagMgr.rm_tag(game);
        interaction.reply("removed game: `" + game + "`");
    }
    @SlashGroup("game")
    @Slash({name:"ping", description:"ping everyone for this game"})
    async ping(
        ///@SlashChoice(...tagMgr.tagNames)
        @SlashOption({autocomplete: function (interaction:AutocompleteInteraction) {
            interaction.respond(tagsAutocomplete())
        },name:"game", description:"game to ping", type: ApplicationCommandOptionType.String})game:string,
        interaction: CommandInteraction
    ) {
        var gameLower = game.toLowerCase()
        var tagIndex = tagMgr.lowerTagNames.findIndex((str)=>str == gameLower);
        if (tagIndex == undefined) {
            interaction.reply("game doesn't exist");
            return
        }
        const arr = tagMgr.list_users_tag(gameLower);
        if (arr === undefined) {interaction.reply("could not find any users for this game"); return }
        var m = "mentioning game: `" + tagMgr.tagCells[tagIndex].value + "`: ";
        arr.forEach((e)=> {
            if (e.ping == true) {
                m += "<@" + e.id + "> ";
            }
        });
        interaction.reply(m);
    }
}


   