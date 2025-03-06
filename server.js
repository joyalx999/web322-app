/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Joyal Jaison
Student ID: 121783237
Date: 03/05/2025
Cyclic Web App URL: 
GitHub Repository URL: 

********************************************************************************/ 




const storeService = require("./store-service");


const express = require("express");
const path = require("path");
const app = express();

//Part 2 Assignment 3

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dcf8mkkft",
    api_key: "513183961878192",
    api_secret: "i5LZmE7hEogoBUWOoSMPGj5XMgY",
    secure: true
});

// Set up multer (no local storage)
const upload = multer();

app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result); // Log Cloudinary response for debugging
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Upload Error: ", error);
            res.status(500).send("Error uploading image");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body (e.g., save it to a database)
        console.log(req.body); // Debugging: See what data is being processed

        // Redirect to /items after adding the new item
        res.redirect("/items");
    }
});


// Use "public" folder to serve static files
app.use(express.static("public"));

// Redirect the root route "/" to "/about"
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Serve the about.html file when "/about" is accessed
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Route to get all published items

app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then((data) => res.json(data))
        .catch((err) => res.status(404).json({ message: err }));
});


// Route to get all items
app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({ message: err }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({ message: err }));
    }
});


//Route for getting single item by ID

app.get("/item/:value", (req, res) => {
    storeService.getItemById(req.params.value)
        .then((data) => res.json(data))
        .catch((err) => res.status(404).json({ message: err }));
});



// Route to get all categories
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then((data) => res.json(data))
        .catch((err) => res.status(404).json({ message: err }));
});

// POST route for adding items
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result); // Log Cloudinary response for debugging
            return result;
        }

        upload(req).then((uploaded) => {
            req.body.featureImage = uploaded.url; // Set the feature image URL
            storeService.addItem(req.body).then((newItem) => {
                console.log("New item added:", newItem); // Log the newly added item for debugging
                res.redirect("/items");
            }).catch((err) => {
                console.error("Error adding item:", err);
                res.status(500).send("Error adding item");
            });
        }).catch((error) => {
            console.error("Upload Error:", error);
            res.status(500).send("Error uploading image");
        });
    } else {
        req.body.featureImage = "";
        storeService.addItem(req.body).then((newItem) => {
            console.log("New item added:", newItem); // Log the newly added item for debugging
            res.redirect("/items");
        }).catch((err) => {
            console.error("Error adding item:", err);
            res.status(500).send("Error adding item");
        });
    }
});


// Assignment 3

app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addItem.html"));
});

// Handle unmatched routes (404 Not Found)
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});



// Start the server and listen on the specified port
const PORT = process.env.PORT || 8080;
storeService.initialize().then(() => {
    storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started and listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Failed to initialize the data:", err);
    });

}).catch(err => {
    console.log("Failed to initialize store service:", err);
});