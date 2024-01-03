import mongoose from "mongoose";

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {});
  console.log(
    `MongoDB холбогдлоо : ${conn.connection.host}`.cyan.underline.bold
  );
};

export default connectDB;
