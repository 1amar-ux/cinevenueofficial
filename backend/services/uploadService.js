const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

exports.uploadImage = async (file) => {
  // If Cloudinary credentials are provided, attempt cloud upload
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "cinevenue/movies",
        }
      );
      return result.secure_url;
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local file storage:", err.message);
    }
  }

  // Local fallback: save to uploads/images directory
  const uploadsDir = path.join(process.cwd(), "uploads", "images");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const extension = (file.mimetype && file.mimetype.split("/")[1]) || "png";
  const filename = `img_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${extension}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/images/${filename}`;
};
