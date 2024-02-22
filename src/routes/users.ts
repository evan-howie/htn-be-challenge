import { Router } from "express";
import db from "../db";
import { User, UserSchema } from "../types/user";

const router = Router();

router.get("/", async (req, res) => {
  const users = await db.user.findMany({ include: { skills: true } });
  res.json(users);
});

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

    return db.user.create({
      data: {
        ...user.data,
        skills: {
          create: user.data.skills,
        },
      },
      include: { skills: true },
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
