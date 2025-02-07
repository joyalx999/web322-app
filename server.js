const storeService = require("./store-service");


const express = require("express");
const path = require("path");
const app = express();

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
    storeService.getAllItems()
        .then((data) => res.json(data))
        .catch((err) => res.status(404).json({ message: err }));
});

// Route to get all categories
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then((data) => res.json(data))
        .catch((err) => res.status(404).json({ message: err }));
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

