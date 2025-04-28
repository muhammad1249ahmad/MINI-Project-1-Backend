const mongoose=require("mongoose")


const postSchema=mongoose.Schema({
  user:mongoose.Types.ObjectId
})

module.exports=mongoose.model('post',postSchema)