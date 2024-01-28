// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto"); // Ensure you import crypto
const User = require("./models/user");
const { sendPasswordResetEmail } = require("./services");

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { password, email } = req.body;
  const user = new User({ email, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findAndValidate(email, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    res.redirect("/");
  } else {
    res.send("No User Exists!!!");
  }
});

router.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

router.get("/forgot", (req, res) => {
  res.render("forgot");
});

router.post("/forgot", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Handle case where email is not found in the database
    return res.redirect("/forgot");
  }

  // Generate a unique reset token and set the expiration time
  user.resetToken = crypto.randomBytes(32).toString("hex");
  user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

  await user.save();

  try {
    await sendPasswordResetEmail(email, user.resetToken);
    res.redirect("/login");
  } catch (error) {
    console.error("Error sending email:", error);
    res.redirect("/forgot");
  }
});

router.get("/reset/:token", async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    // Handle invalid or expired token
    return res.redirect("/login");
  }

  res.render("reset", { token });
});

router.post("/reset/:token", async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
  });

  if (!user) {
    // Handle invalid or expired token
    return res.redirect("/login");
  }

  // Update the user's password
  const newPassword = req.body.newPassword;
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;

  await user.save();

  res.redirect("/login");
});

router.get("/addObject", (req, res) => {
  res.render("addObject");
});

router.post("/addObject", async (req, res) => {
  const { name, description } = req.body;
  const userId = req.session.user_id;

  try {
    const user = await User.findById(userId);

    user.objects.push({ name, description });

    await user.save();

    res.redirect("/getObjects");
  } catch (error) {
    console.error(error);
    res.redirect("/addObject");
  }
});

router.get("/getObjects", async (req, res) => {
  const userId = req.session.user_id;

  try {
    const user = await User.findById(userId);

    res.render("getObjects", { objects: user.objects });
  } catch (error) {
    console.error(error);
    res.redirect("/getObjects");
  }
});

module.exports = router;
