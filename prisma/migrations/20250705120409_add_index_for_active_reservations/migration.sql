-- DropIndex
DROP INDEX "reservations_book_id_idx";

-- CreateIndex
CREATE INDEX "reservations_book_id_user_id_status_idx" ON "reservations"("book_id", "user_id", "status");

-- CreateUniqueIndex (partial unique constraint for active reservations)
CREATE UNIQUE INDEX "unique_active_reservation" ON "reservations"("book_id", "user_id") WHERE "status" IN ('PENDING', 'APPROVED');
