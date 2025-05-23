const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/miniproject1")

const userSchema=mongoose.Schema({
  name:String,
  userName:String,
  email:String,
  password:String,
  posts:[
    {type:mongoose.Types.ObjectId,
      ref:'post'
    }
  ]
})

module.exports=mongoose.model('user',userSchema)