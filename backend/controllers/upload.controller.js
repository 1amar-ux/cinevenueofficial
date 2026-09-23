const { uploadMediaDetailed } = require("../services/uploadService");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file) {
  if (!file) {
    return "No image file provided";
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return `Invalid file format: ${file.mimetype}. Allowed formats: JPG, JPEG, PNG, WEBP`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
  }
  return null;
}

// POST /api/v1/admin/uploads/event-poster
exports.uploadEventPoster = async (req, res) => {
  try {
    const error = validateImageFile(req.file);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const alt = req.body.alt || "Event poster";
    const media = await uploadMediaDetailed(req.file, "cinevenue/events/posters", alt);

    res.status(200).json({
      success: true,
      message: "Event poster uploaded successfully",
      file: media,
      // Flat properties for direct compatibility
      url: media.url,
      publicId: media.publicId,
      alt: media.alt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/uploads/event-banner
exports.uploadEventBanner = async (req, res) => {
  try {
    const error = validateImageFile(req.file);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const alt = req.body.alt || "Event banner";
    const media = await uploadMediaDetailed(req.file, "cinevenue/events/banners", alt);

    res.status(200).json({
      success: true,
      message: "Event banner uploaded successfully",
      file: media,
      url: media.url,
      publicId: media.publicId,
      alt: media.alt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/uploads/image
exports.uploadGenericImage = async (req, res) => {
  try {
    const error = validateImageFile(req.file);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const folder = req.body.folder || "cinevenue/general";
    const alt = req.body.alt || "Uploaded image";
    const media = await uploadMediaDetailed(req.file, folder, alt);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      file: media,
      url: media.url,
      publicId: media.publicId,
      alt: media.alt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
