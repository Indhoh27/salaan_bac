import { Router } from "express";
import { createLaptop, deleteLaptop, getLaptopById, listLaptops, updateLaptop } from "../controllers/laptops.controller";

export const laptopsRouter = Router();

laptopsRouter.get("/", listLaptops);
laptopsRouter.get("/:id", getLaptopById);
laptopsRouter.post("/", createLaptop);
laptopsRouter.put("/:id", updateLaptop);
laptopsRouter.delete("/:id", deleteLaptop);

