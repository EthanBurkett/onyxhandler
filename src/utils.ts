import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  Client,
  Collection,
  MessageEmbed,
  MessageEmbedOptions,
} from "discord.js";
import chalk from "chalk";
import { promisify } from "util";
import { Command, lang } from "./index.d";
import { glob } from "glob";
import path from "path";
import Prefix from "./entity/Prefixes";
const PG = promisify(glob);

export const Settings = new Collection<string, any>();
export const Commands = new Collection<string, Command>();
export const Events = new Collection<string, Function>();
export let DefaultCommands: number = 0;
export const Cache = {
  prefixes: new Collection<string, string>(),
};
export const PrivateSettings: {
  lang: lang | null;
  client: Client<boolean> | null;
} = {
  client: null,
  lang: null,
};

export const Responses = {
  embeds: {
    Error(title: string, EmbedData?: MessageEmbedOptions) {
      return new MessageEmbed({
        ...EmbedData,
      })
        .setColor(0xa84032)
        .setTitle(title);
    },
    Success(title: string, EmbedData?: MessageEmbedOptions) {
      return new MessageEmbed({
        ...EmbedData,
      })
        .setColor(0x32a848)
        .setTitle(":white_check_mark:   " + title);
    },
  },
};

type ConsoleTypes = "bot" | "server";
export const Console = {
  log: (type: ConsoleTypes, ...data: string[]) => {
    console.log(
      chalk.magentaBright.bold(`Onyx Library ${chalk.grey(`(${type})`)} 🢂`),
      ...data
    );
  },
  error: (type: ConsoleTypes, ...data: string[]) => {
    console.log(
      chalk.redBright.bold(`Error ${chalk.grey(`(${type})`)} 🢂`),
      ...data
    );
  },
};

export const LoadResolvers = async () => {
  const files: any[] = [];
  (
    await PG(
      `${path.join(
        process.cwd(),
        Settings.get("postgres")!.resolversDir
      )}/**/*.ts}`
    )
  ).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    files.push(req);
  });
  (await PG(`${path.join(__dirname, "resolvers")}/**/*.js`)).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    files.push(req);
  });

  return files;
};

export const LoadEntities = async () => {
  const files: any[] = [];
  (
    await PG(
      `${path.join(process.cwd(), Settings.get("postgres")!.entityDir)}/**/*.ts
      }`
    )
  ).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    files.push(req);
  });
  (await PG(`${path.join(__dirname, "entity")}/**/*.js`)).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    files.push(req);
  });

  return files;
};

export const LoadEvents = async (client: Client) => {
  const files: { displayName: string; event: Function }[] = [];
  (
    await PG(
      `${path.join(process.cwd(), Settings.get("client")!.events)}/**/*.ts
      }`
    )
  ).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;
    const displayName = file
      .split("/")
      [file.split("/").length - 1].substring(
        0,
        file.split("/")[file.split("/").length - 1].length - 3
      );

    files.push({
      displayName,
      event: req,
    });

    Events.set(displayName, req);
  });
  (await PG(`${path.join(__dirname, "events")}/**/*.js`)).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    const displayName = file
      .split("/")
      [file.split("/").length - 1].substring(
        0,
        file.split("/")[file.split("/").length - 1].length - 3
      );

    files.push({
      displayName,
      event: req,
    });

    Events.set(displayName, req);
  });

  files.map(({ event }) => {
    event(client);
  });

  return files;
};

export const LoadCommands = async (client: Client) => {
  const files: { command: Command; fileName: string[] }[] = [];
  (
    await PG(
      `${path.join(process.cwd(), Settings.get("client")!.commands)}/**/*.ts
      }`
    )
  ).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    files.push({
      fileName: file.split("/"),
      command: req,
    });
  });
  (await PG(`${path.join(__dirname, "commands")}/**/*.js`)).map((file) => {
    let req = require(file);
    if (req.default) req = require(file).default;

    files.push({
      fileName: file.split("/"),
      command: req,
    });
  });

  files.map(({ command, fileName }) => {
    const file = fileName[fileName.length - 1];
    if (!command.name) command.name = file.slice(0, file.length - 3);

    const reqProps = ["description", "run"];
    for (const key of reqProps) {
      if (!command[key]) {
        Console.error(
          "bot",
          `No "${key}" property provided for command: ${command.name}`
        );
        process.exit(1);
      }

      if (command.slash) {
        if (Settings.get("client").testServers && command.testOnly) {
          Settings.get("client").testServers.map((server: string) => {
            create(
              client,
              command!.name!,
              command!.description,
              command!.options!,
              server
            );
          });
        } else {
          create(client, command.name!, command.description, command.options!);
        }
      }
    }

    if (command.testOnly && !Settings.get("client").testServers) {
      Console.error(
        "bot",
        `"testOnly" is set to true in command "${command.name}" but no test servers were provided.`
      );
      process.exit(1);
    }

    if (command.devOnly && !Settings.get("client").devs) {
      Console.error(
        "bot",
        `"devOnly" is set to true in command "${command.name}" but no developer user IDs were provided.`
      );
      process.exit(1);
    }

    if (command.minArgs || command.maxArgs) {
      if (!command.expectedArgs) {
        Console.error(
          "bot",
          `Using command property "minArgs" or "maxArgs" requires having a "expectedArgs" property. Error occured in command "${command.name}"`
        );
        process.exit(1);
      }
    }

    if (command.default) DefaultCommands++;
    Commands.set(command.name, command);
  });

  await checkUnusedSlash(client);

  return files;
};

export const CachePrefixes = async () => {
  const Prefixes = await Prefix.find();
  Prefixes.map((guild) => {
    Cache.prefixes.set(guild.guildId, guild.prefix);
  });
};

/**
 * REGISTER SLASH COMMANDS
 */
const checkUnusedSlash = async (client: Client) => {
  Console.log("bot", "Checking for unused slash commands...");
  client.guilds.cache.map(async (guild) => {
    await guild.commands.fetch();
    guild.commands.cache.map((slash) => {
      const cmd = Commands.find((cmd) => cmd.name == slash.name);
      if (!cmd || !cmd.slash) {
        slash.delete();
        Console.log(
          "bot",
          `Removing guild slash command "${
            cmd && cmd.name ? cmd.name : slash.name
          }" due to ${
            cmd && cmd.name
              ? 'property "slash" being disabled'
              : "command not being found in files"
          }.`
        );
      }
    });
  });

  await client.application?.commands.fetch().then((commandMap) => {
    commandMap.map((cmd) => {
      const command = Commands.get(cmd.name);
      if (!command) return;
      if (!command.slash) {
        cmd.delete();
        Console.log(
          "bot",
          `Removing slash command "${cmd.name}" due to property "slash" being disabled.`
        );
      }
    });
  });
};

const didOptionsChange = (
  command: ApplicationCommand,
  options: ApplicationCommandOptionData[] | any
): boolean => {
  return (
    command.options?.filter((opt: any, index: any) => {
      return (
        opt?.required !== options[index]?.required &&
        opt?.name !== options[index]?.name &&
        opt?.options?.length !== options.length
      );
    }).length !== 0
  );
};

const getCommands = (client: Client, guildId?: string) => {
  if (guildId) {
    return client.guilds.cache.get(guildId)?.commands;
  }

  return client.application?.commands;
};

const create = async (
  client: Client,
  name: string,
  description: string,
  options: ApplicationCommandOptionData[],
  guildId?: string
): Promise<ApplicationCommand<{}> | undefined> => {
  let commands;

  if (guildId) {
    commands = client.guilds.cache.get(guildId)?.commands;
  } else {
    commands = client.application?.commands;
  }

  if (!commands) {
    return;
  }

  // @ts-ignore
  await commands.fetch();

  const cmd = commands.cache.find(
    (cmd) => cmd.name === name
  ) as ApplicationCommand;

  if (cmd) {
    const optionsChanged = didOptionsChange(cmd, options);

    if (
      (cmd.options &&
        cmd.description &&
        options &&
        cmd.options.length != options.length!) ||
      cmd.description !== description ||
      optionsChanged
    ) {
      Console.log(
        "bot",
        `Updating${guildId ? " guild" : ""} slash command "${name}"`
      );

      return commands?.edit(cmd.id, {
        name,
        description,
        options,
      });
    }

    return Promise.resolve(cmd);
  }

  if (commands) {
    Console.log(
      "bot",
      `Creating${guildId ? " guild" : ""} slash command "${name}"`
    );

    const newCommand = await commands.create({
      name,
      description,
      options,
    });

    return newCommand;
  }

  return Promise.resolve(undefined);
};

const _delete = async (
  client: Client,
  commandId: string,
  guildId?: string
): Promise<ApplicationCommand<{}> | undefined> => {
  const commands = getCommands(client, guildId);
  if (commands) {
    const cmd = commands.cache.get(commandId);
    if (cmd) {
      Console.log(
        "bot",
        `Deleted${guildId ? " guild" : ""} slash command "${cmd.name}".`
      );

      cmd.delete();
    }
  }

  return Promise.resolve(undefined);
};
