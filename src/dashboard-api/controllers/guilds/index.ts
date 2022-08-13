import axios from "axios";
import { Request, Response } from "express";
import { Settings } from "../..";
import APIUser from "../../../entity/APIUsers";
import {
  getBotGuildsService,
  getGuildService,
  getMutualGuildsService,
  getUserGuildsService,
} from "../../services/guilds";
import { Console } from "../../../utils";

export async function getGuildsController(req: Request, res: Response) {
  const user = req.user as APIUser;
  try {
    const guilds = await getMutualGuildsService(user.id);
    res.send({ guilds });
  } catch (err) {
    Console.error("dashboard", err);
    res.status(400).send({ msg: "Error" });
  }
}

export async function getGuildPermissionsController(
  req: Request,
  res: Response
) {
  const user = req.user as APIUser;
  const { id } = req.params;

  try {
    const guilds = await getMutualGuildsService(user.id);
    const valid = guilds.some((guild) => guild.id === id);
    return valid ? res.sendStatus(200) : res.sendStatus(403);
  } catch (err) {
    Console.error("dashboard", err);
    res.status(400).send({ msg: "Error" });
  }
  return;
}

export async function getGuildController(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const { data: guild } = await getGuildService(id);
    res.send(guild);
  } catch (e) {
    Console.error("dashboard", e);
    res.status(400).send({ msg: "Error" });
  }
}
