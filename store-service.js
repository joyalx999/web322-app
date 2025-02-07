/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Joyal Jaison
Student ID: 121783237 
Date: 06 Feb 2025
Web App URL: https://5ab87ad3-9d02-4a9d-a048-6b0803e0a97e-00-2z419ssocnsr5.janeway.replit.dev/
GitHub Repository URL: https://github.com/joyalx999/web322-app

********************************************************************************/ 

const fs = require("fs");

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }
            items = JSON.parse(data);

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
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

function getAllItemss() {
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
        const publishedItems = items.filter(item => item.published === true);
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

module.exports = { initialize, getAllItemss, getPublishedItems, getCategories };
