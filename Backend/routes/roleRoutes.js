const express = require('express');
const User = require('../models/User');
const {check,superadmin} = require('../check');
const roleRouter = express.Router();
 const mongoose = require('mongoose');

//MAKE USER ADMIN
roleRouter.put('/make-admin/:id',check,superadmin,async(req,res)=>{
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'INVALID USER ID' });
  }
  try{
    const user = await User.findById(req.params.id);
    if(!user){
      return res.status(404).json({
        message:'USER NOT FOUND'
      });
    }
    if(user.role !== 'user'){
      return res.status(409).json({
        message: 'ONLY REGULAR USERS CAN BE PROMOTED'
      })
    }
    user.role = 'admin';
    await user.save();
    res.json({
      message:'USER IS NOW AN ADMIN'
    });
  }
  catch(error){
    console.error(error);
    res.status(500).json({
      message:'COULD NOT MAKE USER ADMIN'
    });
  }
});
//GET USERS
roleRouter.get('/users',check,superadmin,async(req,res)=>{
  try{
    const users = await User.find().select('name email role');
    res.json(users);
  }
  catch(error){
    console.error(error);
    res.status(500).json({
      message:'COULD NOT GET USERS'
    });
  }
});
module.exports = roleRouter;