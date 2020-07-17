"use strict";
exports.__esModule = true;
var dotenv = require("dotenv");
var express = require("express");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var mongoose = require("mongoose");
var encrypt = require("mongoose-encryption");
var app = express();
var router = express.Router();
app.use("/", router);
// const uri =
//   "mongodb://admin-erencan:XXXXXXX@cluster0-shard-00-00.efw9y.mongodb.net:27017,cluster0-shard-00-01.efw9y.mongodb.net:27017,cluster0-shard-00-02.efw9y.mongodb.net:27017/secretsDB?ssl=true&replicaSet=atlas-ad3yxk-shard-0&authSource=admin&retryWrites=true&w=majority";
// mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connect("mongodb://localhost:27017/secretsDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
dotenv.config();
var connection = mongoose.connection;
connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
var userCreditentialSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
});
userCreditentialSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"]
});
var User = mongoose.model("User", userCreditentialSchema);
app.get("/", function (req, res) {
    res.render("home");
});
app
    .route("/login")
    .get(function (req, res) {
    res.render("login", {
        warningText: ""
    });
})
    .post(function (req, res) {
    User.findOne({ username: req.body.username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser && foundUser.password == req.body.password) {
                res.render("secrets");
            }
            else {
                res.render("login", {
                    warningText: "Username or password incorrect."
                });
            }
        }
    });
});
app.get("/logout", function (req, res) {
    res.render("home");
});
app.get("/secrets", function (req, res) {
    res.send("Acess Denied!");
});
app
    .route("/register")
    .post(function (req, res) {
    User.exists({ username: req.body.username }, function (err, result) {
        if (!err) {
            if (result) {
                res.render("register", {
                    warningText: "Username already taken."
                });
            }
            else {
                var newUser = new User({
                    username: req.body.username,
                    password: req.body.password
                }).save();
                res.render("secrets");
            }
        }
        else {
            console.log(err);
        }
    });
})
    .get(function (req, res) {
    res.render("register", {
        warningText: ""
    });
});
app.listen(3000, function () {
    console.log("Server started succesfully on port 3000!");
});
