"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laptopsRouter = void 0;
const express_1 = require("express");
const laptops_controller_1 = require("../controllers/laptops.controller");
exports.laptopsRouter = (0, express_1.Router)();
exports.laptopsRouter.get("/", laptops_controller_1.listLaptops);
exports.laptopsRouter.get("/:id", laptops_controller_1.getLaptopById);
exports.laptopsRouter.post("/", laptops_controller_1.createLaptop);
exports.laptopsRouter.put("/:id", laptops_controller_1.updateLaptop);
exports.laptopsRouter.delete("/:id", laptops_controller_1.deleteLaptop);
//# sourceMappingURL=laptops.routes.js.map