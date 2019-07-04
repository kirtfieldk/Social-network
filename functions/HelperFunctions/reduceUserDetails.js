const isEmpty = require("./isEmpty");
module.exports = value => {
  let userDetails = {};
  if (!isEmpty(value.bio.trim())) userDetails.bio = value.bio;
  if (!isEmpty(value.website.trim())) {
    if (value.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${value.website.trim()}`;
    }
    userDetails.website = value.website;
  }
  if (!isEmpty(value.location.trim())) userDetails.location = value.location;

  return userDetails;
};
