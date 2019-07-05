const { db } = require("../Keys/admin");
const FBauth = require("../HelperFunctions/FBauth");

module.exports = app => {
  //Like a post
  app.get("/post/:postId/like", FBauth, async (req, res) => {
    try {
      const postDoc = await db.doc(`user-post/${req.params.postId}`).get();

      let postData = {};

      if (postDoc.exists) {
        postData = postDoc.data();
        postData.postId = postDoc.postId;
        const likeDoc = await db
          .collection("Likes")
          .where("handle", "==", req.user.handle)
          .where("postId", "==", req.params.postId)
          .limit(1)
          .get();

        // ///////////////////////////////////////////////////////////////////////////////////
        if (!likeDoc) {
          await db.collection("Likes").add({
            postId: req.params.postId,
            handle: req.user.handle
          });
          postData.likeCount++;
          await db
            .doc(`user-post/${req.params.postId}`)
            .update({ likeCount: postData.likeCount });
          return res.json(postData);
        } else return res.status(400).json({ err: "Post already Liked" });
      } else return res.status(404).json({ err: "post not foud" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err });
    }
  });
  // Unlike a post
  app.get("/post/:postId/unlike", FBauth, async (req, res) => {
    try {
      let postData;
      const postDoc = await db.doc(`/user-post/${req.params.postId}`).get();
      if (postDoc) {
        postData = postDoc.data();
        postData.postId = postDoc.id;
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
      const data = await db
        .collection("Likes")
        .where("handle", "==", req.user.handle)
        .where("postId", "==", req.params.postId)
        .get();
      if (data.empty) {
        return res.status(400).json({ error: "Post not liked" });
      } else {
        await db.doc(`/Likes/${data.docs[0].id}`).delete();

        postData.likeCount--;
        await db
          .doc(`/user-post/${req.params.postId}`)
          .update({ likeCount: postData.likeCount });
        return res.send(postData);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.code });
    }
  });
  // RETRIEVE ALL LIKES IN DATABASE
  app.get("/likes", FBauth, async (req, res) => {
    console.log(req.user.handle);
    try {
      let array = [];
      const likeArray = await db
        .collection("Likes")
        .where("handle", "==", req.user.handle)
        .get();
      if (!likeArray.exsts) {
        likeArray.forEach(element => {
          console.log(element.data().handle);
          array.push({
            handle: element.data().handle,
            id: element.data().postId
          });
        });
      } else res.json({ msg: "no elements found" });

      res.json(array);
    } catch (err) {
      console.log(err);
    }
  });
};
