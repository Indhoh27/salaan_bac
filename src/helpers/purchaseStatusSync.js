"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalcPurchaseStatus = recalcPurchaseStatus;
const prisma_1 = require("../prisma");
const money_1 = require("./money");
/** Updates purchase status from agreed_price vs sum of active payments. Skips CANCELLED rows. */
async function recalcPurchaseStatus(purchaseId) {
    const purchase = await prisma_1.prisma.purchase.findFirst({ where: { id: purchaseId, recyclePin: false } });
    if (!purchase || purchase.status === "CANCELLED")
        return;
    const payments = await prisma_1.prisma.purchasePayment.findMany({
        where: { purchase_id: purchaseId, recyclePin: false },
    });
    const paid = payments.reduce((sum, p) => sum + (0, money_1.parseMoney)(p.amount), 0);
    const agreed = (0, money_1.parseMoney)(purchase.agreed_price);
    let status;
    if (agreed <= 0) {
        status = paid > 0 ? "PARTIAL" : "PENDING";
    }
    else if (paid + 1e-6 >= agreed) {
        status = "PAID";
    }
    else if (paid > 0) {
        status = "PARTIAL";
    }
    else {
        status = "PENDING";
    }
    if (purchase.status !== status) {
        await prisma_1.prisma.purchase.update({ where: { id: purchaseId }, data: { status } });
    }
}
//# sourceMappingURL=purchaseStatusSync.js.map