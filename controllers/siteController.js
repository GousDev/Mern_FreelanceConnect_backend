import { userModel } from "../models/siteModel.js";
import { JobsModel } from "../models/siteModel.js";
import { freelancerMOdel } from "../models/siteModel.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import multer from "multer";
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import transporter from "../app.js";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");
const upload1 = multer({ storage: storage }).single("image1");

const bucketName = process.env.bucketName;
const bucketRegion = process.env.bucketRegion;
const accesskey = process.env.accesskey;
const secretAccessKey = process.env.secretAccessKey;

const bucketName1 = process.env.bucketName1;
const accesskey1 = process.env.accesskey1;
const secretAccessKey1 = process.env.secretAccessKey1;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accesskey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const s31 = new S3Client({
  credentials: {
    accessKeyId: accesskey1,
    secretAccessKey: secretAccessKey1,
  },
  region: bucketRegion,
});

const uniqueId = () => {
  const fullUuid = uuidv4();
  const shortUuid = fullUuid.substring(0, 10);
  return shortUuid;
};
class siteController {
  static login = async (req, res) => {
    try {
      const { lgemail, lgpassword } = req.body;
      const user = await userModel.findOne({ email: lgemail });
      // console.log(user.password);
      // console.log(lgpassword);

      if (user) {
        const match = await bcrypt.compare(lgpassword, user.password);

        if (match) {
          res.json({ success: true, message: "Login Successful", user });
        } else {
          res.json({ success: false, message: "Invalid Credentials" });
        }
      } else {
        res.json({ success: false, message: "User not found" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static loginCheck = async (req, res) => {
    try {
      const { id } = req.params;
      // console.log(req.params);
      const result = await userModel.findOne({ _id: id });
      // console.log(result);

      if (result) {
        if (result.imagename) {
          const getObjectParams = {
            Bucket: bucketName1,
            Key: result.imagename,
          };

          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s31, command, { expiresIn: 60 });
          result.imageUrl = url;
        } else {
          result.imageUrl = "";
        }

        res.json({ success: true, result });
      } else {
        result.imageUrl = "";
        result.imagename = "";
        await result.save();
        res.json({ success: false, result });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  static register = async (req, res) => {
    try {
      const { name, email, password, phone, dob, gender, fullname } = req.body;
      const result = await userModel.findOne({ email });
      const hashedPassword = await bcrypt.hash(password, 10);
      if (result === null) {
        const newuser = new userModel({
          name,
          email,
          password: hashedPassword,
          phone,
          dob,
          gender,
          fullname,
        });
        await newuser.save();
        res.json({ success: true, message: "Registration Successful" });
      } else {
        res.json({ success: false, message: "User already exists" });
      }
    } catch (error) {
      console.log("Not Logged In");
    }
  };

  //#########  post new job ##########
  static postJob = async (req, res) => {
    try {
      const { jobTitle, budget, description, skills, email } = req.body;

      const newJob = new JobsModel({
        jobTitle,
        budget,
        description,
        skills,
        email,
      });
      await newJob.save();
      res.json({ success: true, message: "Job Posted Successfully", newJob });
    } catch (error) {
      console.log(error);
    }
  };

  static getJobs = async (req, res) => {
    try {
      const result = await JobsModel.find();
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };

  //####### post new freelancer ###########
  static newFreelancer = async (req, res) => {
    try {
      // console.log(req.file);
      upload(req, res, async (err) => {
        if (err) {
          console.log(err);
        }
        const {
          name,
          country,
          about,
          skills,
          experience,
          category,
          project,
          email,
        } = req.body;
        // console.log(req.file.buffer);
        console.log(req.file);
        const imagename = req.file.originalname;

        const fileBuffer = await sharp(req.file.buffer)
          .resize({ height: 300, width: 300, fit: "cover" })
          .toBuffer();

        const params = {
          Bucket: bucketName,
          Key: imagename,
          Body: fileBuffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const result = new freelancerMOdel({
          name,
          country,
          about,
          skills,
          experience,
          category,
          project,
          email,
          freelancerId: uniqueId(),
          imagename: imagename,
        });

        await result.save();
        // console.log(result);
        res.json({
          success: true,
          message: "Freelancer Added Successfully",
          result,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  static freelancerCheck = async (req, res) => {
    try {
      const { freelanceId } = req.params;
      const freelancer = await freelancerMOdel.findOne({
        freelancerId: freelanceId,
      });
      // console.log(freelancer)
      if (freelancer) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: freelancer.imagename,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expires: 60 });
        freelancer.imageUrl = url;

        res.json({
          success: true,
          message: "Freelancer ID found",
          freelancer,
        });
      } else {
        res.json({
          success: false,
          message: "Freelancer ID not found",
        });
      }
    } catch (error) {
      console.error("Error checking freelancer ID:", error);
      res.status(500).json({
        success: false,
        message: "Error checking freelancer ID",
        error: error.message,
      });
    }
  };

  //get freelancers for job
  static getuiux = async (req, res) => {
    try {
      const result = await freelancerMOdel.find({ category: "Ui/Ux" });
      for (const prof of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: prof.imagename,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expires: 60 });
        prof.imageUrl = url;
      }
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };
  static getApp = async (req, res) => {
    try {
      const result = await freelancerMOdel.find({ category: "App Developer" });
      for (const prof of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: prof.imagename,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expires: 60 });
        prof.imageUrl = url;
      }
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };
  static getWeb = async (req, res) => {
    try {
      const result = await freelancerMOdel.find({ category: "Web Developer" });
      for (const prof of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: prof.imagename,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expires: 60 });
        prof.imageUrl = url;
      }
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };

  static getAll = async (req, res) => {
    try {
      const result = await freelancerMOdel.find();
      // console.log(result);
      for (const prof of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: prof.imagename,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expires: 60 });
        // console.log(url);
        prof.imageUrl = url;
      }
      res.json(result);
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  //###########   Updating  My Profile  #############
  static profile = async (req, res) => {
    try {
      const { id, fullname, phone, gender, dob } = req.body;

      const result = await userModel.findByIdAndUpdate(id, {
        fullname,
        phone,
        gender,
        dob,
      });
      if (result) {
        res.json({
          success: true,
          message: " Profile Updated Successfully!!!! ",
          result,
        });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ######### Updating My profile Image #########
  static uploadImage = async (req, res) => {
    try {
      console.log("hii");
      const file = req.file;
      // console.log(file);
      // console.log(req.body);

      upload1(req, res, async (err) => {
        if (err) {
          console.log(err);
        }
        // console.log(req.file);

        const imagename = req.file.originalname;
        const params = {
          Bucket: bucketName1,
          Key: imagename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s31.send(command);

        const result = await userModel.updateOne(
          { _id: req.body.id },
          {
            imagename: imagename,
          }
        );

        // console.log(result);
        res.json({
          success: true,
          message: "Image Uploaded Successfully",
          result,
        });
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  // ###########  Updating Freelance profile ############
  static getEdit = async (req, res) => {
    try {
      const result = await freelancerMOdel.findById(req.params.id);

      const getObjectParams = {
        Bucket: bucketName,
        Key: result.imagename,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expires: 60 });
      // console.log(url);
      result.imageUrl = url;
      // console.log(result);
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProfile = async (req, res) => {
    upload(req, res, async (err) => {
      // console.log(req.file);
      const profiledata = req.body;
      console.log(req.body);
      try {
        if (err) throw err;

        const imagename = req.file.originalname;

        const fileBuffer = await sharp(req.file.buffer)
          .resize({ height: 300, width: 300, fit: "cover" })
          .toBuffer();

        const params = {
          Bucket: bucketName,
          Key: imagename,
          Body: fileBuffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);
        const result = await freelancerMOdel.updateOne(
          { _id: req.body.id },
          { profiledata }
        );
        // console.log(req.body);
        res.json(result);
        // console.log(result);
      } catch (error) {
        console.log(error);
      }
    });
  };

  static deleteProfile = async (req, res) => {
    try {
      // const { id }=req.params.id;
      // console.log(req.params.id);
      const result = await freelancerMOdel.findByIdAndDelete(req.params.id);
      // console.log(result);
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };

  static sendEmail = async (req, res) => {
    const { from, to, message } = req.body;
    console.log(req.body);
    const mailOptions = {
      from: from,
      to: to,
      subject: "Message from FreelanceConnect ",
      text: message,
    };
    try {
      const result = await transporter.sendMail(mailOptions);
      if (result) {
        res.json({ success: true, message: "Email sent Successfully" });
      }
    } catch (error) {
      console.log("Error in sending email", error);
    }
  };
}

export default siteController;
