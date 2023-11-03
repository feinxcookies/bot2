import {Discord, Slash, Client, SlashOption} from "discordx";
import { GatewayIntentBits, Partials} from "discord.js";
import "dotenv/config"

import "./commands/verify.js"
import "./commands/asciify.js";
import "./commands/connect4.js";
import "./commands/icon.js";
import "./commands/emoji.js";
async function start() {
    const client = new Client({
        botId: "test",
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
        botGuilds: [`${process.env.GUILD}`]
    });
        client.once("ready", async () => {
        await client.initApplicationCommands();
        //await client.initApplicationPermissions();

        console.log("Ready")
    });
        client.on("interactionCreate", (interaction) => {
        client.executeInteraction(interaction);
    });
    await client.login(process.env.BOT_TOKEN!);
}
start();
