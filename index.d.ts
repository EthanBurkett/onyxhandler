import {
  ApplicationFlags,
  BaseClientEvents,
  ClientEvents,
  IntentsString,
  TextBasedChannel,
  UserFlagsString,
} from "discord.js";
import { DataSource, DataSourceOptions } from "typeorm";
import {
  Client,
  Message,
  Collection,
  Guild,
  GuildChannel,
  GuildMember,
  User,
  MessageEmbed,
  DMChannel,
  PartialDMChannel,
  NewsChannel,
  TextChannel,
  ThreadChannel,
  PermissionString,
  HexColorString,
  ColorResolvable,
  Interaction,
  ApplicationCommandOptionData,
  CommandInteraction,
  CacheType,
  CommandInteractionOption,
  CommandInteractionOptionResolver,
} from "discord.js";

export interface Onyx {
  client: () => Client;
  commands: () => Collection<string, Command>;
  events: () => Collection<string, Function>;
}

export interface lang {
  errors: IErrors;
  success: {
    prefixChanged?(prefix: string): string | MessageEmbed | false;
  };
}

export interface IErrors {
  minArgs?(minimum: number, expected: string): string | MessageEmbed | false;
  maxArgs?(maximum: number, expected: string): string | MessageEmbed | false;
  testOnly?: string | MessageEmbed | false;
  devOnly?: string | MessageEmbed | false;
  noPermission?(permission: string): string | MessageEmbed | false;
}

export interface ISettings {
  typescript?: boolean;
  client: {
    devs?: string[];
    commands: string;
    token: string;
    events?: string;
    intents?: number[];
    testServers?: string[];
    defaultPrefix?: string;
    langFile?: lang;
    disabledDefaultCommands?: ["prefix"];
  };
  postgres: {
    graphql?: {
      playgroundPort?: number;
    };
    dataSource: DataSourceOptions;
    entityDir: string;
    resolversDir: string;
  };
}

export interface Command {
  name?: string;
  description: string;
  slash?: true | "both";
  permission?: PermissionString;
  testOnly?: boolean;
  options?: ApplicationCommandOptionData[];
  maxArgs?: number;
  minArgs?: number;
  expectedArgs?: string;
  devOnly?: boolean;
  aliases?: string[];
  [key: string]: any;
  run(obj: ICallbackOptions):
    | {
        custom?: boolean;
        content?: string;
        components?: any[];
        embeds?: MessageEmbed[];
        files?: any[];
        attachments?: any[];
      }
    | string
    | MessageEmbed
    | undefined;
}

export interface ICallbackOptions {
  user: User;
  options?: Omit<
    CommandInteractionOptionResolver<CacheType>,
    "getMessage" | "getFocused"
  >;
  message: Message<boolean> | null;
  interaction: CommandInteraction<CacheType> | null;
  guild: Guild;
  args: string[];
  client: Client;
  channel:
    | DMChannel
    | PartialDMChannel
    | NewsChannel
    | TextChannel
    | ThreadChannel
    | null
    | TextBasedChannel;
  member: GuildMember;
}
