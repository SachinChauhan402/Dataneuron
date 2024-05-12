const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const Credential = require("./models/credential");
const app = express();
const PORT = process.env.PORT || 80;

// Connect to the database
db.connect();

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));

// Route for add data and delete old one
app.post("/api/credentials", async (req, res) => {
    try {
        const { username, email } = req.body;
        const existingCredential = await Credential.findOne();
        // If there is an existing credential, delete it
        if (existingCredential) {
            await Credential.findByIdAndDelete(existingCredential._id);
        }
        // Create a new credential
        const newCredential = new Credential({ username, email });
        // Save the new credential
        const savedCredential = await newCredential.save();
        res.status(201).json(savedCredential);
    } catch (error) {
        console.error("error saving credential:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Define a route to fetch all credentials
app.get("/api/cred", async (req, res) => {
    try {
        const credentialsAvail = await Credential.find();
        res.status(200).json(credentialsAvail);
    } catch (error) {
        // Handle errors
        console.error("Error fetching credentials:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//For update the credentials
app.put("/api/credentials/:id", async (req, res) => {
    try {
        const { username, email } = req.body;
        const id = req.params.id;
        // check if the credential exists
        const existingCredential = await Credential.findById(id);
        if (!existingCredential) {
            return res.status(404).json({ error: "Credential not found" });
        }
        // Update the credential
        existingCredential.username = username;
        existingCredential.email = email;
        // Save the updated credential
        const updatedCredential = await existingCredential.save();
        res.status(200).json(updatedCredential);
    } catch (error) {
        console.error("Error updating credential:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT No- ${PORT}`);
});
