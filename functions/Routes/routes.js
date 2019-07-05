const { db } = require("../Keys/admin");
const FBauth = require("../HelperFunctions/FBauth");

module.exports = app => {
  // Get specific post and its associated comments
  app.get("/post/:postId", async (req, res) => {
    try {
      let postData = {};
      const response = await db.doc(`/user-post/${req.params.postId}`).get();

      if (!response) return res.status(404).json({ err: "Comment Not Found" });
      postData = response.data();
      postData.id = response.id;
      // Collecting all comments
      const comments = await db
        .collection("comments")
        .orderBy("date", "asc")
        .where("postId", "==", postData.id)
        .get();

      postData.comments = [];

      comments.forEach(doc => {
        postData.comments.push(doc.data());
      });
      return res.json({ postData });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err });
    }
  });
  app.post("/post/:postId/comment", FBauth, async (req, res) => {
    try {
      if (req.body.body.trim() === "")
        return res.status(400).json({ err: "Comment must not be empty" });
      const newComment = {
        body: req.body.body,
        date: new Date().toISOString(),
        postId: req.params.postId,
        handle: req.user.handle,
        userImage: req.user.imageUrl
      };
      console.log(newComment);
      const comment = await db.doc(`/user-post/${req.param.postId}`).get();
      if (comment) {
        await db.collection("comments").add(newComment);
        return res.json(newComment);
      } else return res.status(404).json({ err: "Post does not exist" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err: "Something went wrong" });
    }
  });

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
      userImg: req.user.imageUrl,
      likeCount: 0,
      commentCount: 0,
      date: new Date().toISOString()
    };
    db.collection("user-post")
      .add(newPost)
      .then(doc => {
        const resPost = newPost;
        resPost.postId = doc.id;
        res.json(resPost);
      })
      .catch(err => {
        res.status(500).json({ err: "Bad Event" });
        console.log(err);
      });
  });
  //
};
