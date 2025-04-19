const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

const connectionString = "mongodb+srv://jjaison6:<Jaison@6>@cluster0.6giy27f.mongodb.net/"; 

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve(); 
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(async (resolve, reject) => {
        try {
            if (userData.password !== userData.password2) {
                reject("Passwords do not match");
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(userData.password, salt);
            userData.password = hash;

            let newUser = new User({
                userName: userData.userName,
                password: userData.password,
                email: userData.email,
                loginHistory: []
            });

            await newUser.save();
            resolve();
        } catch (err) {
            if (err.code === 11000) {
                reject("User Name already taken");
            } else {
                reject("There was an error creating the user: " + err);
            }
        }
    });
};


module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length === 0) {
                    reject("Unable to find user: " + userData.userName);
                    return;
                }

                const user = users[0];

                bcrypt.compare(userData.password, user.password)
                    .then((isMatch) => {
                        if (!isMatch) {
                            reject("Incorrect Password for user: " + userData.userName);
                            return;
                        }

                        user.loginHistory.push({
                            dateTime: (new Date()).toString(),
                            userAgent: userData.userAgent
                        });

                        User.updateOne(
                            { userName: user.userName },
                            { $set: { loginHistory: user.loginHistory } }
                        )
                            .then(() => {
                                resolve(user);
                            })
                            .catch((err) => {
                                reject("There was an error verifying the user: " + err);
                            });
                    })
                    .catch(() => {
                        reject("Incorrect Password for user: " + userData.userName);
                    });
            })
            .catch(() => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};


