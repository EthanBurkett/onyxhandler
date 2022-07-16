import { Responses } from "../utils";
import { lang } from "../typings";

export default {
  errors: {
    maxArgs(maximum) {
      return Responses.embeds.Error("Too many arguments", {
        description: `You can only supply up to ${maximum} argument(s).`,
      });
    },
    minArgs(minimum) {
      return Responses.embeds.Error("Not enough arguments", {
        description: `You need to supply at least ${minimum} argument(s).`,
      });
    },
    noPermission(permission) {
      return Responses.embeds.Error("No permission");
    },
    devOnly: Responses.embeds.Error("That command is for developers only."),
    testOnly: Responses.embeds.Error(
      "This command can only be used in certain servers."
    ),
  },
  success: {
    prefixChanged: (prefix) =>
      Responses.embeds.Success(`Updated prefix to ${prefix}`),
  },
} as lang;
