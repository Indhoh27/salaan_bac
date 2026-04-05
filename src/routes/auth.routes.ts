import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", me);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

