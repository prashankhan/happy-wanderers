import { db } from "@/lib/db";
import { bookingActivityLog } from "@/lib/db/schema";

export async function logBookingActivity(input: {
  bookingId: string;
  actionType: string;
  performedBy: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await db.insert(bookingActivityLog).values({
    bookingId: input.bookingId,
    actionType: input.actionType,
    performedBy: input.performedBy,
    oldValue: input.oldValue ?? null,
    newValue: input.newValue ?? null,
  });
}
