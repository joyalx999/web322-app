/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Joyal Jaison
Student ID: 121783237 
Date: 06 Feb 2025
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: ______________________________________________________

********************************************************************************/ 


const express = require("express");
const storeService = require("./store-service");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

storeService.initialize().then(() => {

    console.log("Data initialized successfully.");

    app.get("/items", (req, res) => {
        storeService.getAllItemss()
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
    });

    app.get("/shop", (req, res) => {
        storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
    });

    app.get("/categories", (req, res) => {
        storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
    });

    app.get("/", (req, res) => {
        res.redirect("/about");
    });

    app.use((req, res) => {
        res.status(404).send("404! Page Not Found");
    });

    app.listen(PORT, () => {
        console.log(`Express HTTP server listening on port ${PORT}`);
    });

}).catch(err => {
    console.log("Failed to initialize store service:", err);
});
