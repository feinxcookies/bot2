import { __decorate, __metadata, __param } from "tslib";
import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
let Example = class Example {
    myCustomText = "hello";
    hello(user, interaction) {
        interaction.reply(`${user}`);
    }
};
__decorate([
    Slash("hello"),
    __param(0, SlashOption("user", { type: "USER" })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CommandInteraction]),
    __metadata("design:returntype", void 0)
], Example.prototype, "hello", null);
Example = __decorate([
    Discord()
], Example);
export default Example;
