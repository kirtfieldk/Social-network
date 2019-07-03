const firebase = require("firebase/app");
const admin = require("firebase-admin");
// The credientails for the APP
const serviceAccount = require("../credentials.json");
const isEmpty = require("../HelperFunctions/isEmpty");
require("firebase/auth");
require("firebase/firestore");
//INITIALIZING ADMIN
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-netwrok.firebaseio.com"
});

const db = admin.firestore();

module.exports = app => {
  // Helper for auth routes
  const FBauth = async (req, res, next) => {
    let idToken;
    if (
      req.headers.autherization &&
      req.headers.autherization.startsWith("Bearer ")
    ) {
      idToken = req.headers.autherization.split("Bearer ")[1];
    } else {
      return res.status(403).json({ error: "Unautherized Posting" });
    }
    try {
      req.user = await admin.auth().verifyIdToken(idToken);
      const data = await db
        .collection("user")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
      req.user.handle = data.docs[0].data().handle;
      return next();
    } catch (err) {
      console.log("Error verf token");
      return res.status(403).json({ err });
    }
  };

  //

  app.get("/post", (req, res) => {
    db.collection("user-post")
      .orderBy("date", "desc")
      .get()
      .then(data => {
        let post = [];
        data.forEach(doc => {
          post.push({
            postId: doc.id,
            body: doc.data().body,
            handle: doc.data().handle,
            date: doc.data().date,
            commentCount: doc.data().commentCount,
            likeCOunt: doc.data().likeCOunt
          });
        });
        return res.json(post);
      })
      .catch(err => console.log(err));
  });
  // /////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // posting a user post
  app.post("/post", FBauth, (req, res) => {
    const newPost = {
      body: req.body.body,
      handle: req.user.handle,
      date: new Date().toISOString()
    };
    db.collection("user-post")
      .add(newPost)
      .then(doc => {
        res.json({ msg: `Document ${doc.id} created sussessfully` });
        const resPost = newPost;
        resPost.postId = doc.id;
        // res.json(resPost);
      })
      .catch(err => {
        res.status(500).json({ err: "Bad Event" });
        console.log(err);
      });
  });
  //
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // SIgn up Route
  let token, userId;
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
