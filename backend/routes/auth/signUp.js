const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const users = require("../../controllers/user.controller");

router.post("/",async (req,res) => {
  if(!req.body.name || !req.body.email || !req.body.password || !req.body.role){
    return res.status(400).json({
      err: true,
      code: 400,
      message: "Required fields not provided"
    });
  }
  
  const {name,email,password,role} = req.body;
  const existingUser = await users.findOne(email);
  if(existingUser.error){
    return res.status(500).json({
      err: true,
      code: 500,
      message: existingUser.message || "Some error occurred while searching for the User."
    });
  }
  if(existingUser.data){
    return res.status(409).json({
      err: true,
      code: 409,
      message: "User with this email already exists"
    });
  }
  
  const hashedPassword = await bcrypt.hash(password,10);
  const newUser = await users.create({
    name,
    email,
    password: hashedPassword,
    role
  });
  if(newUser.error){
    return res.status(500).json({
      err: true,
      code: 500,
      message: newUser.message || "Error creating user"
    });
  }
  
  return res.status(201).json({
    err: false,
    code: 201,
    message: "User created successfully",
    data: {
      id: newUser.data._id,
      name: newUser.data.name,
      email: newUser.data.email,
      role: newUser.data.role
    }
  });
});
  
module.exports = router;