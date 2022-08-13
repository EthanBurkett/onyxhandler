"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildService = exports.getMutualGuildsService = exports.getUserGuildsService = exports.getBotGuildsService = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../../utils/constants");
const __1 = require("../../");
const APIUsers_1 = __importDefault(require("../../../entity/APIUsers"));
const utils_1 = require("../../../utils");
function getBotGuildsService() {
    return axios_1.default.get(`${constants_1.DISCORD_API_URL}/users/@me/guilds`, {
        headers: {
            Authorization: `Bot ${__1.Settings.token}`,
        },
    });
}
exports.getBotGuildsService = getBotGuildsService;
async function getUserGuildsService(id) {
    const user = await APIUsers_1.default.findOneBy({ discordId: id });
    if (!user) {
        utils_1.Console.error("dashboard", "No user found");
        process.exit(0);
    }
    return axios_1.default.get(`${constants_1.DISCORD_API_URL}/users/@me/guilds`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
        },
    });
}
exports.getUserGuildsService = getUserGuildsService;
async function getMutualGuildsService(id) {
    const { data: botGuilds } = await getBotGuildsService();
    const { data: userGuilds } = await getUserGuildsService(id);
    const adminUserGuilds = userGuilds.filter(({ permissions }) => (parseInt(permissions) & 0x8) === 0x8);
    return adminUserGuilds.filter((guild) => botGuilds.some((botGuild) => botGuild.id == guild.id));
}
exports.getMutualGuildsService = getMutualGuildsService;
function getGuildService(id) {
    return axios_1.default.get(`${constants_1.DISCORD_API_URL}/guilds/${id}`, {
        headers: {
            Authorization: `Bot ${__1.Settings.token}`,
        },
    });
}
exports.getGuildService = getGuildService;
//# sourceMappingURL=index.js.map