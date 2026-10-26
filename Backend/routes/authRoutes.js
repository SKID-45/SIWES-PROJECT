// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const {check} = require('../check');
// const userRouter = express.Router();


// ///REGISTER FUNCTION
// userRouter.post('/register',async(req,res)=>{
//   const {name,email,password}=req.body;
//     if(!name || !email || !password){
//     return res.status(400).json({
//       message:'Name, Email And Password are required'
//     });
//   }

//   const hashedPassword = await bcrypt.hash(password,10);
//   const user= new User({
//     name:name,
//     email:email,
//     password:hashedPassword
//   });
//   await user.save();
//   res.json({
//     message:'USER PROFILE CREATED SUCCESSFULLY'
//   })
// })

// //LOGIN FUNCTION
// userRouter.post('/login', async (req,res) => {
// const { email, password } = req.body;
// const user = await User.findOne({ email });
// if (!user) {
//   return res.status(401).json({
//     message: 'Invalid email or password'
//   });
// }

// const matchPassword = await bcrypt.compare(password, user.password);

// if (!matchPassword) {
//   return res.status(401).json({
//     message: 'Invalid email or password' 
//   });
// }

// const token = jwt.sign(
//   {
//     userId: user._id,
//     role: user.role
//   }, process.env.JWT_SECRET, {
//     expiresIn: '1d'
//   });

//   res.json({
//     token,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     }
//   });
// });

// //CHANGE PASSWORD FUNCTION
// userRouter.put('/change-password',check,async(req,res)=>{
// const {oldPassword,newPassword}=req.body;
//  if(!oldPassword || !newPassword){
//   return res.status(400).json({
//    message:'Old password and new password are required'
//   });
// }
// try{
// const user=await User.findById(req.user.userId);
//   if(!user){
//    return res.status(404).json({
//     message:'User not found'
//   });
// }

// const matchPassword=await bcrypt.compare(oldPassword,user.password);
//   if(!matchPassword){
//    return res.status(401).json({
//     message:'Old password is incorrect'
//    });
//  }
// const hashedPassword=await bcrypt.hash(newPassword,10);
//   user.password=hashedPassword;
//     await user.save();
//     res.json({
//     message:'Password changed successfully'
//    });
//  }
//  catch(error){
//   res.status(500).json({
//    message:'Could not change password'
//     });
//    }
// });
// module.exports = userRouter;