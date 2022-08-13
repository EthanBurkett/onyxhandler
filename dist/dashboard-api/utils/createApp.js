"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("../routes"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const utils_1 = require("../../utils");
const pgSession = require("connect-pg-simple")(express_session_1.default);
function createApp(Settings) {
    var _a;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cors_1.default)({
        origin: [(_a = Settings === null || Settings === void 0 ? void 0 : Settings.clientUri) !== null && _a !== void 0 ? _a : "http://localhost:3001"],
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        secret: "secretlol",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 * 60 * 24 * 7 },
        store: new pgSession({
            pool: Settings.pgPool,
            tableName: "sessions",
            createTableIfMissing: true,
        }),
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    app.use("/api", routes_1.default);
    app
        .listen(Settings.apiport)
        .on("listening", () => utils_1.Console.log("dashboard", `API started at ${Settings.apiUri ? Settings.apiUri : "http://localhost:3001"}`))
        .on("close", () => utils_1.Console.log(`dashboard`, `API closed`))
        .on("error", (e) => utils_1.Console.error("dashboard", e));
    return app;
}
exports.createApp = createApp;
//# sourceMappingURL=createApp.js.map