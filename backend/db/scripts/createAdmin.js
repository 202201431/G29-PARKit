import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Admin, User } from "../index.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    async function connectDB() {
      try {
        await mongoose.connect(`${process.env.MONGODB_URL}testing`);
        console.log("Connected to MongoDB");
      } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
      }
    }

    await connectDB();

    const adminData = {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", 
      role: "admin",
    };

    const [existingAdmin, existingUser] = await Promise.all([
      Admin.findOne({ email: adminData.email }),
      User.findOne({ email: adminData.email }),
    ]);

    if (existingAdmin || existingUser) {
      console.log("Admin already exists with this email");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    const adminDoc = new Admin({
      ...adminData,
      password: hashedPassword,
    });

    const userDoc = new User({
      ...adminData,
      password: hashedPassword,
      phoneNumber: "0000000000", 
      vehicleNumberPlate: "ADMIN000", 
    });

    await Promise.all([adminDoc.save(), userDoc.save()]);

    console.log("Admin created successfully in both collections");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
    console.log("Role:", adminData.role);
    console.log("\nAdmin can now:");
    console.log("1. Login as admin at /admin/login");
    console.log("2. Login as user at /login");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

createAdmin();
