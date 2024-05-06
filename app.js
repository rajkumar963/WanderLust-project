const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js")



const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded( {extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')) );


app.get("/",(req,res)=>{
    res.send("hii I am root")
});

const validateListing=(req,res,next)=>{
    let {error}=  listingSchema.validate(req.body);
   if(error){
        let errmsg=error.details.map(el=>el.message).join(",");
        throw new ExpressError(errmsg,400);
    }else{
        next();
    }}

    const validateReview=(req,res,next)=>{
        let {error}=  reviewSchema.validate(req.body);
       if(error){
            let errmsg=error.details.map(el=>el.message).join(",");
            throw new ExpressError(errmsg,400);
        }else{
            next();
        }}



//Index Route:----
app.get("/listings",wrapAsync(async(req,res)=>{
  let allListings= await Listing.find({});
  res.render("listings/index.ejs",{allListings});
}));

//New  Route:----

app.get("/listings/new",wrapAsync((req,res)=>{
    res.render("listings/new.ejs");
}));

//Show Route:----

app.get("/listing/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//Create Route:----

app.post("/listings",
validateListing,
wrapAsync(async(req,res,next)=>{
       const newListing= new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    
    }));

 //Edit Route:----

 app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
 }));

 //Update Route:----

 app.put("/listings/:id",
 validateListing,
 wrapAsync(async(req,res)=>{
    // if(!req.body.listing) 
    //     throw new ExpressError("Send valid data for listing",400);
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");//res.redirect(`/listings/${id}`);
 }));

//Delete Route:----

app.delete("/listing/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
}));

//Review Method:- Creating POST Route

app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }
  
    const { rating, comment } = req.body; // Assuming comment is in req.body directly
    let newReview = new Review({ rating, comment });
  
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`);
  }));
  
  


// app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req,res)=>{
//  let listing = await Listing.findById(req.params.id);
//  let newReview= new Review(req.body.review);

//  listing.reviews.push(newReview);
//  await newReview.save();
//  await listing.save();
// console.log("new review saved");
// res.send("new review saved");

// res.redirect(`/listings/${listing._id}`);
// }));


// app.get("/testListing", async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:1500,
//         location:"Calangute,Goa",
//         country:"India",
//     });

//    await sampleListing.save();
//     console.log("sample was saved");
//     res.send("testing is successful");

// })

app.all("*", (req, res, next) => {
    next(new ExpressError( "Page Not Found!!", 404));
})


app.use((err,req,res,next)=>{
    let {statuscode=500,message="something went wrong"}=err;
    res.status(statuscode).render("error.ejs",{message});
    // res.status(statuscode).send(message);
})

app.listen(8080,()=>{
    console.log("server is running on port 8080");
});
