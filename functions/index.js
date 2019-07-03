// FireBase
const firebase = require("firebase");
const functions = require("firebase-functions");
const keys = require("./Keys/dev");
const app = require("express")();
firebase.initializeApp(keys);

// ROutes
require("./routes/routes")(app);

exports.api = functions.https.onRequest(app);
