const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.getPost = functions.https.onRequest((req, res) => {
  let post = [];
  admin
    .firestore()
    .collection("user-post")
    .get()
    .then(data => {
      data.forEach(doc => {
        post.push(doc.data());
      });
      return res.json(post);
    })
    .catch(err => console.log(err));
});

exports.createPost = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ err: "Method not allowed" });
  }
  const newPost = {
    body: req.body.body,
    handle: req.body.handle,
    date: admin.firestore.Timestamp.fromDate(new Date()),
    client_email: req.body.client_email
  };
  admin
    .firestore()
    .collection("user-post")
    .add(newPost)
    .then(doc => res.json({ msg: `Document ${doc.id} created sussessfully` }))
    .catch(err => {
      res.status(500).json({ err: "Bad Event" });
      console.log(err);
    });
});
