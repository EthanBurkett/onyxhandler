"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_discord_1 = require("passport-discord");
const APIUsers_1 = __importDefault(require("../../entity/APIUsers"));
const init = (Settings) => {
    passport_1.default.serializeUser((user, done) => {
        console.log(user);
        return done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await APIUsers_1.default.findOneBy({ id });
            return user ? done(null, user) : done(null, null);
        }
        catch (err) {
            console.log(err);
            return done(err, null);
        }
    });
    passport_1.default.use(new passport_discord_1.Strategy({
        clientID: Settings.clientID,
        clientSecret: Settings.clientSecret,
        callbackURL: Settings.callbackURL,
        scope: ["identify", "email", "guilds"],
    }, async (accessToken, refreshToken, profile, done) => {
        const { id: discordId } = profile;
        try {
            const existingUser = await APIUsers_1.default.findOne({
                where: {
                    discordId,
                },
            });
            if (existingUser) {
                await APIUsers_1.default.update({ discordId }, { accessToken, refreshToken });
                return done(null, existingUser);
            }
            const newUser = await APIUsers_1.default.insert({
                discordId,
                accessToken,
                refreshToken,
            });
            return done(null, newUser);
        }
        catch (e) {
            console.log(e);
            return done(e, undefined);
        }
    }));
};
exports.init = init;
//# sourceMappingURL=discord.js.map