import mongoose from "mongoose";
import Admin from "../models/Admin";
import { hashPassword } from "../lib/auth";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const email = "admin@training.com";
  const password = "Admin1234";

  const passwordHash = await hashPassword(password);

  await Admin.create({
    email,
    passwordHash,
  });

  console.log("✅ Admin created");
  process.exit();
}

run();