import { Router } from "express";
import { createPurchase, deletePurchase, getPurchaseById, listPurchases, updatePurchase } from "../controllers/purchase.controller";

export const purchaseRouter = Router();

purchaseRouter.get("/", listPurchases);
purchaseRouter.get("/:id", getPurchaseById);
purchaseRouter.post("/", createPurchase);
purchaseRouter.put("/:id", updatePurchase);
purchaseRouter.delete("/:id", deletePurchase);

