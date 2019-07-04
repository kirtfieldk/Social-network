const admin = require("firebase-admin");
// The credientails for the APP
const serviceAccount = require("../credentials.json");

//INITIALIZING ADMIN
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-netwrok.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
