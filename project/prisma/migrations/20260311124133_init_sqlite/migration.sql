-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legacy_mongo_id" TEXT,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "declared" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "address" TEXT,
    "course_day" TEXT,
    "course_hour" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_packs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legacy_mongo_id" TEXT,
    "student_id" TEXT NOT NULL,
    "total_lessons" INTEGER NOT NULL,
    "remaining_lessons" INTEGER NOT NULL,
    "purchase_date" DATETIME NOT NULL,
    "expiry_date" DATETIME,
    "price" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "course_packs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legacy_mongo_id" TEXT,
    "student_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "comment" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "pack_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lessons_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lessons_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "course_packs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    "user_agent" TEXT,
    "ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_legacy_mongo_id_key" ON "students"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_packs_legacy_mongo_id_key" ON "course_packs"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "idx_course_packs_student_id" ON "course_packs"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_legacy_mongo_id_key" ON "lessons"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "idx_lessons_student_id" ON "lessons"("student_id");

-- CreateIndex
CREATE INDEX "idx_lessons_pack_id" ON "lessons"("pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
