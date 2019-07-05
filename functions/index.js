// FireBase
const firebase = require("firebase");
const functions = require("firebase-functions");
const keys = require("./Keys/dev");
const app = require("express")();
firebase.initializeApp(keys);

// ROutes
require("./Routes/routes")(app);
require("./Routes/SignIn")(app);
require("./Routes/Image")(app);
require("./Routes/User")(app);
require("./Routes/Likes")(app);
require("./Routes/Delete")(app);

exports.api = functions.https.onRequest(app);
