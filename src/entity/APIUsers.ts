import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
@Entity("apiusers")
export default class APIUser extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column("text", { default: "" })
  discordId: string;

  @Field()
  @Column("text", { default: "" })
  accessToken: string;

  @Field()
  @Column("text", { default: "" })
  refreshToken: string;
}
