"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const user_routes_1 = require("./routes/user.routes");
const report_routes_1 = require("./routes/report.routes");
const auth_routes_1 = require("./routes/auth.routes");
const job_routes_1 = require("./routes/job.routes");
const laptops_routes_1 = require("./routes/laptops.routes");
const accessory_routes_1 = require("./routes/accessory.routes");
const selling_routes_1 = require("./routes/selling.routes");
const purchase_routes_1 = require("./routes/purchase.routes");
const purchasePayment_routes_1 = require("./routes/purchasePayment.routes");
const expense_routes_1 = require("./routes/expense.routes");
const app = (0, express_1.default)();
const port = 3000;
const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://salaan-fron.vercel.app/"];
const fromEnv = process.env["CORS_ORIGIN"]?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];
const allowedOrigins = fromEnv.length > 0 ? fromEnv : defaultOrigins;
app.use((0, cors_1.default)({
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
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/users", user_routes_1.userRouter);
app.use("/reports", report_routes_1.reportRouter);
app.use("/auth", auth_routes_1.authRouter);
app.use("/jobs", job_routes_1.jobRouter);
app.use("/laptops", laptops_routes_1.laptopsRouter);
app.use("/accessories", accessory_routes_1.accessoryRouter);
app.use("/sellings", selling_routes_1.sellingRouter);
app.use("/purchases", purchase_routes_1.purchaseRouter);
app.use("/purchase-payments", purchasePayment_routes_1.purchasePaymentRouter);
app.use("/expenses", expense_routes_1.expenseRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=server.js.map