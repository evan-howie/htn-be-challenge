import { PrismaClient } from "@prisma/client";
import { promises as fsPromises } from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface Skill {
  skill: string;
  rating: number;
}

interface User {
  name: string;
  company: string;
  email: string;
  phone: string;
  skills: Skill[];
}

async function main() {
  const usersDataPath = path.resolve(
    __dirname,
    "HTN_2023_BE_Challenge_Data.json"
  );
  const usersDataString = await fsPromises.readFile(usersDataPath, "utf-8");
  const usersData: User[] = JSON.parse(usersDataString);

  for (let i = 0; i < usersData.length; i += 100) {
    const userChunk = usersData.slice(i, i + 100);

    // Batch insert users without their skills
    const createdUsers = await Promise.all(
      userChunk.map((user) =>
        prisma.user.create({
          data: {
            name: user.name,
            company: user.company,
            email: user.email,
            phone: user.phone,
          },
        })
      )
    );

    // Prepare and insert skills in chunks to ensure data integrity and manage performance
    const createSkillPromises = createdUsers.flatMap((createdUser, index) => {
      const userSkills = userChunk[index].skills; // Adjusted to use userChunk
      return userSkills.map((skill) =>
        prisma.skill.create({
          data: {
            skill: skill.skill,
            rating: skill.rating,
            userId: createdUser.id,
          },
        })
      );
    });

    // Use transaction for each chunk to ensure data integrity
    await prisma.$transaction(createSkillPromises);
  }

  console.log("Database has been initialized with users and their skills.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
