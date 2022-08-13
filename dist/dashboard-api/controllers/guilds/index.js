"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildController = exports.getGuildPermissionsController = exports.getGuildsController = void 0;
const guilds_1 = require("../../services/guilds");
const utils_1 = require("../../../utils");
async function getGuildsController(req, res) {
    const user = req.user;
    try {
        const guilds = await (0, guilds_1.getMutualGuildsService)(user.id);
        res.send({ guilds });
    }
    catch (err) {
        utils_1.Console.error("dashboard", err);
        res.status(400).send({ msg: "Error" });
    }
}
exports.getGuildsController = getGuildsController;
async function getGuildPermissionsController(req, res) {
    const user = req.user;
    const { id } = req.params;
    try {
        const guilds = await (0, guilds_1.getMutualGuildsService)(user.id);
        const valid = guilds.some((guild) => guild.id === id);
        return valid ? res.sendStatus(200) : res.sendStatus(403);
    }
    catch (err) {
        utils_1.Console.error("dashboard", err);
        res.status(400).send({ msg: "Error" });
    }
    return;
}
exports.getGuildPermissionsController = getGuildPermissionsController;
async function getGuildController(req, res) {
    const { id } = req.params;
    try {
        const { data: guild } = await (0, guilds_1.getGuildService)(id);
        res.send(guild);
    }
    catch (e) {
        utils_1.Console.error("dashboard", e);
        res.status(400).send({ msg: "Error" });
    }
}
exports.getGuildController = getGuildController;
//# sourceMappingURL=index.js.map