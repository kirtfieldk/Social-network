const { db } = require("../Keys/admin");
module.exports = async (req, res) => {
  try {
    let userData = {};

    const response = await db.doc(`/user/${req.user.handle}`).get();
    if (response.exists) {
      userData.credentials = response.data();
      const data = await db
        .collection("likes")
        .where("handle", "==", req.user.handle)
        .get();
      userData.likes = [];
      data.forEach(doc => {
        return userData.likes.push(doc.data());
      });
      return res.json(userData);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};
