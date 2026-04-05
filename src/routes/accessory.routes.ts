import { Router } from "express";
import { createAccessory, deleteAccessory, getAccessoryById, listAccessories, updateAccessory } from "../controllers/accessory.controller";

export const accessoryRouter = Router();

accessoryRouter.get("/", listAccessories);
accessoryRouter.get("/:id", getAccessoryById);
accessoryRouter.post("/", createAccessory);
accessoryRouter.put("/:id", updateAccessory);
accessoryRouter.delete("/:id", deleteAccessory);

