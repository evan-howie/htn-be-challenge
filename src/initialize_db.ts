import { PrismaClient } from "@prisma/client";
import { promises as fsPromises } from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface SkillInput {
  skill: string;
  rating: number;
}

interface UserInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  skills: SkillInput[];
}

async function main() {
  const usersDataPath = path.resolve(
    __dirname,
    "HTN_2023_BE_Challenge_Data.json"
  );
  const usersDataString = await fsPromises.readFile(usersDataPath, "utf-8");
  const usersData: UserInput[] = JSON.parse(usersDataString);

  for (let i = 0; i < usersData.length; i += 100) {
    const userChunk = usersData.slice(i, i + 100);

    // Use transaction for each chunk to ensure data integrity
    await prisma.$transaction(async (prisma) => {
      for (const user of userChunk) {
        const createdUser = await prisma.user.create({
          data: {
            name: user.name,
            company: user.company,
            email: user.email,
            phone: user.phone,
          },
        });

        for (const skill of user.skills) {
          // Check if the skill already exists to avoid duplicates
          let skillRecord = await prisma.skill.findUnique({
            where: {
              skill: skill.skill,
            },
          });

          // If the skill doesn't exist, create it
          if (!skillRecord) {
            skillRecord = await prisma.skill.create({
              data: {
                skill: skill.skill,
              },
            });
          }

          // Check if the UserSkill record already exists
          const userSkillRecord = await prisma.userSkill.findUnique({
            where: {
              userId_skillId: {
                userId: createdUser.id,
                skillId: skillRecord.id,
              },
            },
          });

          // Only create a new UserSkill record if it doesn't already exist
          if (!userSkillRecord) {
            await prisma.userSkill.create({
              data: {
                userId: createdUser.id,
                skillId: skillRecord.id,
                rating: skill.rating,
              },
            });
          }
        }
      }
    });
  }

  console.log("Database has been initialized with users and their skills.");
}

main()
  .catch((e) => {
    console.error("Error initializing the database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
