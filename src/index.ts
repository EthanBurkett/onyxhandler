import Onyx, { ISettings, lang } from "./typings";
import {
  CachePrefixes,
  Commands,
  Console,
  Events,
  LoadCommands,
  LoadEntities,
  LoadEvents,
  LoadResolvers,
  PrivateSettings,
  Settings,
} from "./utils";
import { CommandHandler } from "./lib/handler";
import { Client, Intents, OAuth2Guild } from "discord.js";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { DataSource } from "typeorm";
import langFile from "./lib/lang";
import path from "path";
import chalk from "chalk";

export default function Onyx(settings: ISettings): Onyx {
  for (let Setting in settings) {
    const setting: any = Setting;
    Settings.set(setting, settings[setting]);
  }

  const intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    ...settings.client.intents!,
  ];
  const client: Client = new Client({
    intents,
  });

  const app = express();
  app.get("/", (_, res) => {
    res.redirect("/graphql");
  });
  (async () => {
    const entities = await LoadEntities();

    new DataSource({
      ...settings.postgres.dataSource,
      entities,
    })
      .initialize()
      .then(async () => {
        Console.log("server", "Postgres Initialized");
      })
      .catch((error) => {
        Console.error("server", error);
        process.exit(1);
      });

    const resolvers = (await LoadResolvers()) as any;

    const apolloServer = new ApolloServer({
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
      schema: await buildSchema({
        resolvers,
      }),
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({
      app,
    });
    app.listen(settings.postgres.graphql?.playgroundPort || 4000, () =>
      Console.log(
        "server",
        `GraphQL playground listening on http://localhost:${
          settings.postgres.graphql?.playgroundPort || 4000
        }`
      )
    );
  })();

  client.on("ready", async () => {
    Console.log("bot", `${client.user!.tag} is now online!`);
    PrivateSettings.lang = langFile;
    PrivateSettings.client = client;

    const lang = langFile;
    if (settings.client.langFile) {
      const userLang = settings.client.langFile;

      PrivateSettings.lang = {
        errors: {
          ...lang.errors,
          ...userLang.errors,
        },
        success: {
          ...lang.success,
          ...userLang.success,
        },
      };
    }
    if (settings.client.testServers) {
      await client.guilds.fetch().then((guilds) => {
        for (const guildId of settings.client.testServers!) {
          const testServer = guilds.find(({ id }) => id == guildId);
          if (!testServer) {
            Console.error(
              "bot",
              `A guild id provided in field "testServers" is invalid as the client is not in that server.`
            );
            process.exit(1);
          }
        }
      });
    }
    await LoadCommands(client).then(async () => {
      Console.log(
        "bot",
        `Loaded ${Commands.filter((cmd) => !cmd.default).size} command(s)${
          Commands.filter(
            (cmd) =>
              cmd.default &&
              !settings.client.disabledDefaultCommands?.includes(
                cmd.name as any
              )
          ).size === 0
            ? ""
            : ` and ${
                Commands.filter((cmd) => cmd.default).size
              } default command(s) `
        }${
          Commands.filter((cmd) => !cmd.default).size === 0
            ? chalk.grey(
                `\n${chalk.bold(
                  "Cause of 0 commands:"
                )} \n- Your directory may be incorrect, remember to include any subdirectories the folder might be under.\n- There are no command files.`
              )
            : ""
        }`
      );
      await CachePrefixes();
      CommandHandler({
        client,
      });
    });
    if (settings.client.events)
      await LoadEvents(client).then(async () => {
        Console.log(
          "bot",
          `Loaded ${Events.size} event(s) ${
            Events.size === 0
              ? chalk.grey(
                  `Tip: You can remove the "events" property to hide this since there are no events.`
                )
              : ""
          }`
        );
      });
  });

  client.login(settings.client.token).catch((err) => Console.error("bot", err));

  return {
    client: () => PrivateSettings.client!,
    commands: () => Commands,
    events: () => Events,
  };
}
