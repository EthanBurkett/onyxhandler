import {
  CacheType,
  Client,
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
  Message,
  MessageEmbed,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import { Command, IErrors, lang } from "../../index.d";
import {
  Commands,
  Console,
  Responses,
  Settings,
  Cache,
  PrivateSettings,
} from "../utils";
import { permissionList } from "../validation/permissions";

export const CommandHandler = ({ client }: { client: Client<boolean> }) => {
  const Errors = PrivateSettings.lang?.errors;
  client.on("messageCreate", async (message) => {
    if (!message || !message.guild) return;
    const Prefix =
      Cache.prefixes.get(message.guild.id) ||
      Settings.get("client").defaultPrefix ||
      "!";
    let args = message.content.split(" ");
    const messagePrefix = args[0].slice(0, Prefix.length);
    if (messagePrefix != Prefix) return;

    const commandRan = args[0].slice(Prefix.length);
    let command = Commands.get(commandRan);
    if (!command)
      command = Commands.find(
        (cmd) => cmd.aliases! && cmd.aliases.includes(commandRan)
      );
    if (!command) return;

    if (command.slash === true) {
      message.reply({
        embeds: [Responses.embeds.Error("Command is slash only.")],
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
        if (!Errors || !Errors[Message]) return;
        const res = Errors[Message](...Args);
        if (!res) return;
        message.reply(useResponse(res));
        return;
      } else if (generalTestResult === false) {
        return;
      }
    }

    if (command.permission) {
      if (!message.member!.permissions.has(command.permission)) {
        if (!Errors || !Errors.noPermission) return;
        const res = Errors.noPermission(command.permission);
        if (!res) return;
        message.reply(useResponse(res));
        return;
      }
    }

    if (command.minArgs) {
      if (args.length < command.minArgs) {
        if (!Errors || !Errors.minArgs || !command.expectedArgs) return;
        const res = Errors.minArgs(command.minArgs, command.expectedArgs);
        if (!res) return;
        message.reply(useResponse(res));
        return;
      }
    }

    if (command.maxArgs) {
      if (args.length > command.maxArgs) {
        if (!Errors || !Errors.maxArgs || !command.expectedArgs) return;
        const res = Errors.maxArgs(command.maxArgs, command.expectedArgs);
        if (!res) return;
        message.reply(useResponse(res));
        return;
      }
    }

    let result = command.run({
      message,
      client,
      interaction: null,
      args,
      channel: message.channel as TextBasedChannel,
      guild: message.guild,
      member: message.member!,
      user: message.author,
      options: undefined,
    });
    if (result instanceof Promise) result = await result;

    replyFromCallback(message, result);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;
    const { commandName, guild, channelId } = interaction;

    const member = interaction.member as GuildMember;
    let command: Command | undefined = Commands.get(commandName);

    if (!command) return;

    if (!command.slash) {
      return interaction.reply({
        embeds: [Responses.embeds.Error("This command is slash disabled.")],
      });
    }

    const generalTestResult = generalTests(command, interaction, Errors);
    if (typeof generalTestResult === "object") {
      const [Message, Args] = [
        generalTestResult.message,
        generalTestResult.args,
      ];
      if (!Errors || !Errors[Message]) return;
      const res = Errors[Message](...Args);
      if (!res) return;
      interaction.reply(useResponse(res));
      return;
    } else if (generalTestResult === false) {
      return;
    }

    if (command.permission) {
      if (!permissionList.includes(command.permission)) {
        Console.error("bot", `Invalid permission node ${command.permission}`);
      }
      if (!interaction.memberPermissions?.has(command.permission)) {
        if (!Errors || !Errors.noPermission) return;
        const res = Errors.noPermission(command.permission);
        if (!res) return;
        interaction.reply(useResponse(res));
      }
    }

    let response = command.run({
      message: null,
      client,
      interaction,
      args: [],
      channel: interaction.channel as TextBasedChannel,
      guild: interaction.guild,
      member: interaction.member,
      user: interaction.user,
      options: interaction.options,
    });

    if (response instanceof Promise) response = await response;

    replyFromCallback(interaction, response);
  });
};

const replyFromCallback = (msgOrInter: any, reply: any) => {
  if (!reply) {
    return;
  } else if (reply.type == "rich" && typeof reply == "object") {
    msgOrInter.reply({
      embeds: [reply],
    });
  } else if (typeof reply == "object" && reply.custom) {
    msgOrInter.reply(reply);
  } else if (typeof reply == "string") {
    msgOrInter.reply({
      content: reply,
    });
  } else {
    return;
  }
};
function generalTests(
  command: Command,
  msgOrInter: any,
  Errors?: IErrors
):
  | undefined
  | boolean
  | {
      message: string;
      args: any[];
    } {
  const userId = msgOrInter.author
    ? /* Message */ msgOrInter.author.id
    : /* Interaction */ msgOrInter.user.id;

  if (
    command.default &&
    Settings.get("client").disabledDefaultCommands?.includes(
      command.name as any
    )
  )
    return false;

  if (command.testOnly) {
    if (!Settings.get("client").testServers.includes(msgOrInter.guild.id)) {
      const res = Errors?.testOnly;
      if (!res) return false;
      msgOrInter.reply(useResponse(res));
      return false;
    }
  }
  if (command.devOnly) {
    if (!Settings.get("client").devs.includes(userId)) {
      const res = Errors?.devOnly;
      if (!res) return false;
      msgOrInter.reply(useResponse(res));
      return false;
    }
  }

  return;
}

const useResponse = (res: false | string | MessageEmbed): any => {
  if (!res) return "error";
  if (typeof res == "string") {
    return {
      content: res,
    };
  } else if (typeof res == "object") {
    return {
      embeds: [res as MessageEmbed],
    };
  } else {
    return "error";
  }
};
