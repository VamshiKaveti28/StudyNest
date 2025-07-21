import React, { useState } from "react";
import { Upload, Video, Image, Plus, X, Save } from "lucide-react";
import Button from "../common/Button";

const CourseUpload = () => {
  // Course basic information
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    level: "beginner",
    duration: "",
    category: "",
    tags: [],
  });

  // Instructor information
  const [instructorData, setInstructorData] = useState({
    name: "",
    avatar: null,
    avatarPreview: "",
  });

  // Media files
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Course lessons
  const [lessons, setLessons] = useState([
    {
      title: "",
      description: "",
      videoFile: null,
      videoFileName: "",
      duration: "",
      order: 1,
      courseId: "", // Will be set after course creation
      videoUrl: "", // Will be filled after Cloudinary upload
    },
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstructorChange = (e) => {
    const { name, value } = e.target;
    setInstructorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLessonChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [name]: value };
    setLessons(updatedLessons);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const preview = URL.createObjectURL(file);
      setThumbnailPreview(preview);
    }
  };

  const handleInstructorAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInstructorData({
        ...instructorData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleVideoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedLessons = [...lessons];
      updatedLessons[index] = {
        ...updatedLessons[index],
        videoFile: file,
        videoFileName: file.name,
      };
      setLessons(updatedLessons);
    }
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: "",
        description: "",
        videoFile: null,
        videoFileName: "",
        duration: "",
        order: lessons.length + 1,
        courseId: "", // Will be set after course creation
        videoUrl: "", // Will be filled after Cloudinary upload
      },
    ]);
  };

  const removeLesson = (index) => {
    if (lessons.length > 1) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      // Update order for remaining lessons
      updatedLessons.forEach((lesson, i) => {
        lesson.order = i + 1;
      });
      setLessons(updatedLessons);
    }
  };

  const addTag = () => {
    if (
      tagInput.trim() &&
      !courseData.tags.includes(tagInput.trim().toLowerCase())
    ) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, tagInput.trim().toLowerCase()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const uploadToCloudinary = async (file, type = "image") => {
    try {
      const uploadPreset = "ml_default"; // Your Cloudinary upload preset
      const cloudName = "dnus9ekks"; // Your Cloudinary cloud name

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        ...(type === "video" && { duration: data.duration || 0 }),
      };
    } catch (error) {
      console.error(`Error uploading ${type} to Cloudinary:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!courseData.title || !courseData.description) {
      setError("Please fill in all required fields for the course");
      return;
    }

    if (!instructorData.name) {
      setError("Please provide instructor name");
      return;
    }

    if (lessons.some((lesson) => !lesson.title)) {
      setError("Please provide a title for all lessons");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload thumbnail to Cloudinary
      let thumbnailUrl = "";
      if (thumbnailFile) {
        const thumbnailData = await uploadToCloudinary(thumbnailFile, "image");
        thumbnailUrl = thumbnailData.url;
      }

      // 2. Upload instructor avatar to Cloudinary
      let instructorAvatarUrl = "";
      if (instructorData.avatar) {
        const avatarData = await uploadToCloudinary(
          instructorData.avatar,
          "image"
        );
        instructorAvatarUrl = avatarData.url;
      }

      // 3. Create course in Firebase
      const courseRef = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          duration: courseData.duration,
          category: courseData.category,
          tags: courseData.tags,
          thumbnail: thumbnailUrl,
          instructor: instructorData.name,
          instructorAvatar: instructorAvatarUrl,
          enrollmentsCount: 0,
          published: false,
        }),
      });

      if (!courseRef.ok) {
        throw new Error("Failed to create course");
      }

      const courseResponse = await courseRef.json();
      const courseId = courseResponse.id;

      // 4. Upload videos and create lessons
      const lessonPromises = lessons.map(async (lesson) => {
        let videoUrl = "";

        if (lesson.videoFile) {
          // Upload video to Cloudinary
          const videoData = await uploadToCloudinary(lesson.videoFile, "video");
          videoUrl = videoData.url;
        }

        // Create lesson with video URL
        const lessonRef = await fetch("/api/lessons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: lesson.title,
            description: lesson.description,
            videoUrl: videoUrl,
            duration: lesson.duration || "0:00",
            order: lesson.order,
            courseId: courseId,
          }),
        });

        if (!lessonRef.ok) {
          throw new Error("Failed to create lesson");
        }

        return await lessonRef.json();
      });

      await Promise.all(lessonPromises);

      setSuccess("Course created successfully!");

      // Reset form after successful submission
      setCourseData({
        title: "",
        description: "",
        level: "beginner",
        duration: "",
        category: "",
        tags: [],
      });

      setInstructorData({
        name: "",
        avatar: null,
        avatarPreview: "",
      });

      setThumbnailFile(null);
      setThumbnailPreview("");

      setLessons([
        {
          title: "",
          description: "",
          videoFile: null,
          videoFileName: "",
          duration: "",
          order: 1,
          courseId: "",
          videoUrl: "",
        },
      ]);

      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1 && (!courseData.title || !courseData.description)) {
      setError("Please fill in all required fields for course details");
      return;
    }

    if (currentStep === 2 && !instructorData.name) {
      setError("Please provide instructor name");
      return;
    }

    setError("");
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Course Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Course Details</h3>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Difficulty Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={courseData.level}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={courseData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duration (e.g., "10 hours", "5 weeks")
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add tags and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="ml-2 p-2 bg-blue-600 text-white rounded-md"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {courseData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {courseData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Instructor Info
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Instructor Info */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">
              Instructor Information
            </h3>

            <div>
              <label
                htmlFor="instructorName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instructor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="instructorName"
                name="name"
                value={instructorData.name}
                onChange={handleInstructorChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Instructor Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor Avatar
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {instructorData.avatarPreview ? (
                    <div>
                      <img
                        src={instructorData.avatarPreview}
                        alt="Instructor avatar preview"
                        className="mx-auto h-24 w-24 object-cover rounded-full"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setInstructorData({
                            ...instructorData,
                            avatar: null,
                            avatarPreview: "",
                          })
                        }
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="avatar-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a photo</span>
                          <input
                            id="avatar-upload"
                            name="avatar"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleInstructorAvatarChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                onClick={goToPreviousStep}
                variant="secondary"
                className="bg-gray-200 hover:bg-gray-300"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Course Thumbnail
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Course Thumbnail */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Course Thumbnail</h3>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Thumbnail
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {thumbnailPreview ? (
                    <div>
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto h-40 w-auto object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview("");
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="thumbnail-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a thumbnail</span>
                          <input
                            id="thumbnail-upload"
                            name="thumbnail"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleThumbnailChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                onClick={goToPreviousStep}
                variant="secondary"
                className="bg-gray-200 hover:bg-gray-300"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Add Lessons
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Lesson Creation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Course Lessons</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add at least one lesson to your course. You can add more lessons
              later.
            </p>

            {lessons.map((lesson, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Lesson {index + 1}</h4>
                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`lesson-title-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`lesson-title-${index}`}
                      name="title"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`lesson-description-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id={`lesson-description-${index}`}
                      name="description"
                      value={lesson.description}
                      onChange={(e) => handleLessonChange(index, e)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`lesson-duration-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Duration (e.g., "10 min", "1:30")
                    </label>
                    <input
                      type="text"
                      id={`lesson-duration-${index}`}
                      name="duration"
                      value={lesson.duration}
                      onChange={(e) => handleLessonChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Video
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {lesson.videoFile ? (
                          <div>
                            <Video className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-2 text-sm text-gray-600">
                              {lesson.videoFileName}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedLessons = [...lessons];
                                updatedLessons[index] = {
                                  ...updatedLessons[index],
                                  videoFile: null,
                                  videoFileName: "",
                                };
                                setLessons(updatedLessons);
                              }}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor={`video-upload-${index}`}
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                              >
                                <span>Upload a video</span>
                                <input
                                  id={`video-upload-${index}`}
                                  type="file"
                                  accept="video/*"
                                  className="sr-only"
                                  onChange={(e) => handleVideoChange(index, e)}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              MP4, WebM up to 100MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center">
              <Button
                type="button"
                onClick={addLesson}
                variant="secondary"
                className="flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Lesson
              </Button>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                onClick={goToPreviousStep}
                variant="secondary"
                className="bg-gray-200 hover:bg-gray-300"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CourseUpload;
