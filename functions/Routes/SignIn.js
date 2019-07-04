const firebase = require("firebase/app");
const isEmpty = require("../HelperFunctions/isEmpty");

require("firebase/auth");
require("firebase/firestore");
const { db } = require("../Keys/admin");
const keys = require("../Keys/dev");

module.exports = app => {
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // SIgn up Route
  let token, userId;
  const noImg = "no-img.png";
  app.post("/signup", (req, res) => {
    if (!req.body) {
      return res.status(400).json({ msg: "Body must not be empty" });
    }
    // TODO validate
    const { email, password, confirmPassword, handle } = req.body;
    const newUser = {
      email,
      password,
      confirmPassword,
      handle
    };
    let error = {};
    // If email is empty push an error onto the error array
    if (isEmpty(email)) error.email = "Email cannot be empty";
    if (isEmpty(password)) error.password = "Password cannot be email";
    if (password !== confirmPassword)
      error.confirmPassword = "Passwords must match";
    if (isEmpty(handle)) error.handle = "Handle cannot be empty";

    if (Object.keys(error).length > 0) return res.status(400).json({ error });
    // END OF ERROR ARRAY
    db.doc(`/user/${newUser.handle}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return res.status(400).json({ err: "Handle Taken" });
        }
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      })
      .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken();
      })
      .then(idToken => {
        token = idToken;
        const userCredentials = {
          handle: newUser.handle,
          email: newUser.email,
          date: new Date().toISOString(),
          imageUrl: `https://firebaseStorage.googleapis.com/v0/b/${
            keys.storageBucket
          }/o/${noImg}?alt=media`,
          userId
        };
        return db.doc(`/user/${newUser.handle}`).set(userCredentials);
      })
      .then(() => {
        return res.status(201).json({ token });
      })
      .catch(err => {
        if (err.code === "auth/email-already-in-use")
          return res.status(400).json({ email: "email in use" });
        return res.status(500).json({ err });
      });
  });

  app.post("/login", (req, res) => {
    let error = {};
    const { email, password } = req.body;
    const user = {
      email,
      password
    };
    if (isEmpty(email)) error.email = "Email cannot be empty";
    if (isEmpty(password)) error.password = "Password cannot be empty";
    if (error.length > 0) return res.status(400).json({ error });

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(data => {
        return data.user.getIdToken();
      })
      .then(token => {
        res.json({ token });
      })
      .catch(err => {
        return res.status(500).json({ err });
      });
  });
};
