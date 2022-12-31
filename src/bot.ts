import {Discord, Slash, Client, SlashOption} from "discordx";
import {Intents} from "discord.js";
import "reflect-metadata";
import "dotenv/config"

import "./commands/bruh.js"
import "./commands/asciify.js"
import "./commands/connect4.js"
import "./commands/makeEmoji.js"
import "./commands/delEmoji.js"
import "./commands/color.js"
import "./commands/copy.js";
import "./commands/verify.js";
async function start() {
    const client = new Client({
        botId: "test",
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
        botGuilds: process.env.DEV ? ["703924979929972746"] : ["483615159068131339"],
    });
        client.once("ready", async () => {
        await client.initApplicationCommands();
        await client.initApplicationPermissions();

        console.log("Ready")
    });
        client.on("interactionCreate", (interaction) => {
        client.executeInteraction(interaction);
    });
    await client.login(process.env.BOT_TOKEN!);
}
start();