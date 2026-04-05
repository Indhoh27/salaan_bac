import { Router } from "express";
import {
  createPurchasePayment,
  deletePurchasePayment,
  getPurchasePaymentById,
  listPurchasePayments,
  updatePurchasePayment,
} from "../controllers/purchasePayment.controller";

export const purchasePaymentRouter = Router();

purchasePaymentRouter.get("/", listPurchasePayments);
purchasePaymentRouter.get("/:id", getPurchasePaymentById);
purchasePaymentRouter.post("/", createPurchasePayment);
purchasePaymentRouter.put("/:id", updatePurchasePayment);
purchasePaymentRouter.delete("/:id", deletePurchasePayment);

