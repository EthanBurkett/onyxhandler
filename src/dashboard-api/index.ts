import { DashboardSettings } from "index";
import { Pool } from "pg";
import { createApp } from "./utils/createApp";
import { init } from "./strategies/discord";
import { Console } from "../utils";

export let Settings: DashboardSettings = {
  pgPool: new Pool(),
  token: "",
  clientUri: "http://localhost:3000",
  apiport: 3001,
  apiUri: "http://localhost:3001",
  clientID: "",
  clientSecret: "",
  callbackURL: "",
};

export default async (settings: DashboardSettings) => {
  Settings = settings;
  init(settings);

  await createApp(settings);
};
