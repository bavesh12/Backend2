const mongoose = require("mongoose");
const DATABASE=process.env.DATABASE
const connect = mongoose.connect(`${DATABASE}/New`);
connect.then(() => {
        console.log("Database connected Successfully");
    })
    .catch(() => {
        console.log("Database cannot be connected");
    });
const LoginSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mno: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
const ProductsSchema= new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPersent: {
        type: Number,
        required: true
    },
    size: {
        type: Array,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    topLavelCategory: {
        type: String,
        required: true
    },
    secondLavelCategory: {
        type: String,
        required: true
    },
    thirdLavelCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }

});
const CartproductsSchema= new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name:{
        type:String,
        required:true
    },
    imageUrl: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPersent: {
        type: Number,
        required: true
    },
    size: {
        type: Array,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    topLavelCategory: {
        type: String,
        required: true
    },
    secondLavelCategory: {
        type: String,
        required: true
    },
    thirdLavelCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }

});
const PurchproductsSchema= new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name:{
        type:String,
        required:true
    },
    imageUrl: {
        type: String,
        required: true
    },
    address_id:{
        type: String,
        required: true
    },
    Date:{
        type: String,
        required: true
    },
    stage:{
        type: Number,
        required: true 
    },
    brand: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPersent: {
        type: Number,
        required: true
    },
    size: {
        type: Array,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    topLavelCategory: {
        type: String,
        required: true
    },
    secondLavelCategory: {
        type: String,
        required: true
    },
    thirdLavelCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }

});



const WishlistsSchema= new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name:{
        type:String,
        required:true
    },
    imageUrl: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPersent: {
        type: Number,
        required: true
    },
    size: {
        type: Array,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    topLavelCategory: {
        type: String,
        required: true
    },
    secondLavelCategory: {
        type: String,
        required: true
    },
    thirdLavelCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }

});
const AddressSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    mobileno: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type:String,
        required: true
    },

});

const reviewSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    product_id:{
        type:String,
        required:true
    },
    starinfo: {
        type: String,
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
});

const collection= new mongoose.model("Loginusers", LoginSchema);
const allinfo=new mongoose.model("allinfo",ProductsSchema);
const cartproducts=new mongoose.model("cartproducts",CartproductsSchema)
const purchproducts=new mongoose.model("purchproducts",PurchproductsSchema)
const wishlist=new mongoose.model("wishlist", WishlistsSchema)
const addresslist=new mongoose.model("addresslist", AddressSchema)
const reviewlist=new mongoose.model("reviewlist", reviewSchema)
module.exports= {collection,allinfo,cartproducts,purchproducts,wishlist,addresslist,reviewlist};
