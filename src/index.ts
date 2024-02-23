import express from "express";
import usersRouter from "./routes/users";
import skillsRouter from "./routes/skills";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", usersRouter);
app.use("/skills", skillsRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
