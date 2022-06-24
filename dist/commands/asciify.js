import { __decorate, __metadata, __param } from "tslib";
import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import Jimp from "jimp";
let Example = class Example {
    myCustomText = "hello";
    asciify(url, w, h, interaction) {
        var gscale = ' ░▒▓';
        const garray = gscale.split("");
        var txt = new Array();
        Jimp.read(url).then((img) => {
            img.resize(w, h).quality(60).greyscale();
            for (var i = 0; i < w * h; i++) {
                txt[i] = garray[Math.floor(1.0 * img.bitmap.data[i * 4] / 256 * garray.length)];
            }
            var m = '```';
            var size = 0;
            for (var y = 0; y < h; y++) {
                var line = '';
                if (size + w >= 2000) {
                    m += '```';
                    interaction.reply(m);
                    m = '```';
                    size = 0.0;
                }
                for (var x = 0; x < w; x++) {
                    line += txt[y * w + x];
                }
                size += w;
                line += "\n";
                m += line;
            }
            m += '```';
            interaction.reply(m);
        });
    }
};
__decorate([
    Slash("asciify"),
    __param(0, SlashOption("url", { type: "STRING" })),
    __param(1, SlashOption("width", { type: "INTEGER" })),
    __param(2, SlashOption("height", { type: "INTEGER" })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, CommandInteraction]),
    __metadata("design:returntype", void 0)
], Example.prototype, "asciify", null);
Example = __decorate([
    Discord()
], Example);
export default Example;
