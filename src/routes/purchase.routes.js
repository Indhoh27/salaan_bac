"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseRouter = void 0;
const express_1 = require("express");
const purchase_controller_1 = require("../controllers/purchase.controller");
exports.purchaseRouter = (0, express_1.Router)();
exports.purchaseRouter.get("/", purchase_controller_1.listPurchases);
exports.purchaseRouter.get("/:id", purchase_controller_1.getPurchaseById);
exports.purchaseRouter.post("/", purchase_controller_1.createPurchase);
exports.purchaseRouter.put("/:id", purchase_controller_1.updatePurchase);
exports.purchaseRouter.delete("/:id", purchase_controller_1.deletePurchase);
//# sourceMappingURL=purchase.routes.js.map