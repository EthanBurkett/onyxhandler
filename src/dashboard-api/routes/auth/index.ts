import axios from "axios";
import { Router } from "express";
const router = Router();
import passport from "passport";
import { Settings } from "../..";
import { DISCORD_API_URL } from "src/dashboard-api/utils/constants";
import { APIUser } from "../../../..";

router.get("/discord", passport.authenticate("discord"), (req, res) => {
  res.send(200);
});

router.get(
  "/discord/redirect",
  passport.authenticate("discord"),
  (req, res) => {
    res.redirect(`${Settings.clientUri}/menu`);
  }
);

router.get("/status", (req, res) => {
  return req.user
    ? res.send(req.user)
    : res.status(401).send({ msg: "Unauthorized" });
});

export default router;
