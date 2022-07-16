"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Prefixes_1 = __importDefault(require("../entity/Prefixes"));
const utils_1 = require("../utils");
exports.default = {
    description: "Change the prefix for this guild",
    options: [
        {
            description: "Set the new prefix",
            name: "prefix",
            type: "STRING",
        },
    ],
    permission: "ADMINISTRATOR",
    slash: "both",
    default: true,
    expectedArgs: "[prefix]",
    maxArgs: 1,
    async run({ client, interaction, message, args }) {
        var _a, _b;
        let prefix;
        let guildExists;
        let guildId;
        if (message) {
            if (!message.guild)
                return;
            guildExists = (await Prefixes_1.default.findOne({
                where: { guildId: message.guild.id },
            }))
                ? true
                : false;
            guildId = message.guild.id;
            if (args && args.length < 1) {
                const guildDb = await Prefixes_1.default.findOne({
                    where: { guildId: message.guild.id },
                });
                if (!guildDb)
                    return utils_1.Responses.embeds.Success(`Current prefix is: ${utils_1.Settings.get("client").defaultPrefix || "!"}`);
                return utils_1.Responses.embeds.Success(`Current prefix is: ${guildDb.prefix}`);
            }
            if (!args || !args[0])
                return;
            if (args[0].length > 32)
                return utils_1.Responses.embeds.Error("Prefix too long");
            prefix = args[0].trim();
        }
        else if (interaction && interaction.guild) {
            guildExists = (await Prefixes_1.default.findOne({
                where: { guildId: interaction.guild.id },
            }))
                ? true
                : false;
            guildId = interaction.guild.id;
            const newPrefix = interaction.options.getString("prefix");
            if (!newPrefix) {
                const guildDb = await Prefixes_1.default.findOne({
                    where: { guildId: interaction.guild.id },
                });
                if (!guildDb)
                    return utils_1.Responses.embeds.Success(`Current prefix is: ${utils_1.Settings.get("client").defaultPrefix || "!"}`);
                return utils_1.Responses.embeds.Success(`Current prefix is: ${guildDb.prefix}`);
            }
            if (newPrefix.length > 32)
                return utils_1.Responses.embeds.Error("Prefix too long");
            prefix = newPrefix.trim();
        }
        else {
            return;
        }
        utils_1.Cache.prefixes.set(guildId, prefix);
        if (guildExists) {
            await Prefixes_1.default.update({ guildId }, { prefix });
        }
        else {
            await Prefixes_1.default.insert({ guildId, prefix });
        }
        const resultFuncExists = (_a = utils_1.PrivateSettings.lang) === null || _a === void 0 ? void 0 : _a.success.prefixChanged;
        if (!resultFuncExists)
            return;
        const result = (_b = utils_1.PrivateSettings.lang) === null || _b === void 0 ? void 0 : _b.success.prefixChanged(prefix);
        if (!result)
            return;
        return result;
    },
};
//# sourceMappingURL=prefix.js.map