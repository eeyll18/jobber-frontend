import React, { useCallback, useEffect, useState } from "react";
import UserNavbar from "../components/layouts/UserNavbar";
import Footer from "../components/layouts/Footer";
import { fetchApplicationsByUser } from "../services/applicationService";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
    <span className="ml-3 text-gray-600">Loading Applications...</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
    <h3 className="mt-2 text-lg font-medium text-gray-900">
      No Applications Found
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      You haven’t applied for any jobs yet.
    </p>
    <div className="mt-6">
      <Link
        to="/job-postings"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white  bg-gradient-to-r from-[#005F73] to-[#008C94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      >
        Find Jobs to Apply
      </Link>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center"
    role="alert"
  >
    <span className="block sm:inline">
      {message || "An error occurred while fetching applications."}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const baseClasses =
    "px-5 py-1 rounded-full text-xs text-center font-semibold leading-tight inline-block";
  switch (status?.toLowerCase()) {
    case "accepted":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          Selected for Next Stage
        </span>
      );
    case "rejected":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          Not Selected
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          Under Review
        </span>
      );
  }
};

export default function AppliedJobs() {
  const user = useSelector((state) => state.auth.user); //user ve id reduxta tutuluyor
  const userId = user?.userId;
  console.log("user:", user);
  console.log("userId:", userId);

  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    application: null,
  });

  const fetchApplications = useCallback(async () => {
    if (!userId || !token) {
      setAppliedJobs([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedApplications = await fetchApplicationsByUser(userId, token);
      if (fetchedApplications && Array.isArray(fetchedApplications.data)) {
        setAppliedJobs(fetchedApplications.data);
        console.log("Applications fetched:", fetchedApplications.data);
        if (fetchedApplications.data.length === 0) {
          console.log(
            "User has no applications (handled in service or returned empty array)."
          );
        }
      } else {
        console.error(
          "Unexpected response structure from fetchApplicationsByUser:",
          fetchedApplications
        );
        setAppliedJobs([]);
        setError(
          "Received unexpected data format while fetching applications."
        );
      }
      console.log("for user başvurular geldi");
      console.log("fetcedhApplications", fetchedApplications);
    } catch (error) {
      console.error("Error caught in fetchApplications:", error);

      if (
        error.response &&
        error.response.status === 404 &&
        error.response.data?.message === "No applications found for this user"
      ) {
        console.log("Caught 404: User has no applications.");
        setAppliedJobs([]);
        setError(null);
      } else if (error.response && error.response.status === 404) {
        console.warn(
          "Received a 404 error, but not the 'no applications' message:",
          error.response.data
        );
        setAppliedJobs([]);
        setError("Could not find the requested resource.");
      } else {
        setAppliedJobs([]);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch applications. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      fetchApplications();
    } else {
      console.log("Waiting for user/token...");
      setLoading(false);
    }
  }, [userId, token, fetchApplications]);

  const openDetailModal = (application) => {
    setDetailModal({ isOpen: true, application });
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, application: null });
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen ">
      <UserNavbar />
      <div className="flex-1 flex flex-col items-center p-4 md:p-8 pt-20">
        <div className="w-full max-w-4xl mt-16">
          {loading ? (
            <LoadingSpinner />
          ) : !loading && error ? (
            <ErrorMessage message={error} />
          ) : !loading && !error && appliedJobs?.length > 0 ? (
            <ul className="space-y-6">
              {appliedJobs.map((application) => (
                <li
                  key={application.applicationId}
                  className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow duration-150 ease-in-out"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
                    <div className="md:col-span-1 space-y-2">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {application?.Job?.position || "Position Unavailable"}
                      </h2>
                      <Link
                        to={`/company/${application?.Job?.companyId}`}
                        className="text-sm text-gray-600 hover:text-teal-700 hover:underline flex items-center gap-2 group"
                      >
                        {application?.Job?.company?.name ||
                          "Company Unavailable"}
                      </Link>
                    </div>
                    <div className="md:col-span-1 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        📅{" "}
                        <span className="font-medium text-gray-700">
                          Applied at:
                        </span>
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString(
                              "en-EN"
                            )
                          : "N/A"}
                      </p>
                      <p className="flex items-center gap-2">
                        ⏳{" "}
                        <span className="font-medium text-gray-700">
                          Deadline:
                        </span>
                        {application?.Job?.deadline
                          ? new Date(
                              application.Job.deadline
                            ).toLocaleDateString("en-EN")
                          : "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-1 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 md:gap-4">
                      <StatusBadge status={application.status} />
                      <button
                        onClick={() => openDetailModal(application)}
                        className="bg-gradient-to-r from-[#005F73] to-[#008C94] flex items-center justify-center gap-2 text-white py-2 px-4 rounded-lg hover:scale-105 transition-all duration-150 ease-in-out text-sm font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      {detailModal.isOpen && (
        <ApplicationDetailModal
          application={detailModal.application}
          onClose={closeDetailModal}
        />
      )}
      <Footer />
    </div>
  );
}

const ApplicationDetailModal = ({ application, onClose }) => {
  if (!application) return null;
  const statusLower = application.status?.toLowerCase();

  return (
    <div className="fixed inset-0 z-[100]  bg-opacity-70 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="relative bg-white w-full md:w-3/4 lg:w-2/3 max-h-[85vh] p-6 rounded-lg shadow-xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute text-xl top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          X
        </button>
        <h2 className="text-2xl font-semibold text-[#005F73] mb-6 flex items-center gap-3 border-b pb-3">
          Application Details
        </h2>
        <div className="p-6 overflow-y-auto flex-grow space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <p>
              <span className="font-semibold text-gray-800 block mb-1">
                Position:
              </span>
              {application.Job?.position || "Position Unavailable"}
            </p>
            <p>
              <span className="font-semibold text-gray-800 block mb-1">
                Company:
              </span>
              {application.Job?.company?.name ? (
                <Link
                  to={`/company/${application.Job.companyId}`}
                  className="text-[#005F73] hover:underline"
                >
                  {application.Job.company.name}
                </Link>
              ) : (
                "Company Unavailable"
              )}
            </p>
            <p>
              <span className="font-semibold text-gray-800 block mb-1">
                Application Deadline:
              </span>
              {application.Job?.deadline
                ? new Date(application.Job.deadline).toLocaleDateString(
                    "en-EN",
                    { year: "numeric", month: "long", day: "numeric" }
                  )
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-800 block mb-1">
                Applied On:
              </span>
              {application.createdAt
                ? new Date(application.createdAt).toLocaleDateString("en-EN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Job Description:</p>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {application.Job?.description || "No description provided."}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <span className="font-semibold text-gray-800">Status:</span>
            <StatusBadge status={application.status} />
            {(statusLower === "accepted" || statusLower === "rejected") && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md text-sm text-blue-800 flex items-start gap-3 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <span>
                  Please check your registered email address for further
                  details, feedback, or instructions regarding the next steps
                  for this application. Communication regarding{" "}
                  {statusLower === "accepted" ? "selection" : "this decision"}{" "}
                  is typically sent via email.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
