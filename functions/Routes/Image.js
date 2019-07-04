const { admin, db } = require("../Keys/admin");
const keys = require("../Keys/dev");
const busboy = require("busboy");
const FBauth = require("../HelperFunctions/FBauth");
const path = require("path");
const os = require("os");
const fs = require("fs");

module.exports = app => {
  app.post("/uploadimg", FBauth, (req, res) => {
    const busboy = new busboy({
      headers: req.headers
    });
    let imageFileName,
      imageToBeUploaded = {};
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      if (mimetype !== "image/jpg" && mimetype !== "image/png") {
        return res.status(400).json({ err: "Wrong file type" });
      }
      const imageExtension = filename.split(".")[filename.split(".").legth - 1];
      imageFileName = `${Math.round(Math.random * 1000000)}.${imageExtension}`;

      const filePath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = {
        filePath,
        mimetype
      };
      file.pipe(fs.createWriteStream(filePath));
    });
    busboy.on("finish", () => {
      admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filePath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then(() => {
          const imageUrl = `https://firebaseStorage.googleapis.com/v0/b/${
            keys.storageBucket
          }/o/${imageFileName}?alt=media`;
          return db.doc(`/user/${req.user.handle}`).update({ imageUrl });
        })
        .then(() => {
          return res.json({ msg: "image uploaded successfullt" });
        })
        .catch(err => {
          return res.status(500).json({ err });
        });
    });
  });
};
