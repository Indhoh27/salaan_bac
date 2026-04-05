import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "dotenv/config";
import { userRouter } from "./routes/user.routes";
import { reportRouter } from "./routes/report.routes";
import { authRouter } from "./routes/auth.routes";
import { jobRouter } from "./routes/job.routes";
import { laptopsRouter } from "./routes/laptops.routes";
import { accessoryRouter } from "./routes/accessory.routes";
import { sellingRouter } from "./routes/selling.routes";
import { purchaseRouter } from "./routes/purchase.routes";
import { purchasePaymentRouter } from "./routes/purchasePayment.routes";
import { expenseRouter } from "./routes/expense.routes";
const app = express();
const port = 3000;

const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const fromEnv = process.env["CORS_ORIGIN"]?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];
const allowedOrigins = fromEnv.length > 0 ? fromEnv : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/users", userRouter);
app.use("/reports", reportRouter);
app.use("/auth", authRouter);
app.use("/jobs", jobRouter);
app.use("/laptops", laptopsRouter);
app.use("/accessories", accessoryRouter);
app.use("/sellings", sellingRouter);
app.use("/purchases", purchaseRouter);
app.use("/purchase-payments", purchasePaymentRouter);
app.use("/expenses", expenseRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});