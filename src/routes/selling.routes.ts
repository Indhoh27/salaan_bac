import { Router } from "express";
import { createSelling, deleteSelling, getSellingById, listSellings, updateSelling } from "../controllers/selling.controller";

export const sellingRouter = Router();

sellingRouter.get("/", listSellings);
sellingRouter.get("/:id", getSellingById);
sellingRouter.post("/", createSelling);
sellingRouter.put("/:id", updateSelling);
sellingRouter.delete("/:id", deleteSelling);

