const { admin, db } = require("../Keys/admin");

module.exports = async (req, res, next) => {
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
    req.user.imageUrl = data.docs[0].data().imageUrl;
    return next();
  } catch (err) {
    console.log("Error verf token");
    return res.status(403).json({ err });
  }
};
