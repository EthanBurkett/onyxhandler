import { DashboardSettings } from "../../..";
import passport from "passport";
import { Profile, Strategy } from "passport-discord";
import { VerifyCallback } from "passport-oauth2";
import User from "../../entity/APIUsers";

const init = (Settings: DashboardSettings) => {
  passport.serializeUser((user: any, done) => {
    console.log(user);
    return done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findOneBy({ id });
      return user ? done(null, user) : done(null, null);
    } catch (err) {
      console.log(err);
      return done(err, null);
    }
  });

  passport.use(
    new Strategy(
      {
        clientID: Settings.clientID,
        clientSecret: Settings.clientSecret,
        callbackURL: Settings.callbackURL,
        scope: ["identify", "email", "guilds"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        const { id: discordId } = profile;
        try {
          const existingUser = await User.findOne({
            where: {
              discordId,
            },
          });
          if (existingUser) {
            await User.update({ discordId }, { accessToken, refreshToken });
            return done(null, existingUser);
          }

          const newUser = await User.insert({
            discordId,
            accessToken,
            refreshToken,
          });

          return done(null, newUser);
        } catch (e) {
          console.log(e);
          return done(e as any, undefined);
        }
      }
    )
  );
};

export { init };
