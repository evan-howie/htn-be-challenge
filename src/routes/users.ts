import { Router } from "express";
import db from "../db";
import { User, UserSchema } from "../types/user";

const router = Router();

// GET /users/
router.get("/", async (req, res) => {
  const users = await db.user.findMany({
    include: { skills: { select: { skill: true, rating: true } } },
  });

  const transform = users.map((user) => {
    return {
      ...user,
      skills: user.skills.map((skill) => ({
        skill: skill.skill.skill, //XD
        rating: skill.rating,
      })),
    };
  });

  // use pagination for more reasonable response time

  res.json(transform);
});

// GET /users/:id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(400).json({ error: "invalid id" });

  const user = await db.user.findUnique({
    where: { id },
    include: { skills: { select: { skill: true, rating: true } } },
  });

  res.json({
    ...user,
    skills: user?.skills.map((skill) => ({
      skill: skill.skill.skill, // maybe refactor later... lol
      rating: skill.rating,
    })),
  });
});

// PUT /users/:id
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const update = UserSchema.partial().safeParse(req.body);

  if (isNaN(id)) return res.status(400).json({ error: "invalid id" });
  if (!update.success)
    return res.status(400).json({ error: "invalid user data" });

  try {
    const updatedUser = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { id } });
      if (!user) throw "bad id";

      user = await tx.user.update({
        data: { ...update.data, skills: undefined },
        where: { id },
        include: { skills: { select: { skill: true, rating: true } } },
      });

      //possibly update skills as well

      return user;
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "invalid body" });
  }
});

// POST /users/
router.post("/", async (req, res) => {
  let userBody: User | User[] = req.body;

  if (!Array.isArray(userBody)) {
    userBody = [userBody];
  }

  const users = userBody.map((user: User) => UserSchema.safeParse(user));

  const userPromises = users.map((user) => {
    if (!user.success) {
      return Promise.reject(user.error);
    }

    return db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { ...user.data, skills: undefined },
      });

      for (const skill of user.data.skills) {
        let skillRecord = await tx.skill.findUnique({
          where: {
            skill: skill.skill,
          },
        });

        // If the skill doesn't exist, create it
        if (!skillRecord) {
          skillRecord = await tx.skill.create({
            data: {
              skill: skill.skill,
            },
          });
        }

        // Check if the UserSkill record already exists
        const userSkillRecord = await tx.userSkill.findUnique({
          where: {
            userId_skillId: {
              userId: newUser.id,
              skillId: skillRecord.id,
            },
          },
        });

        // Only create a new UserSkill record if it doesn't already exist
        if (!userSkillRecord) {
          await tx.userSkill.create({
            data: {
              userId: newUser.id,
              skillId: skillRecord.id,
              rating: skill.rating,
            },
          });
        }
      }
    });
  });

  try {
    const createdUsers = await Promise.all(userPromises);
    res.status(201).json(createdUsers);
  } catch (error) {
    // data is validated already, so it's our problem
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
