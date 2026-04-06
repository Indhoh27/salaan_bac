import { Router } from "express";
import { createSellingLoanPayment, deleteSellingLoanPayment } from "../controllers/sellingLoanPayment.controller";

export const sellingLoanPaymentRouter = Router();

sellingLoanPaymentRouter.post("/", createSellingLoanPayment);
sellingLoanPaymentRouter.delete("/:id", deleteSellingLoanPayment);
