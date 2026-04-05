"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchasePaymentRouter = void 0;
const express_1 = require("express");
const purchasePayment_controller_1 = require("../controllers/purchasePayment.controller");
exports.purchasePaymentRouter = (0, express_1.Router)();
exports.purchasePaymentRouter.get("/", purchasePayment_controller_1.listPurchasePayments);
exports.purchasePaymentRouter.get("/:id", purchasePayment_controller_1.getPurchasePaymentById);
exports.purchasePaymentRouter.post("/", purchasePayment_controller_1.createPurchasePayment);
exports.purchasePaymentRouter.put("/:id", purchasePayment_controller_1.updatePurchasePayment);
exports.purchasePaymentRouter.delete("/:id", purchasePayment_controller_1.deletePurchasePayment);
//# sourceMappingURL=purchasePayment.routes.js.map