// src/components/instructor/InstructorCourses.jsx (updated)
import { useState, useEffect } from "react";
import {
  getInstructorCourses,
  toggleCoursePublishStatus,
  deleteCourse,
  getCourseById,
} from "../../services/instructorCourseService";
import Button from "../common/Button";
import { Eye, EyeOff, Edit, Trash2, FilePlus, BookOpen } from "lucide-react";
import CourseEdit from "./CourseEdit";

const InstructorCourses = ({ onCreateNewClick }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await getInstructorCourses();
      setCourses(coursesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      await toggleCoursePublishStatus(courseId, !currentStatus);

      // Update the local state
      setCourses(
        courses.map((course) =>
          course.id === courseId
            ? { ...course, published: !currentStatus }
            : course
        )
      );
    } catch (error) {
      console.error("Error toggling publish status:", error);
      setError("Failed to update course status");
    }
  };

  const handleEditClick = (courseId) => {
    setEditingCourse(courseId);
  };

  const handleCourseUpdated = () => {
    fetchCourses();
    setEditingCourse(null);
  };

  const handleDeleteClick = (courseId) => {
    setDeletingCourse(courseId);
  };

  const confirmDelete = async () => {
    if (!deletingCourse) return;

    try {
      await deleteCourse(deletingCourse);

      // Remove the course from the list
      setCourses(courses.filter((course) => course.id !== deletingCourse));
      setDeletingCourse(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course");
    }
  };

  const cancelDelete = () => {
    setDeletingCourse(null);
  };

  const cancelEdit = () => {
    setEditingCourse(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If in editing mode, show the course edit form
  if (editingCourse) {
    return (
      <CourseEdit
        courseId={editingCourse}
        onCancel={cancelEdit}
        onCourseUpdated={handleCourseUpdated}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
        <Button className="flex items-center" onClick={onCreateNewClick}>
          <FilePlus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            You haven't created any courses yet.
          </p>
          <Button
            onClick={onCreateNewClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Students
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Enrollment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {course.thumbnail ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={course.thumbnail}
                              alt={course.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
                              <BookOpen className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.category || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.enrollmentsCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.createdAt
                        ? new Date(
                            course.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {course.requiresApproval ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Approval Required
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          Auto-Approve
                        </span>
                      )}
                      {course.enrollmentLimit > 0 && (
                        <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Limit: {course.enrollmentLimit}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            handlePublishToggle(course.id, course.published)
                          }
                          className={`p-1 rounded-md ${
                            course.published
                              ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                              : "text-green-600 hover:text-green-700 hover:bg-green-100"
                          }`}
                          title={course.published ? "Unpublish" : "Publish"}
                        >
                          {course.published ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditClick(course.id)}
                          className="p-1 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(course.id)}
                          className="p-1 rounded-md text-red-600 hover:text-red-700 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete confirmation modal */}
          {deletingCourse && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Delete Course
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete this course? This
                            action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
