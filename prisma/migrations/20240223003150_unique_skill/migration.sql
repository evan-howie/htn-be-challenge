/*
  Warnings:

  - A unique constraint covering the columns `[skill]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Skill_skill_key" ON "Skill"("skill");
