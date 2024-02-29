const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("hii I am root")
});

app.get("/testListing", async(req,res)=>{
    let sampleListing=new Listing({
        title:"My New Villa",
        description:"By the Beach",
        price:1500,
        location:"Calangute,Goa",
        country:"India",
    });

   await sampleListing.save();
    console.log("sample was saved");
    res.send("testing is successful");

})

app.listen(8080,()=>{
    console.log("server is running on port 8080");
});
