import { z } from "zod";

export const SkillSchema = z.object({
  skill: z.string(),
  rating: z.number(),
});

export const UserSchema = z.object({
  name: z.string(),
  company: z.string(),
  email: z.string().email(),
  phone: z.string(),
  skills: z.array(SkillSchema),
});

export type Skill = z.infer<typeof SkillSchema>;
export type User = z.infer<typeof UserSchema>;
