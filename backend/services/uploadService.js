const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (file) => {
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder: "cinevenue/movies",
    }
  );
  return result.secure_url;
};
