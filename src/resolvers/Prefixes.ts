import {
  Arg,
  buildSchema,
  buildTypeDefsAndResolvers,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import Prefix from "../entity/Prefixes";

@Resolver()
export default class PrefixResolver {
  @Query(() => [Prefix])
  prefixes() {
    return Prefix.find();
  }

  @Mutation(() => Boolean)
  async setPrefix(
    @Arg("guildId") guildId: string,
    @Arg("prefix") prefix: string
  ) {
    try {
      const GuildExists = await Prefix.findOne({ where: { guildId } });
      if (!GuildExists) {
        await Prefix.insert({
          guildId,
          prefix,
        });
      } else {
        await Prefix.update({ guildId }, { prefix });
      }
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }
}
