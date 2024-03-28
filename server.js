const express = require('express');
const nodemailer=require("nodemailer")
const cors = require('cors'); // Import the cors middleware
const bcrypt = require('bcrypt');
const {collection,allinfo,cartproducts,purchproducts,wishlist,addresslist,reviewlist} = require("./config");
const app = express();
const { helpcenterinfo } = require('./Helpcenterinfo');
const {All_info}=require('./All_info')
const path = require('path');

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.get('/api', (req, res) =>
     res.json( helpcenterinfo )
);
// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ganeshbhuvaneswaram@gmail.com', // Your Gmail email address
        pass: 'oqwp dcyi rfjg jrjr' // Your Gmail password
    }
});

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Object to store OTPs mapped to email addresses
const otpMap = {};
app.post('/request-otp', (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();

    // Store OTP in otpMap
    otpMap[email] = otp;

    // Send OTP to user's email
    const mailOptions = {
        from: 'ganeshbhuvaneswaram@gmail.com',
        to: email,
        subject: 'Email Verification OTP',
        text: `Your OTP for email verification is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send OTP');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('OTP sent successfully');
        }
    });
});
// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (otpMap[email] && otpMap[email] == otp) {
        // OTP matched, email verified
        // Here you would update your database to mark the email as verified
        res.status(200).send('Email verified successfully');
    } else {
        res.status(400).send('Invalid OTP');
    }
});
app.get('/v1/query', (req, res) => {
    const { search } = req.query;
    let sortedquest = helpcenterinfo;

    if (search) {
        const searchWords = search.split(" ").filter(Boolean); 
        sortedquest = sortedquest.filter(question => {
            return searchWords.some(word => question.heading.toLowerCase().includes(word.toLowerCase()));
        });
    }

    res.status(200).json(sortedquest);
});

app.get("/v1/query/:id",(req,res)=>{
    const {id}=req.params
   const helpquest=helpcenterinfo.find(helpquest=>helpquest.id==id)
   if(!helpquest){
    return res.status(404).json({success:false,msg:'question not found'})
   }
   res.json(helpquest)
})

app.get('/v1/dresses/query', async (req, res) => {
    const { search } = req.query;
    try {
        let sortedinfo = [];

        if (search) {
            const searchWords = search.split(" ").filter(Boolean); 
            const regexArray = searchWords.map(word => `(?=.*\\b${word}\\b)`);
            const regex = new RegExp(regexArray.join("") + ".*", "i");
            sortedinfo = await allinfo.find({ title: { $regex: regex } });
        } else {
            sortedinfo = await allinfo.find();
        }

        res.status(200).json(sortedinfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/v1/dresses/random', async (req, res) => {
    const { search } = req.query;
    try {
        let pipeline = [];
        if (search) {
            const searchWords = search.split(" ").filter(Boolean);
            const regexArray = searchWords.map(word => `(?=.*\\b${word}\\b)`);
            const regex = new RegExp(regexArray.join("") + ".*", "i");
            pipeline.push({ $match: { title: { $regex: regex } } });
        }
        pipeline.push({ $sample: { size: 30 } });
        const sortedinfo = await allinfo.aggregate(pipeline);

        res.status(200).json(sortedinfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/v1/dresses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const searchpro = await allinfo.findOne({ id: id });
        if (searchpro) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: 'Dress not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/login", async(req,res)=>{
    try{
        const { name, password } = req.body;
        const user = await collection.findOne({ name });

        if(!user){
            return res.status(404).send("User not found");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(isPasswordMatch){
            res.status(200).redirect('/');
        }
        else{
            res.status(401).send("Wrong password");
        }
    } catch(error) {
        console.error("Error logging in:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        mno: req.body.mno,
        password: req.body.password
    }

    try {
        const existingUser = await collection.findOne({
            $or: [
                { name: data.name },
                { email: data.email },
                { mno: data.mno }
            ]
        });

        if (existingUser) {
            console.log("User already exists:", existingUser);
            return res.status(409).redirect('/urexist');
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
            await collection.insertMany(data);
            console.log("User registered successfully:", data);
            return res.status(200).redirect('successful'); 
        }
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).send("Internal server error. Please try again later.");
    }
});


app.post("/addingtocart/:id", async (req, res) => {
    const { id } = req.params;

    const data = {
        id: id, 
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        brand: req.body.brand,
        title: req.body.title,
        color: req.body.color,
        discountedPrice: req.body.discountedPrice,
        price: req.body.price,
        discountPersent: req.body.discountPersent,
        size: req.body.size,
        quantity: req.body.quantity,
        topLavelCategory: req.body.topLavelCategory,
        secondLavelCategory: req.body.secondLavelCategory,
        thirdLavelCategory: req.body.thirdLavelCategory,
        description: req.body.description
    };

    try {
        await cartproducts.insertMany(data);
        await wishlist.findOneAndDelete({ id: id, name: req.body.name });
        console.log("Product added to cart:", data);
        res.status(200).redirect('/cart');
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});

app.get('/v1/cart/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const searchpro = await cartproducts.find({ name: name });
        if (searchpro.length > 0) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: 'No items found in the cart for this user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.delete("/cart/:id/:name", async (req, res) => {
    const itemId = req.params.id;
    const name=req.params.name;
    try {
        const deletedItem = await cartproducts.findOneAndDelete({ id: itemId, name: name });
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ message: "Item deleted successfully", deletedItem });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});
// Wishlist
app.post("/wishlist/:id", async (req, res) => {
    const { id } = req.params;

    const data = {
        id: id, 
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        brand: req.body.brand,
        title: req.body.title,
        color: req.body.color,
        discountedPrice: req.body.discountedPrice,
        price: req.body.price,
        discountPersent: req.body.discountPersent,
        size: req.body.size,
        quantity: req.body.quantity,
        topLavelCategory: req.body.topLavelCategory,
        secondLavelCategory: req.body.secondLavelCategory,
        thirdLavelCategory: req.body.thirdLavelCategory,
        description: req.body.description
    };

    try {
        await wishlist.insertMany(data);
        await cartproducts.findOneAndDelete({ id: id, name: req.body.name });
        console.log("Product added to cart:", data);
        res.status(200).redirect('/cart');
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});

app.get('/v1/wishlist/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const searchpro = await wishlist.find({ name: name });
        if (searchpro.length > 0) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: 'No items found in the cart for this user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET wishlist items
app.get('/v1/wishlist', async (req, res) => {
    try {
        const wishlistItems = await wishlist.find();
        res.status(200).json(wishlistItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete("/wishlist/:id/:name", async (req, res) => {
    const itemId = req.params.id;
    const name=req.params.name;
    try {
        const deletedItem = await wishlist.findOneAndDelete({ id: itemId, name: name });
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ message: "Item deleted successfully", deletedItem });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});
// end of wishlist

//start purchasedproducts.....................................................................................................................

app.post("/addingtopurch/:id/:Date", async (req, res) => {
    const { id,Date } = req.params;

    const data = {
        id: id, 
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        address_id:req.body.address_id,
        Date:Date,
        stage:1,
        brand: req.body.brand,
        title: req.body.title,
        color: req.body.color,
        discountedPrice: req.body.discountedPrice,
        price: req.body.price,
        discountPersent: req.body.discountPersent,
        size: req.body.size,
        quantity: req.body.quantity,
        topLavelCategory: req.body.topLavelCategory,
        secondLavelCategory: req.body.secondLavelCategory,
        thirdLavelCategory: req.body.thirdLavelCategory,
        description: req.body.description
    };

    try {
        await purchproducts.insertMany(data);

        console.log("Product purchaes:", data);
        res.status(200).redirect('/purchased');
    } catch (error) {
        console.error("Error while purchasing:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});
app.get('/v1/addingtopurch/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const searchpro = await purchproducts.find({ name: name });
        if (searchpro.length > 0) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: 'No items found in the orders for this user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/v1/addingtopurch/:name/:id', async (req, res) => {
    const { id,name } = req.params;
    try {
        const searchpro = await purchproducts.findOne({ $and: [{ id: id }, { name: name }] });
        if (searchpro) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: 'Dress not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/v1/addingtopurch/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const searchpro = await purchproducts.find({ name: name });
        if (searchpro.length > 0) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: 'No items found in the orders for this user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//end of purchased prducts ..............................................................................................................................................................

//start of address
app.post("/address/:username", async (req, res) => {
    const { username } = req.params;

    const data = {
        username:username, 
        name: req.body.name,
        mobileno: req.body.mobileno,
        pincode: req.body.pincode,
        address: req.body.address,
        locality: req.body.locality,
        city: req.body.city,
        state: req.body.state,
    };

    try {
        await addresslist.insertMany(data);

        console.log("address added:", data);
        res.status(200).redirect('/purchased');
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});
app.get('/address/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const searchpro = await addresslist.find({ username: username });
        if (searchpro.length > 0) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: ' no address exist' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/v1/address/:_id', async (req, res) => {
    const {_id } = req.params;
    try {
        const searchpro = await addresslist.find({ _id:_id});
        if (searchpro.length > 0) {
            res.status(200).json(searchpro);
        } else {
            res.status(404).json({ message: ' no address exist' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete("/address/:_id/:username", async (req, res) => {
    const itemId = req.params._id;
    const username=req.params.username;
    try {
        const deletedItem = await addresslist.findOneAndDelete({ _id: itemId, username: username });
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ message: "Item deleted successfully", deletedItem });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});

//end for address api--------------------------------------------------------------------------------------------------=----------------------=-=--=-====================================
//start of review api==================================================================----------------------------------____________________________________________++++++++++++++++++++++++++++++++++++++++++++++++++++___________-----------------==========
app.post("/review/:username/:product_id", async (req, res) => {
    const  username  = req.params.username;
    const product_id = req.params.product_id;
    const starinfo = req.body.starinfo;
    const feedback=req.body.feedback;
    const data = {
        username:username, 
        product_id: product_id,
        starinfo: starinfo,
        feedback:feedback,
    };

    try {
        await reviewlist.insertMany(data);

        console.log("Review received:", data);
        res.status(200).redirect('/Recentorders');
    } catch (error) {
        console.error("Error giving review:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});




const port = process.env.PORT || 3005;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
