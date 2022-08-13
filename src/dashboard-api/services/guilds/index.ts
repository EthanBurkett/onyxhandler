import axios, { AxiosResponse } from "axios";
import { DISCORD_API_URL } from "../../utils/constants";
import { Settings } from "../../";
import { PartialGuild } from "../../utils/typings";
import User from "../../../entity/APIUsers";
import { Console } from "../../../utils";

export function getBotGuildsService(): Promise<
  AxiosResponse<PartialGuild[], any>
> {
  return axios.get<PartialGuild[]>(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: {
      Authorization: `Bot ${Settings.token}`,
    },
  });
}

export async function getUserGuildsService(id: string) {
  const user = await User.findOneBy({ discordId: id });
  if (!user) {
    Console.error("dashboard", "No user found");
    process.exit(0);
  }

  return axios.get<PartialGuild[]>(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
}

export async function getMutualGuildsService(id: string) {
  const { data: botGuilds } = await getBotGuildsService();
  const { data: userGuilds } = await getUserGuildsService(id);

  const adminUserGuilds = userGuilds.filter(
    ({ permissions }) => (parseInt(permissions) & 0x8) === 0x8
  );
  return adminUserGuilds.filter((guild) =>
    botGuilds.some((botGuild) => botGuild.id == guild.id)
  );
}

export function getGuildService(id: string) {
  return axios.get(`${DISCORD_API_URL}/guilds/${id}`, {
    headers: {
      Authorization: `Bot ${Settings.token}`,
    },
  });
}
