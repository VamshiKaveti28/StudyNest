// src/components/instructor/EnrollmentRequests.jsx
import { useState, useEffect } from "react";
import {
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from "../../services/enrollmentService";
import Button from "../common/Button";
import { UserCheck, UserX, Users, Calendar, BookOpen } from "lucide-react";

const EnrollmentRequests = () => {
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const enrollments = await getPendingEnrollments();
      setPendingEnrollments(enrollments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending enrollments:", error);
      setError("Failed to load enrollment requests");
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      setProcessingId(enrollmentId);
      await approveEnrollment(enrollmentId);
      setPendingEnrollments(
        pendingEnrollments.filter((e) => e.id !== enrollmentId)
      );
      setProcessingId(null);
    } catch (error) {
      console.error("Error approving enrollment:", error);
      setError("Failed to approve enrollment");
      setProcessingId(null);
    }
  };

  const handleReject = async (enrollmentId) => {
    try {
      setProcessingId(enrollmentId);
      await rejectEnrollment(enrollmentId);
      setPendingEnrollments(
        pendingEnrollments.filter((e) => e.id !== enrollmentId)
      );
      setProcessingId(null);
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      setError("Failed to reject enrollment");
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Enrollment Requests</h2>
        <Button
          onClick={fetchPendingEnrollments}
          variant="secondary"
          className="text-sm"
        >
          Refresh
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

      {pendingEnrollments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            You don't have any pending enrollment requests.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                </th>
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
                  Requested On
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
              {pendingEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {enrollment.user?.name?.charAt(0).toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.user?.name || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.user?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {enrollment.course?.title || "Unknown Course"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(enrollment.enrolledAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleApprove(enrollment.id)}
                        variant="success"
                        className="bg-green-600 hover:bg-green-700 flex items-center"
                        size="sm"
                        disabled={processingId === enrollment.id}
                      >
                        {processingId === enrollment.id ? (
                          <div className="animate-spin h-4 w-4"></div>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(enrollment.id)}
                        variant="danger"
                        className="bg-red-600 hover:bg-red-700 flex items-center"
                        size="sm"
                        disabled={processingId === enrollment.id}
                      >
                        {processingId === enrollment.id ? (
                          <div className="animate-spin h-4 w-4"></div>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnrollmentRequests;
