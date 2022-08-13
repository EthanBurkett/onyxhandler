"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachePrefixes = exports.LoadCommands = exports.LoadEvents = exports.LoadEntities = exports.LoadResolvers = exports.Console = exports.Responses = exports.PrivateSettings = exports.Cache = exports.DefaultCommands = exports.Events = exports.Commands = exports.Settings = void 0;
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
const Prefixes_1 = __importDefault(require("./entity/Prefixes"));
const PG = (0, util_1.promisify)(glob_1.glob);
exports.Settings = new discord_js_1.Collection();
exports.Commands = new discord_js_1.Collection();
exports.Events = new discord_js_1.Collection();
exports.DefaultCommands = 0;
exports.Cache = {
    prefixes: new discord_js_1.Collection(),
};
exports.PrivateSettings = {
    client: null,
    lang: null,
    dashboard: null,
};
exports.Responses = {
    embeds: {
        Error(title, EmbedData) {
            return new discord_js_1.MessageEmbed(Object.assign({}, EmbedData))
                .setColor(0xa84032)
                .setTitle(title);
        },
        Success(title, EmbedData) {
            return new discord_js_1.MessageEmbed(Object.assign({}, EmbedData))
                .setColor(0x32a848)
                .setTitle(":white_check_mark:   " + title);
        },
    },
};
exports.Console = {
    log: (type, message, ...optionalParams) => {
        console.log(chalk_1.default.magentaBright.bold(`Onyx Library ${chalk_1.default.grey(`(${type})`)} 🢂`), message, ...optionalParams);
    },
    error: (type, message, ...optionalParams) => {
        console.log(chalk_1.default.redBright.bold(`Error ${chalk_1.default.grey(`(${type})`)} 🢂`), message, ...optionalParams);
    },
};
const LoadResolvers = async () => {
    const files = [];
    (await PG(`${path_1.default.join(process.cwd(), exports.Settings.get("postgres").resolversDir)}/**/*.ts`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        files.push(req);
    });
    (await PG(`${path_1.default.join(__dirname, "resolvers")}/**/*.js`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        files.push(req);
    });
    return files;
};
exports.LoadResolvers = LoadResolvers;
const LoadEntities = async () => {
    const files = [];
    (await PG(`${path_1.default.join(process.cwd(), exports.Settings.get("postgres").entityDir)}/**/*.ts`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        files.push(req);
    });
    (await PG(`${path_1.default.join(__dirname, "entity")}/**/*.js`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        files.push(req);
    });
    return files;
};
exports.LoadEntities = LoadEntities;
const LoadEvents = async (client) => {
    const files = [];
    (await PG(`${path_1.default.join(process.cwd(), exports.Settings.get("client").events)}/**/*.ts`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        const displayName = file
            .split("/")[file.split("/").length - 1].substring(0, file.split("/")[file.split("/").length - 1].length - 3);
        files.push({
            displayName,
            event: req,
        });
        exports.Events.set(displayName, req);
    });
    (await PG(`${path_1.default.join(__dirname, "events")}/**/*.js`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        const displayName = file
            .split("/")[file.split("/").length - 1].substring(0, file.split("/")[file.split("/").length - 1].length - 3);
        files.push({
            displayName,
            event: req,
        });
        exports.Events.set(displayName, req);
    });
    files.map(({ event }) => {
        event(client);
    });
    return files;
};
exports.LoadEvents = LoadEvents;
const LoadCommands = async (client) => {
    const files = [];
    (await PG(`${path_1.default.join(process.cwd(), exports.Settings.get("client").commands)}/**/*.ts`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        files.push({
            fileName: file.split("/"),
            command: req,
        });
    });
    (await PG(`${path_1.default.join(__dirname, "commands")}/**/*.js`)).map((file) => {
        let req = require(file);
        if (req.default)
            req = require(file).default;
        files.push({
            fileName: file.split("/"),
            command: req,
        });
    });
    files.map(({ command, fileName }) => {
        const file = fileName[fileName.length - 1];
        if (!command.name)
            command.name = file.slice(0, file.length - 3);
        const reqProps = ["description", "run"];
        for (const key of reqProps) {
            if (!command[key]) {
                exports.Console.error("bot", `No "${key}" property provided for command: ${command.name}`);
                process.exit(1);
            }
            if (command.slash) {
                if (exports.Settings.get("client").testServers && command.testOnly) {
                    exports.Settings.get("client").testServers.map((server) => {
                        create(client, command.name, command.description, command.options, server);
                    });
                }
                else {
                    create(client, command.name, command.description, command.options);
                }
            }
        }
        if (command.testOnly && !exports.Settings.get("client").testServers) {
            exports.Console.error("bot", `"testOnly" is set to true in command "${command.name}" but no test servers were provided.`);
            process.exit(1);
        }
        if (command.devOnly && !exports.Settings.get("client").devs) {
            exports.Console.error("bot", `"devOnly" is set to true in command "${command.name}" but no developer user IDs were provided.`);
            process.exit(1);
        }
        if (command.minArgs || command.maxArgs) {
            if (!command.expectedArgs) {
                exports.Console.error("bot", `Using command property "minArgs" or "maxArgs" requires having a "expectedArgs" property. Error occured in command "${command.name}"`);
                process.exit(1);
            }
        }
        if (command.default)
            exports.DefaultCommands++;
        exports.Commands.set(command.name, command);
    });
    await checkUnusedSlash(client);
    return files;
};
exports.LoadCommands = LoadCommands;
const CachePrefixes = async () => {
    const Prefixes = await Prefixes_1.default.find();
    Prefixes.map((guild) => {
        exports.Cache.prefixes.set(guild.guildId, guild.prefix);
    });
};
exports.CachePrefixes = CachePrefixes;
const checkUnusedSlash = async (client) => {
    var _a;
    exports.Console.log("bot", "Checking for unused slash commands...");
    client.guilds.cache.map(async (guild) => {
        await guild.commands.fetch();
        guild.commands.cache.map((slash) => {
            const cmd = exports.Commands.find((cmd) => cmd.name == slash.name);
            if (!cmd || !cmd.slash) {
                slash.delete();
                exports.Console.log("bot", `Removing guild slash command "${cmd && cmd.name ? cmd.name : slash.name}" due to ${cmd && cmd.name
                    ? 'property "slash" being disabled'
                    : "command not being found in files"}.`);
            }
        });
    });
    await ((_a = client.application) === null || _a === void 0 ? void 0 : _a.commands.fetch().then((commandMap) => {
        commandMap.map((cmd) => {
            const command = exports.Commands.get(cmd.name);
            if (!command)
                return;
            if (!command.slash) {
                cmd.delete();
                exports.Console.log("bot", `Removing slash command "${cmd.name}" due to property "slash" being disabled.`);
            }
        });
    }));
};
const didOptionsChange = (command, options) => {
    var _a;
    return (((_a = command.options) === null || _a === void 0 ? void 0 : _a.filter((opt, index) => {
        var _a, _b, _c;
        return ((opt === null || opt === void 0 ? void 0 : opt.required) !== ((_a = options[index]) === null || _a === void 0 ? void 0 : _a.required) &&
            (opt === null || opt === void 0 ? void 0 : opt.name) !== ((_b = options[index]) === null || _b === void 0 ? void 0 : _b.name) &&
            ((_c = opt === null || opt === void 0 ? void 0 : opt.options) === null || _c === void 0 ? void 0 : _c.length) !== options.length);
    }).length) !== 0);
};
const getCommands = (client, guildId) => {
    var _a, _b;
    if (guildId) {
        return (_a = client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
    }
    return (_b = client.application) === null || _b === void 0 ? void 0 : _b.commands;
};
const create = async (client, name, description, options, guildId) => {
    var _a, _b;
    let commands;
    if (guildId) {
        commands = (_a = client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
    }
    else {
        commands = (_b = client.application) === null || _b === void 0 ? void 0 : _b.commands;
    }
    if (!commands) {
        return;
    }
    await commands.fetch();
    const cmd = commands.cache.find((cmd) => cmd.name === name);
    if (cmd) {
        const optionsChanged = didOptionsChange(cmd, options);
        if ((cmd.options &&
            cmd.description &&
            options &&
            cmd.options.length != options.length) ||
            cmd.description !== description ||
            optionsChanged) {
            exports.Console.log("bot", `Updating${guildId ? " guild" : ""} slash command "${name}"`);
            return commands === null || commands === void 0 ? void 0 : commands.edit(cmd.id, {
                name,
                description,
                options,
            });
        }
        return Promise.resolve(cmd);
    }
    if (commands) {
        exports.Console.log("bot", `Creating${guildId ? " guild" : ""} slash command "${name}"`);
        const newCommand = await commands.create({
            name,
            description,
            options,
        });
        return newCommand;
    }
    return Promise.resolve(undefined);
};
const _delete = async (client, commandId, guildId) => {
    const commands = getCommands(client, guildId);
    if (commands) {
        const cmd = commands.cache.get(commandId);
        if (cmd) {
            exports.Console.log("bot", `Deleted${guildId ? " guild" : ""} slash command "${cmd.name}".`);
            cmd.delete();
        }
    }
    return Promise.resolve(undefined);
};
//# sourceMappingURL=utils.js.map