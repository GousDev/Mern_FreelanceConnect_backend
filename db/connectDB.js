import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "dummyFreelance",
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Connected successfully");
  } catch (error) {
    console.log("something went wrong", error);
  }
};

export default connectDB;
