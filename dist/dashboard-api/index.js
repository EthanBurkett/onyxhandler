"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const pg_1 = require("pg");
const createApp_1 = require("./utils/createApp");
const discord_1 = require("./strategies/discord");
exports.Settings = {
    pgPool: new pg_1.Pool(),
    token: "",
    clientUri: "http://localhost:3000",
    apiport: 3001,
    apiUri: "http://localhost:3001",
    clientID: "",
    clientSecret: "",
    callbackURL: "",
};
exports.default = async (settings) => {
    exports.Settings = settings;
    (0, discord_1.init)(settings);
    await (0, createApp_1.createApp)(settings);
};
//# sourceMappingURL=index.js.map