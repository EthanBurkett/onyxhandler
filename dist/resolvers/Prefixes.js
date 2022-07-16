"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const Prefixes_1 = __importDefault(require("../entity/Prefixes"));
let PrefixResolver = class PrefixResolver {
    prefixes() {
        return Prefixes_1.default.find();
    }
    async setPrefix(guildId, prefix) {
        try {
            const GuildExists = await Prefixes_1.default.findOne({ where: { guildId } });
            if (!GuildExists) {
                await Prefixes_1.default.insert({
                    guildId,
                    prefix,
                });
            }
            else {
                await Prefixes_1.default.update({ guildId }, { prefix });
            }
        }
        catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Prefixes_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrefixResolver.prototype, "prefixes", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("guildId")),
    __param(1, (0, type_graphql_1.Arg)("prefix")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PrefixResolver.prototype, "setPrefix", null);
PrefixResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PrefixResolver);
exports.default = PrefixResolver;
//# sourceMappingURL=Prefixes.js.map