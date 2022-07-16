import { Guild } from "discord.js";
import Prefix from "../entity/Prefixes";
import { Command } from "../typings";
import { Cache, Responses, Settings } from "../utils";

export default {
  description: "Change the prefix for this guild",
  options: [
    {
      description: "Set the new prefix",
      name: "prefix",
      type: "STRING",
    },
  ],
  permission: "ADMINISTRATOR",
  slash: "both",
  default: true,
  expectedArgs: "[prefix]",
  maxArgs: 1,
  async run({ client, interaction, message, args }) {
    let prefix: string;
    let guildExists: boolean;
    let guildId: string;
    if (message) {
      if (!message.guild) return;
      guildExists = (await Prefix.findOne({
        where: { guildId: message.guild.id },
      }))
        ? true
        : false;

      guildId = message.guild.id;

      if (args && args.length < 1) {
        const guildDb = await Prefix.findOne({
          where: { guildId: message.guild.id },
        });
        if (!guildDb)
          return Responses.embeds.Success(
            `Current prefix is: ${Settings.get("client").defaultPrefix || "!"}`
          );
        return Responses.embeds.Success(`Current prefix is: ${guildDb.prefix}`);
      }

      if (!args || !args[0]) return;

      if (args[0].length > 32) return Responses.embeds.Error("Prefix too long");
      prefix = args[0].trim();
    } else if (interaction && interaction.guild) {
      guildExists = (await Prefix.findOne({
        where: { guildId: interaction.guild.id },
      }))
        ? true
        : false;

      guildId = interaction.guild.id;
      const newPrefix = interaction.options.getString("prefix");
      if (!newPrefix) {
        const guildDb = await Prefix.findOne({
          where: { guildId: interaction.guild.id },
        });
        if (!guildDb)
          return Responses.embeds.Success(
            `Current prefix is: ${Settings.get("client").defaultPrefix || "!"}`
          );
        return Responses.embeds.Success(`Current prefix is: ${guildDb.prefix}`);
      }

      if (newPrefix.length > 32)
        return Responses.embeds.Error("Prefix too long");
      prefix = newPrefix.trim();
    } else {
      return;
    }

    Cache.prefixes.set(guildId, prefix);
    if (guildExists) {
      await Prefix.update({ guildId }, { prefix });
      return Responses.embeds.Success(`Updated prefix to ${prefix}`);
    } else {
      await Prefix.insert({ guildId, prefix });
      return Responses.embeds.Success(`Set prefix to ${prefix}`);
    }
  },
} as Command;
