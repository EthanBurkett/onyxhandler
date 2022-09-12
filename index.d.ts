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
  APIInteractionGuildMember,
  CacheType,
  CommandInteractionOption,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Pool } from "pg";

export default function Onyx(opts: ISettings);

export interface Onyx {
  client: () => Client;
  commands: () => Collection<string, Command>;
  events: () => Collection<string, Function>;
  dashboard: {
    startApi: (settings: DashboardSettings) => Promise<void>;
  };
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

export interface APIUser {}

export interface DashboardSettings {
  apiport: number;
  pgPool: Pool;
  token: string;
  clientUri?: string;
  apiUri?: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface IMiddleware {
  client: Client;
  channelId: string;
  guild: Guild;
  guildId: string;
  command: Command;
  channel:
    | DMChannel
    | PartialDMChannel
    | NewsChannel
    | TextChannel
    | ThreadChannel
    | null
    | TextBasedChannel;
  member: GuildMember | APIInteractionGuildMember;
  message: Message<boolean> | null;
  interaction: CommandInteraction<CacheType> | null;
}

export interface ISettings {
  client: {
    devs?: string[];
    commands: string;
    commandMiddleware?: ({}: IMiddleware) => Promise<boolean>;
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
  member: GuildMember | APIInteractionGuildMember;
}

export type Events = "Command.Legacy" | "Command.Slash" | "Command" | "Ready";
