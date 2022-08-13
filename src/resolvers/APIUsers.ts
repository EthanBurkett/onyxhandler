import APIUser from "../entity/APIUsers";
import { Query, Resolver } from "type-graphql";

@Resolver()
export default class APIUserResolver {
  @Query(() => [APIUser])
  prefixes() {
    return APIUser.find();
  }
}
