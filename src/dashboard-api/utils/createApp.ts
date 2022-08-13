import express, { Express } from "express";
import routes from "../routes";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { DashboardSettings } from "../../..";
import { Console } from "../../utils";
const pgSession = require("connect-pg-simple")(session);

export function createApp(Settings: DashboardSettings): Express {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: [Settings?.clientUri ?? "http://localhost:3001"],
      credentials: true,
    })
  );

  app.use(
    session({
      secret: "secretlol",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 * 60 * 24 * 7 },
      store: new pgSession({
        pool: Settings.pgPool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api", routes);

  app
    .listen(Settings.apiport)
    .on("listening", () =>
      Console.log(
        "dashboard",
        `API started at ${
          Settings.apiUri ? Settings.apiUri : "http://localhost:3001"
        }`
      )
    )
    .on("close", () => Console.log(`dashboard`, `API closed`))
    .on("error", (e: any) => Console.error("dashboard", e));

  return app;
}
