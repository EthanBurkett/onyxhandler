"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = {
    errors: {
        maxArgs(maximum) {
            return utils_1.Responses.embeds.Error("Too many arguments", {
                description: `You can only supply up to ${maximum} argument(s).`,
            });
        },
        minArgs(minimum) {
            return utils_1.Responses.embeds.Error("Not enough arguments", {
                description: `You need to supply at least ${minimum} argument(s).`,
            });
        },
        noPermission(permission) {
            return utils_1.Responses.embeds.Error("No permission");
        },
        devOnly: utils_1.Responses.embeds.Error("That command is for developers only."),
        testOnly: utils_1.Responses.embeds.Error("This command can only be used in certain servers."),
    },
    success: {
        prefixChanged: (prefix) => utils_1.Responses.embeds.Success(`Updated prefix to ${prefix}`),
    },
};
//# sourceMappingURL=lang.js.map