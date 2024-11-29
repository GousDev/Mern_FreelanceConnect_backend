import express from "express";
import siteController from "../controllers/siteController.js";
const router = express.Router();

//for posting data to database
router.post("/api/login", siteController.login);
router.post("/api/register", siteController.register);
router.post("/api/postJob", siteController.postJob);
router.post("/api/freelancerform", siteController.newFreelancer);
router.post("/api/profile", siteController.profile);
router.post("/uploadProfileImage", siteController.uploadImage);
router.post("/sendmail", siteController.sendEmail);

router.put("/update", siteController.updateProfile);
router.delete("/delete/:id", siteController.deleteProfile);

//for frontend fetching
router.get("/api/getJobs", siteController.getJobs);
router.get("/api/getuiux", siteController.getuiux);
router.get("/api/getApp", siteController.getApp);
router.get("/api/getWeb", siteController.getWeb);
router.get("/getAll", siteController.getAll);
router.get("/check/:id", siteController.loginCheck);
router.get("/freelancerCheck/:freelanceId", siteController.freelancerCheck);
router.get("/edit/:id", siteController.getEdit);

//for all routes
router.get("*", (req, res) => {
  res.send("Helloo jiiii");
});

export default router;
