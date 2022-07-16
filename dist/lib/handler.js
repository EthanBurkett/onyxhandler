"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const utils_1 = require("../utils");
const permissions_1 = require("../validation/permissions");
const CommandHandler = ({ client }) => {
    var _a;
    const Errors = (_a = utils_1.PrivateSettings.lang) === null || _a === void 0 ? void 0 : _a.errors;
    client.on("messageCreate", async (message) => {
        if (!message || !message.guild)
            return;
        const Prefix = utils_1.Cache.prefixes.get(message.guild.id) ||
            utils_1.Settings.get("client").defaultPrefix ||
            "!";
        let args = message.content.split(" ");
        const messagePrefix = args[0].slice(0, Prefix.length);
        if (messagePrefix != Prefix)
            return;
        const commandRan = args[0].slice(Prefix.length);
        let command = utils_1.Commands.get(commandRan);
        if (!command)
            command = utils_1.Commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandRan));
        if (!command)
            return;
        if (command.slash === true) {
            message.reply({
                embeds: [utils_1.Responses.embeds.Error("Command is slash only.")],
            });
            return;
        }
        args = args.slice(1);
        const generalTestResult = generalTests(command, message, Errors);
        if (generalTestResult != undefined) {
            if (typeof generalTestResult === "object") {
                const [Message, Args] = [
                    generalTestResult.message,
                    generalTestResult.args,
                ];
                if (!Errors || !Errors[Message])
                    return;
                const res = Errors[Message](...Args);
                if (!res)
                    return;
                message.reply(useResponse(res));
                return;
            }
            else if (generalTestResult === false) {
                return;
            }
        }
        if (command.permission) {
            if (!message.member.permissions.has(command.permission)) {
                if (!Errors || !Errors.noPermission)
                    return;
                const res = Errors.noPermission(command.permission);
                if (!res)
                    return;
                message.reply(useResponse(res));
                return;
            }
        }
        if (command.minArgs) {
            if (args.length < command.minArgs) {
                if (!Errors || !Errors.minArgs || !command.expectedArgs)
                    return;
                const res = Errors.minArgs(command.minArgs, command.expectedArgs);
                if (!res)
                    return;
                message.reply(useResponse(res));
                return;
            }
        }
        if (command.maxArgs) {
            if (args.length > command.maxArgs) {
                if (!Errors || !Errors.maxArgs || !command.expectedArgs)
                    return;
                const res = Errors.maxArgs(command.maxArgs, command.expectedArgs);
                if (!res)
                    return;
                message.reply(useResponse(res));
                return;
            }
        }
        let result = command.run({
            message,
            client,
            interaction: null,
            args,
            channel: message.channel,
            guild: message.guild,
            member: message.member,
            user: message.author,
            options: undefined,
        });
        if (result instanceof Promise)
            result = await result;
        replyFromCallback(message, result);
    });
    client.on("interactionCreate", async (interaction) => {
        var _a;
        if (!interaction.isCommand())
            return;
        if (!interaction.guild)
            return;
        const { commandName, guild, channelId } = interaction;
        const member = interaction.member;
        let command = utils_1.Commands.get(commandName);
        if (!command)
            return;
        if (!command.slash) {
            return interaction.reply({
                embeds: [utils_1.Responses.embeds.Error("This command is slash disabled.")],
            });
        }
        const generalTestResult = generalTests(command, interaction, Errors);
        if (typeof generalTestResult === "object") {
            const [Message, Args] = [
                generalTestResult.message,
                generalTestResult.args,
            ];
            if (!Errors || !Errors[Message])
                return;
            const res = Errors[Message](...Args);
            if (!res)
                return;
            interaction.reply(useResponse(res));
            return;
        }
        else if (generalTestResult === false) {
            return;
        }
        if (command.permission) {
            if (!permissions_1.permissionList.includes(command.permission)) {
                utils_1.Console.error("bot", `Invalid permission node ${command.permission}`);
            }
            if (!((_a = interaction.memberPermissions) === null || _a === void 0 ? void 0 : _a.has(command.permission))) {
                if (!Errors || !Errors.noPermission)
                    return;
                const res = Errors.noPermission(command.permission);
                if (!res)
                    return;
                interaction.reply(useResponse(res));
            }
        }
        let response = command.run({
            message: null,
            client,
            interaction,
            args: [],
            channel: interaction.channel,
            guild: interaction.guild,
            member: interaction.member,
            user: interaction.user,
            options: interaction.options,
        });
        if (response instanceof Promise)
            response = await response;
        replyFromCallback(interaction, response);
    });
};
exports.CommandHandler = CommandHandler;
const replyFromCallback = (msgOrInter, reply) => {
    if (!reply) {
        return;
    }
    else if (reply.type == "rich" && typeof reply == "object") {
        msgOrInter.reply({
            embeds: [reply],
        });
    }
    else if (typeof reply == "object" && reply.custom) {
        msgOrInter.reply(reply);
    }
    else if (typeof reply == "string") {
        msgOrInter.reply({
            content: reply,
        });
    }
    else {
        return;
    }
};
function generalTests(command, msgOrInter, Errors) {
    var _a;
    const userId = msgOrInter.author
        ? msgOrInter.author.id
        : msgOrInter.user.id;
    if (command.default &&
        ((_a = utils_1.Settings.get("client").disabledDefaultCommands) === null || _a === void 0 ? void 0 : _a.includes(command.name)))
        return false;
    if (command.testOnly) {
        if (!utils_1.Settings.get("client").testServers.includes(msgOrInter.guild.id)) {
            const res = Errors === null || Errors === void 0 ? void 0 : Errors.testOnly;
            if (!res)
                return false;
            msgOrInter.reply(useResponse(res));
            return false;
        }
    }
    if (command.devOnly) {
        if (!utils_1.Settings.get("client").devs.includes(userId)) {
            const res = Errors === null || Errors === void 0 ? void 0 : Errors.devOnly;
            if (!res)
                return false;
            msgOrInter.reply(useResponse(res));
            return false;
        }
    }
    return;
}
const useResponse = (res) => {
    if (!res)
        return "error";
    if (typeof res == "string") {
        return {
            content: res,
        };
    }
    else if (typeof res == "object") {
        return {
            embeds: [res],
        };
    }
    else {
        return "error";
    }
};
//# sourceMappingURL=handler.js.map