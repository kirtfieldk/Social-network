const { db } = require("../Keys/admin");
const FBauth = require("../HelperFunctions/FBauth");
// Deleting a post
module.exports = app => {
  app.delete("/post/:postId", FBauth, async (req, res) => {
    try {
      const document = await db.doc(`user-post/${req.params.postId}`).get();
      if (!doc.exist) {
        return res.status(404).json({ err: "post not found" });
      }
      if (doc.data().handle !== req.user.handle) {
        return res.status(403).json({ err: "Unarthorized action" });
      }
      await document.delete();
      res.json({ msg: "Post deleted successfully" });
    } catch (err) {
      return res.status(500).json({ err: err.code });
    }
  });
};
