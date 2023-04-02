import { ArgsOf, Discord, On, Client } from "discordx";
import "dotenv/config";
import { schedule, ScheduledTask } from "node-cron";
@Discord()
export default abstract class icons {
    jobs: { show: ScheduledTask|undefined; hide: ScheduledTask|undefined} = {show:undefined, hide:undefined};
    @On({event:'ready'})
    async init ([event]:ArgsOf<"ready">, client:Client) {

        if (this.jobs != undefined && this.jobs.show) {
            return;
        }
        this.jobs.show = schedule ('0 21 * * *', async () => {
            (await client.guilds.fetch(process.env.GUILD!)).setIcon("./src/icons/purple_logo.gif");
        }, {timezone:"Australia/Sydney"});
        this.jobs.hide = schedule ('0 6 * * *', async () => {
            (await client.guilds.fetch(process.env.GUILD!)).setIcon("./src/icons/blue_logo.gif");
        }, {timezone:"Australia/Sydney"});
    }
}
