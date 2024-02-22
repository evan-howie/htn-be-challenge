"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.SkillSchema = void 0;
var zod_1 = require("zod");
exports.SkillSchema = zod_1.z.object({
    skill: zod_1.z.string(),
    rating: zod_1.z.number(),
});
exports.UserSchema = zod_1.z.object({
    name: zod_1.z.string(),
    company: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    skills: zod_1.z.array(exports.SkillSchema),
});
