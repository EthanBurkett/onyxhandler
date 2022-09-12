# Onyx Library

Onyx Library is an advanced discord handler that automatically reads all command and event files and pushes them to your own bot application. Onyx **requires** a GraphQL connection in order to use the library as there are default commands that use the database and the whole surface of onyx to center itself around using Postgres. Onyx brings something new to the table as all other handlers only implement simple MySQL or Mongo integration.

## Getting Started

Getting started is very quick and easy, just a simple function and 1 folder.

**Prerequisites:**

- GraphQL Server (Local/Hosted)

```ts
import Onyx from "onyxlibrary";

export default Onyx({
  client: {
    commands: "commands",
    token: "Your bot token",
  },
  postgres: {
    dataSource: {
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "Your postgres user password",
      database: "onyx",
      synchronize: true,
      logging: false,
      migrations: [],
      subscribers: [],
    }, // This is an object you can find documented at https://typeorm.io
    entityDir: "entity", // This is where all your postgres entities will be stored
    resolversDir: "resolvers", // All your queries and mutations will be stored here as resolvers
  },
});
```

## All Library Options

```ts
Onyx({
  client: {
    devs?: ["user id"];
    commands: "commands";
    token: "Your bot token";
    events?: "events";
    intents?: [DiscordJS.Intents.FLAGS.GUILD_MEMBERS];
    testServers?: ["server id"];
    defaultPrefix?: "?";
    langFile?: require('./lang');
    disabledDefaultCommands?: ["prefix"];
  };
  postgres: {
    graphql?: {
      playgroundPort?: 3000; // defaults to 4000
    };
    dataSource: {};
    entityDir: 'entity';
    resolversDir: 'resolvers;
  };
})
```

## Command Middleware

With the latest update you can now have a function run when a user executes commands but run your desired function before the actual command executes, leading to more advanced features like channel only commands

`index.ts`

```ts
import Onyx from "onyxlibrary";
import middleware from "./middleware";

Onyx({
  client: {
    commands: "src/commands",
    token: config.BOT_TOKEN,
    commandMiddleware: async (obj) => await middleware(obj),
  },
  postgres: {
    dataSource,
    entityDir: "src/entity",
    resolversDir: "src/resolvers",
  },
});
```

`middleware/index.ts`

```ts
import { IMiddleware } from "onyxlibrary";

export default async ({
  guildId,
  channelId,
  guild,
  channel,
  client,
  member,
  command,
  message,
  interaction,
}: IMiddleware): Promise<boolean> => {
  if (command.name == "cancelme") return false; // Returning false anywhere will make the command not run
  if (command.name == "cancelandreply") {
    // You can also reply to a message or interaction before cancelling the commmand
    if (message) message.reply("Legacy command cancelled");
    else interaction.reply("Slash command cancelled");

    return false;
  }

  // If your middleware is set up with any statements to return false. ALWAYS make sure to return true at the bottom
  return true;
};
```

## Creating a command

Creating a command is as simple as creating a new file and exporting an object

`commands/ping.ts`

```ts
import { Command } from "onyxlibrary";

export default {
  description: "This is the ping command!",
  run() {
    return "Pong!";
  },
} as Command;
```

### All Command Options

```ts
import { Command } from "onyxlibrary";

export default {
  name: "ping",
  description: "sends back pong!",
  slash: "both",
  permission: "ADMINISTRATOR",
  testOnly: true,
  options: [
    {
      name: "user",
      type: "USER",
      description: "Ping a user in the message",
      required: false,
    },
  ],
  maxArgs: 1,
  minArgs: 0,
  expectedArgs: "[user]",
  devOnly: true,
  aliases: ["p"],
  run({
    message,
    client,
    interaction,
    args,
    channel,
    guild,
    member,
    user,
    options,
  }) {
    return new MessageEmbed().setTitle("Pong!");
  },
} as Command;
```

## Making events

Making events is simple, just create one file and add your `client.on` handlers! Make sure you set your events directory in your Onyx initialize function!
There are also custom events for when a user runs an all around command, a legacy command, or a slash command!

`events/general.ts`

```ts
import { Client, Message } from "discord.js";
import { Events } from "onyxlibrary";

export const run = (client: Client<boolean>) => {
  client.on("message", (message) => {
    console.log(message.content);
  });

  client.on<Events>(
    "Command",
    ({
      // Works for slash and legacy commands
      message,
      interaction,
      command,
    }) => {
      // do stuff
    }
  );

  client.on<Events>(
    "Command.Legacy",
    ({
      // Only runs when a legacy command is used
      message,
      command,
    }) => {
      // do stuff
    }
  );

  client.on<Events>(
    "Command.Slash",
    ({
      // Only runs when a slash command is used
      interaction,
      command,
    }) => {
      // do stuff
    }
  );
};
```

## Quality of Life Customizatios

### Default Messages

Firstly, create a new file and call it whatever you want, we're gonna use 'lang.js' in this example. When setting the messages you can use strings or embeds, or if you'd like it disabled just set it to false.

```ts
import { lang } from 'onyxlibrary'

export default {
  errors: {
    minArgs(minimum, expected) { return new MessageEmbed().setTitle(`You need to supply at least ${minimum} args`).setDescription(`${expected}`) },
    maxArgs(maximum, expected) { return new MessageEmbed().setTitle(`You can only supply up to ${maximum} args`).setDescription(`${expected}`) },
    testOnly: false
    devOnly: "This command is for devs only",
    noPermission(permission) { return 'No permission. Permission required '+permission }
  },
  success: {
    prefixChanged(prefix) { return `Updated the prefix to ${prefix}` }
  }
} as lang
```

## Soon To Be Added

These are features that we as a developer team have planned for this package

- Website with discord authentication to skip the hassle of setting it up
- Potentially added client control from the premade dashboard (maybe)
- More features to bring to your bot
- More default commands
