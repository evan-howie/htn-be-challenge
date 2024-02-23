import { Router } from "express";
import db from "../db";

const router = Router();

router.get("/", async (req, res) => {
  const min_frequency = parseInt(req.query.min_frequency as string);
  const max_frequency = parseInt(req.query.max_frequency as string);
  const name = req.query.name as string;

  try {
    const skills = await db.skill.findMany({
      where: { skill: name ? name : undefined },
      include: { _count: { select: { users: true } } },
    });
    const filtered_skills = skills.filter((skill) => {
      let ret = true;
      if (!isNaN(min_frequency)) {
        ret = ret && min_frequency <= skill._count.users;
      }
      if (!isNaN(max_frequency)) {
        ret = ret && max_frequency >= skill._count.users;
      }
      return ret;
    });
    res.json(
      filtered_skills.map((skill) => ({
        skill: skill.skill,
        frequency: skill._count.users,
      }))
    );
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).send("Internal Server Error");
  }

  return;
});

export default router;
