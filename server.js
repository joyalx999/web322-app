/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*   Name: Joyal Jaison
*   Student ID: 121783237
*   Date: 21/03/2025
*  Cyclic Web App URL: 
*  GitHub Repository URL: 
********************************************************************************/ 



const storeService = require("./store-service");


const express = require("express");
const path = require("path");
const app = express();

//Assignment 4
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

const Handlebars = require("./helpers"); // Import the custom helper



//Part 2 Assignment 3

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dlsggx7qm",
    api_key: "527346615744115",
    api_secret: "KFlLzS9EN_1xVQuVpewXrSgT70k",
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

//highlight an active link
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active"' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));


// Use "public" folder to serve static files
app.use(express.static("public"));

// Redirect the root route "/" to "/about"
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Serve the about.html file when "/about" is accessed
app.get("/about", (req, res) => {
    res.render("about");
});

//Add middleware to track active routes:
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


// Route to get all published items

/*app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then((data) => res.json(data))
        .catch((err) => res.status(404).json({ message: err }));
});*/

//Shop route on assignment 4
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await itemData.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await itemData.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await itemData.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });

// Handle unmatched routes (404 Not Found)
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});



// Route to get all items



app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "No items found for this category" });
                }
            })
            .catch((err) => res.render("items", { message: "Error: " + err }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "No items found after this date" });
                }
            })
            .catch((err) => res.render("items", { message: "Error: " + err }));
    } else {
        storeService.getAllItems()
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", { items: data });
                } else {
                    res.render("items", { message: "No items available" });
                }
            })
            .catch((err) => res.render("items", { message: "Error: " + err }));
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
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data });
            } else {
                res.render("categories", { message: "No categories found" });
            }
        })
        .catch((err) => res.render("categories", { message: "Error: " + err }));
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

app.get("/items/add", (req, res) => {
    res.render("addItem");
});



//Shop/:id route on assignment 4

app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned items by category
        if(req.query.category){
            // Obtain the published "items" by category
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "items"
            items = await itemData.getPublishedItems();
        }
  
        // sort the published items by itemDate
        items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await itemData.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await itemData.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

//Custom handlebars
app.use((req, res, next) => {
    res.locals.activeRoute = req.path;
    next();
});


//Navigation bar for active state
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
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