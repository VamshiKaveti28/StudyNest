// src/components/profile/ProfileEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import Button from "../common/Button";
import { Save, X, PlusCircle, Trash2 } from "lucide-react";

const ProfileEdit = ({ onCancel }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    profession: "",
    website: "",
    location: "",
    education: [],
    interests: [],
  });

  // New education item
  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    year: "",
  });

  // New interest item
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserProfile(currentUser.uid);

        if (profile) {
          setFormData({
            name: profile.name || currentUser.displayName || "",
            email: profile.email || currentUser.email || "",
            bio: profile.bio || "",
            profession: profile.profession || "",
            website: profile.website || "",
            location: profile.location || "",
            education: profile.education || [],
            interests: profile.interests || [],
          });
        } else {
          // Use data from auth if no profile exists
          setFormData({
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            bio: "",
            profession: "",
            website: "",
            location: "",
            education: [],
            interests: [],
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return;

    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));

    // Reset the form
    setNewEducation({
      degree: "",
      institution: "",
      year: "",
    });
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;

    setFormData((prev) => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()],
    }));

    // Reset the form
    setNewInterest("");
  };

  const removeInterest = (index) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      await updateUserProfile(currentUser.uid, formData);

      setSuccess("Profile updated successfully!");
      setSaving(false);

      // Wait a bit for the user to see the success message
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="shadow-sm rounded-md w-full p-2 border border-gray-300 bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label
                  htmlFor="profession"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Profession
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Software Developer, Student, Teacher"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. New York, USA"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us a bit about yourself"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Education
            </h3>

            {/* List of added education entries */}
            {formData.education.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 p-3 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-sm text-gray-600">
                        {edu.institution} {edu.year && `(${edu.year})`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new education form */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="degree"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Degree/Certificate
                  </label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={newEducation.degree}
                    onChange={handleEducationChange}
                    className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Bachelor of Science"
                  />
                </div>

                <div>
                  <label
                    htmlFor="institution"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Institution
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={newEducation.institution}
                    onChange={handleEducationChange}
                    className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Harvard University"
                  />
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    value={newEducation.year}
                    onChange={handleEducationChange}
                    className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 2022"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addEducation}
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Education
              </button>
            </div>
          </div>

          {/* Interests Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Interests
            </h3>

            {/* Display added interests as tags */}
            {formData.interests.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(index)}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new interest form */}
            <div className="flex items-center">
              <input
                type="text"
                id="interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="shadow-sm rounded-md w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Machine Learning, Web Development, Data Science"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
              />

              <button
                type="button"
                onClick={addInterest}
                className="ml-2 inline-flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to add multiple interests
            </p>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
