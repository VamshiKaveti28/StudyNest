// src/services/cloudinaryService.js

const CLOUDINARY_VIDEO_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dpqcpruya/video/upload";
const CLOUDINARY_IMAGE_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dpqcpruya/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Set to unsigned if using client-side uploads

// Function to upload a video to Cloudinary
export const uploadVideoToCloudinary = async (videoFile) => {
  try {
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_VIDEO_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to upload video: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    return {
      videoUrl: data.secure_url,
      videoId: data.public_id,
      duration: formatDuration(data.duration || 0),
    };
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error);
    throw error;
  }
};

// Function to upload an image to Cloudinary
export const uploadImageToCloudinary = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_IMAGE_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to upload image: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    return {
      imageUrl: data.secure_url,
      imageId: data.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

// Helper function to format video duration from seconds to "mm:ss" format
export const formatDuration = (seconds) => {
  if (!seconds) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const isValidCloudinaryUrl = (url) => {
  if (!url) return false;
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
};
