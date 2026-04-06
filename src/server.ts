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
import { sellingLoanPaymentRouter } from "./routes/sellingLoanPayment.routes";

const app = express();
const port = 3000;

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://salaan-fron.vercel.app",
  "http://192.168.2.170:5173/"
];
const fromEnv = process.env["CORS_ORIGIN"]?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];
const allowedOrigins = fromEnv.length > 0 ? fromEnv : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = origin.replace(/\/$/, "");
      const ok =
        allowedOrigins.some((o) => o.replace(/\/$/, "") === normalized) ||
        allowedOrigins.includes(origin);
      callback(null, ok);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json());

/** All REST routes; mounted at `/` and `/api` so proxies that keep the `/api` prefix still work. */
const apiRouter = express.Router();
apiRouter.get("/health", (_req, res) => res.json({ ok: true }));
apiRouter.use("/users", userRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/jobs", jobRouter);
apiRouter.use("/laptops", laptopsRouter);
apiRouter.use("/accessories", accessoryRouter);
apiRouter.use("/sellings", sellingRouter);
apiRouter.use("/selling-loan-payments", sellingLoanPaymentRouter);
apiRouter.use("/purchases", purchaseRouter);
apiRouter.use("/purchase-payments", purchasePaymentRouter);
apiRouter.use("/expenses", expenseRouter);

app.use(apiRouter);
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
