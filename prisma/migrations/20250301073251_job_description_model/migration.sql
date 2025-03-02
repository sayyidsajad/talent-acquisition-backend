-- CreateTable
CREATE TABLE "JobDescription" (
    "id" SERIAL NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "requirements" TEXT[],

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);
