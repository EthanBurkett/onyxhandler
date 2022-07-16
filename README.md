# Onyx Library

Onyx Library is an advanced discord handler that automatically reads all command and event files and pushes them to your own bot application. Onyx **requires** a GraphQL connection in order to use the library as there are default commands that use the database and the whole surface of onyx to center itself around using Postgres. Onyx brings something new to the table as all other handlers only implement simple MySQL or Mongo integration.

## Getting Started

Getting started is very quick and easy, just a simple function and 1 folder.

**Prerequisites:**

- GraphQL Server (Local/Hosted)

### Using JavaScript

```js
const Onyx = require("onyxlibrary");

module.exports = Onyx({
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

### Using Typescript

```ts
import Onyx from "onyxlibrary";

export default Onyx({
  typescript: true,
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

```js
Onyx({
  typescript?: true | false;
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

## Creating a command

Creating a command is as simple as creating a new file and exporting an object

### Using JavaScript

`commands/ping.js`

```js
module.exports = {
  description: "This is the ping command!",
  run() {
    return "Pong!";
  },
};
```

### Using TypeScript

`commands/ping.ts`

```js
import { Command } from 'onyxlibrary';

export default {
  description: "This is the ping command!",
  run() {
    return "Pong!";
  },
} as Command;
```

### All Command Options

```js
module.exports = {
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
};
```

## Quality of Life Customizatios

### Default Messages

Firstly, create a new file and call it whatever you want, we're gonna use 'lang.js' in this example. When setting the messages you can use strings or embeds, or if you'd like it disabled just set it to false.

### In JavaScript

```js
module.exports = {
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
}
```

### In TypeScript

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
