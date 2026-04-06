import { prisma } from "../prisma";
import type { PurchaseStatus } from "@prisma/client";
import { parseMoney } from "./money";

/** Updates purchase status from agreed_price vs sum of active payments. Skips CANCELLED rows. */
export async function recalcPurchaseStatus(purchaseId: string): Promise<void> {
  const purchase = await prisma.purchase.findFirst({ where: { id: purchaseId, recyclePin: false } });
  if (!purchase || purchase.status === "CANCELLED") return;

  const payments = await prisma.purchasePayment.findMany({
    where: { purchase_id: purchaseId, recyclePin: false },
  });
  const paid = payments.reduce((sum, p) => sum + parseMoney(p.amount), 0);
  const agreed = parseMoney(purchase.agreed_price);

  let status: PurchaseStatus;
  if (agreed <= 0) {
    status = paid > 0 ? "PARTIAL" : "PENDING";
  } else if (paid + 1e-6 >= agreed) {
    status = "PAID";
  } else if (paid > 0) {
    status = "PARTIAL";
  } else {
    status = "PENDING";
  }

  if (purchase.status !== status) {
    await prisma.purchase.update({ where: { id: purchaseId }, data: { status } });
  }
}
