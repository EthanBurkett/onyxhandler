"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const isAuthenticated = (req, res, next) => (req.user ? next() : res.status(403).send({ msg: "Unauthorized" }));
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=middlewares.js.map