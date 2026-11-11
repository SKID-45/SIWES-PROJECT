const mongoose = require('mongoose');
// stores the info of each ict reports
const reportModel = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
  },

  department:{
    type:String,
    required:true,
    trim: true,
    maxlength:200
  },

  problem:{
    type:String,
    required:true,
    trim: true,
    maxlength:1000,
  },

  submittedAt:{
    type:Date,
    default:Date.now
  },

  status:{
    type:String,
    enum:['Pending', 'Resolved', 'Unresolved'],
    default: 'Pending'
  },
});
reportModel.index({ userId: 1, submittedAt: -1});
module.exports=mongoose.model('Report', reportModel);