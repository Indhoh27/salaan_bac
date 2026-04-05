"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessoryRouter = void 0;
const express_1 = require("express");
const accessory_controller_1 = require("../controllers/accessory.controller");
exports.accessoryRouter = (0, express_1.Router)();
exports.accessoryRouter.get("/", accessory_controller_1.listAccessories);
exports.accessoryRouter.get("/:id", accessory_controller_1.getAccessoryById);
exports.accessoryRouter.post("/", accessory_controller_1.createAccessory);
exports.accessoryRouter.put("/:id", accessory_controller_1.updateAccessory);
exports.accessoryRouter.delete("/:id", accessory_controller_1.deleteAccessory);
//# sourceMappingURL=accessory.routes.js.map