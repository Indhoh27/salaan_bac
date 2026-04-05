import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/user.controller";
import { requireAccessToken, requireAdmin } from "../middleware/auth.middleware";

export const userRouter = Router();

userRouter.get("/", requireAccessToken, requireAdmin, listUsers);
userRouter.get("/:id", requireAccessToken, requireAdmin, getUserById);
userRouter.post("/", requireAccessToken, requireAdmin, createUser);
userRouter.put("/:id", requireAccessToken, requireAdmin, updateUser);
userRouter.delete("/:id", requireAccessToken, requireAdmin, deleteUser);

