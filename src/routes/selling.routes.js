"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellingRouter = void 0;
const express_1 = require("express");
const selling_controller_1 = require("../controllers/selling.controller");
exports.sellingRouter = (0, express_1.Router)();
exports.sellingRouter.get("/", selling_controller_1.listSellings);
exports.sellingRouter.get("/:id", selling_controller_1.getSellingById);
exports.sellingRouter.post("/", selling_controller_1.createSelling);
exports.sellingRouter.put("/:id", selling_controller_1.updateSelling);
exports.sellingRouter.delete("/:id", selling_controller_1.deleteSelling);
//# sourceMappingURL=selling.routes.js.map