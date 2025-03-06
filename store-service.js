/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Joyal Jaison
Student ID: 121783237
Date: 03/05/2025
Cyclic Web App URL: 
GitHub Repository URL: https://github.com/joyalx999/web322-app
********************************************************************************/ 



const fs = require("fs");
const path = require("path");

//let items = [];

let items = [
    { id: 1, category: 5, postDate: "2024-01-10" },
    { id: 2, category: 3, postDate: "2023-11-15" },
    { id: 3, category: 5, postDate: "2024-02-05" },
    { id: 4, category: 2, postDate: "2022-08-22" }
];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "data", "items.json"), "utf8", (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }
            items = JSON.parse(data);

            fs.readFile(path.join(__dirname, "data", "categories.json"), "utf8", (err, data) => {
                if (err) {
                    reject("Unable to read categories.json");
                    return;
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No results returned");
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        let publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned");
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No results returned");
        }
    });
}

// Step 3: Add the addItem function
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        // Set the published property to false if undefined
        if (itemData.published === undefined) {
            itemData.published = false;
        }

        // Set the id to the length of the items array + 1
        itemData.id = items.length + 1;

        // Push the new item to the items array
        items.push(itemData);

        // Write the updated items array to items.json
        fs.writeFile(path.join(__dirname, "data", "items.json"), JSON.stringify(items, null, 2), (err) => {
            if (err) {
                reject("Error saving item data");
                return;
            }

            // Resolve the promise with the newly added item
            resolve(itemData);
        });
    });
}


// Step 1: getItemsByCategory(category)
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

// Step 2: getItemsByMinDate(minDateStr)
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

// Step 3: getItemById(id)
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const foundItem = items.find(item => item.id == id);
        if (foundItem) {
            resolve(foundItem);
        } else {
            reject("no result returned");
        }
    });
}


// Export all functions including the new addItem function
module.exports = { initialize, getAllItems, getPublishedItems, getCategories, addItem, getItemsByCategory, getItemsByMinDate, getItemById };


