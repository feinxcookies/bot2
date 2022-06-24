import { Client } from "discordx";
import { Intents } from "discord.js";
import "reflect-metadata";
import "dotenv/config";
import "./commands/bruh.js";
import "./commands/asciify.js";
async function start() {
    const client = new Client({
        botId: "test",
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        botGuilds: process.env.DEV ? ["483615159068131339"] : undefined,
    });
    client.once("ready", async () => {
        await client.initApplicationCommands();
        await client.initApplicationPermissions();
        console.log("Ready");
    });
    client.on("interactionCreate", (interaction) => {
        client.executeInteraction(interaction);
    });
    await client.login(process.env.BOT_TOKEN);
}
start();
