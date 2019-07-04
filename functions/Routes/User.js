const FBauth = require("../HelperFunctions/FBauth");
const getAuthUser = require("../HelperFunctions/getAuthUser");
const reduceUserDetail = require("../HelperFunctions/reduceUserDetails");
const { db } = require("../Keys/admin");

// Retrieving and adding user details
module.exports = app => {
  app.post("/user", FBauth, async (req, res) => {
    try {
      let userDetails = reduceUserDetail(req.body);
      await db.doc(`/user/${req.user.handle}`).update(userDetails);
      console.log(userDetails);
      return res.json({ msg: "User details updated successfullt" });
    } catch (err) {
      return res.status(500).json({ err });
    }
  });

  // Get user details
  app.get("/user", FBauth, getAuthUser, (req, res) => {
    res.send(req.user);
  });
};
