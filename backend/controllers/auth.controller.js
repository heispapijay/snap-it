import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup =  async (req, res) => {
    // res.send('Signup');
    try {
        const { fullname, username, email, password } = req.body;

        if (!fullname || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already taken" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

         // hash password
         const salt = await bcrypt.genSalt(10);
         const passwordHash = await bcrypt.hash(password, salt);
 
         const user = new User({
             fullname,
             username,
             email,
             password: passwordHash,
         });

         await user.save();

         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

         res.cookie("jwt-snapit", token, {
            httpOnly: true, // client-side js cannot access the cookie
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production", //prevents cookie from being sent over http
         })

            res.status(201).json({message: "User created successfully"});
            
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// login controller
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        await res.cookie("jwt-snapit", token, {
            httpOnly: true, // client-side js cannot access the cookie
            maxAge: 3 * 24 * 60 * 60 * 1000, // 2 days
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production", //prevents cookie from being sent over http
         });

         res.json({ message: "User Login successful" });


    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
};

// logout controller
export const logout =  (req, res) => {
    res.clearCookie("jwt-snapit");
    res.json({ message: "Logged out successfully" });
}

// get currently logged in user
export const getCurrentlyLoggedInUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getCurrentlyLoggedInUser controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}