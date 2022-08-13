"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const handler_1 = require("./lib/handler");
const discord_js_1 = require("discord.js");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const lang_1 = __importDefault(require("./lib/lang"));
const chalk_1 = __importDefault(require("chalk"));
const dashboard_api_1 = __importDefault(require("./dashboard-api"));
function Onyx(settings) {
    for (let Setting in settings) {
        const setting = Setting;
        utils_1.Settings.set(setting, settings[setting]);
    }
    const intents = settings.client.intents
        ? [
            discord_js_1.Intents.FLAGS.GUILDS,
            discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
            ...settings.client.intents,
        ]
        : [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES];
    const client = new discord_js_1.Client({
        intents,
    });
    const app = (0, express_1.default)();
    app.get("/", (_, res) => {
        res.redirect("/graphql");
    });
    (async () => {
        var _a;
        const entities = await (0, utils_1.LoadEntities)();
        new typeorm_1.DataSource(Object.assign(Object.assign({}, settings.postgres.dataSource), { entities }))
            .initialize()
            .then(async () => {
            utils_1.Console.log("server", "Postgres Initialized");
        })
            .catch((error) => {
            utils_1.Console.error("server", error);
            process.exit(1);
        });
        const resolvers = (await (0, utils_1.LoadResolvers)());
        const apolloServer = new apollo_server_express_1.ApolloServer({
            plugins: [apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground],
            schema: await (0, type_graphql_1.buildSchema)({
                resolvers,
            }),
        });
        await apolloServer.start();
        apolloServer.applyMiddleware({
            app,
        });
        app.listen(((_a = settings.postgres.graphql) === null || _a === void 0 ? void 0 : _a.playgroundPort) || 4000, () => {
            var _a;
            return utils_1.Console.log("server", `GraphQL playground listening on http://localhost:${((_a = settings.postgres.graphql) === null || _a === void 0 ? void 0 : _a.playgroundPort) || 4000}`);
        });
    })();
    client.on("ready", async () => {
        utils_1.Console.log("bot", `${client.user.tag} is now online!`);
        utils_1.PrivateSettings.lang = lang_1.default;
        utils_1.PrivateSettings.client = client;
        const lang = lang_1.default;
        if (settings.client.langFile) {
            const userLang = settings.client.langFile;
            utils_1.PrivateSettings.lang = {
                errors: Object.assign(Object.assign({}, lang.errors), userLang.errors),
                success: Object.assign(Object.assign({}, lang.success), userLang.success),
            };
        }
        if (settings.client.testServers) {
            await client.guilds.fetch().then((guilds) => {
                for (const guildId of settings.client.testServers) {
                    const testServer = guilds.find(({ id }) => id == guildId);
                    if (!testServer) {
                        utils_1.Console.error("bot", `A guild id provided in field "testServers" is invalid as the client is not in that server.`);
                        process.exit(1);
                    }
                }
            });
        }
        await (0, utils_1.LoadCommands)(client).then(async () => {
            utils_1.Console.log("bot", `Loaded ${utils_1.Commands.filter((cmd) => !cmd.default).size} command(s)${utils_1.Commands.filter((cmd) => {
                var _a;
                return cmd.default &&
                    !((_a = settings.client.disabledDefaultCommands) === null || _a === void 0 ? void 0 : _a.includes(cmd.name));
            }).size === 0
                ? ""
                : ` and ${utils_1.Commands.filter((cmd) => cmd.default).size} default command(s) `}${utils_1.Commands.filter((cmd) => !cmd.default).size === 0
                ? chalk_1.default.grey(`\n${chalk_1.default.bold("Cause of 0 commands:")} \n- Your directory may be incorrect, remember to include any subdirectories the folder might be under.\n- There are no command files.`)
                : ""}`);
            await (0, utils_1.CachePrefixes)();
            (0, handler_1.CommandHandler)({
                client,
            });
        });
        if (settings.client.events)
            await (0, utils_1.LoadEvents)(client).then(async () => {
                utils_1.Console.log("bot", `Loaded ${utils_1.Events.size} event(s) ${utils_1.Events.size === 0
                    ? chalk_1.default.grey(`Tip: You can remove the "events" property to hide this since there are no events.`)
                    : ""}`);
            });
    });
    client
        .login(settings.client.token)
        .catch((err) => utils_1.Console.error("bot", err.message));
    return {
        client: () => utils_1.PrivateSettings.client,
        commands: () => utils_1.Commands,
        events: () => utils_1.Events,
        dashboard: {
            startApi: (settings) => (0, dashboard_api_1.default)(settings),
        },
    };
}
exports.default = Onyx;
//# sourceMappingURL=index.js.map