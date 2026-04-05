"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/", auth_middleware_1.requireAccessToken, auth_middleware_1.requireAdmin, user_controller_1.listUsers);
exports.userRouter.get("/:id", auth_middleware_1.requireAccessToken, auth_middleware_1.requireAdmin, user_controller_1.getUserById);
exports.userRouter.post("/", auth_middleware_1.requireAccessToken, auth_middleware_1.requireAdmin, user_controller_1.createUser);
exports.userRouter.put("/:id", auth_middleware_1.requireAccessToken, auth_middleware_1.requireAdmin, user_controller_1.updateUser);
exports.userRouter.delete("/:id", auth_middleware_1.requireAccessToken, auth_middleware_1.requireAdmin, user_controller_1.deleteUser);
//# sourceMappingURL=user.routes.js.map