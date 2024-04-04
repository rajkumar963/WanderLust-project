const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
       type: String,
      default:"https:// unsplash.com/photos/photo-of-body-body-of-water-during-golden-hour-2EDjes2hlZo",
      set:(v)=> v===" "?"https://unsplash.com/photos/photo-of-body-body-of-water-during-golden-hour-2EDjes2hlZo":v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:{
        type:Schema.Types.ObjectId,
        ref:"Review",
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
