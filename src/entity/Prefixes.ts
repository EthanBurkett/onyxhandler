import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
@Entity("prefixes")
export default class Prefix extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text", { default: "" })
  guildId: string;

  @Field()
  @Column("text", { default: "" })
  prefix: string;
}
