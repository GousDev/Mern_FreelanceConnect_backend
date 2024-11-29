import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  dob: { type: String, trim: true },
  gender: { type: String, trim: true },
  fullname: { type: String, trim: true },
  imagename: { type: String },
  imageUrl: { type: String, default: "" },
});

const JobsSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true, trim: true },
  budget: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  skills: [{ type: String, required: true, trim: true }],
  email: { type: String, required: true, trim: true },
});

const freelancerSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  country: { type: String, trim: true, required: true },
  about: { type: String, trim: true, required: true },
  skills: [{ type: String, trim: true, required: true }],
  experience: { type: String, trim: true, required: true },
  category: { type: String, trim: true, required: true },
  project: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  freelancerId: { type: String, required: true, default: "" },
  imagename: { type: String, trim: true },
  imageUrl: { type: String, default: "" },
});

const userModel = mongoose.model("siteModel", userSchema);
const JobsModel = mongoose.model("JobsModel", JobsSchema);
const freelancerMOdel = mongoose.model("freelancerMOdel", freelancerSchema);

export { userModel, JobsModel, freelancerMOdel };
