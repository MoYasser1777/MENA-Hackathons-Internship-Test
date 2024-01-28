const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email cannot be blank"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be blank"],
  },
  resetToken: String,
  resetTokenExpiration: Date,
  objects: [
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.statics.findAndValidate = async function (email, password) {
  const foundUser = await this.findOne({ email });

  if (!foundUser) return false;

  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
