import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyNavbar from "../components/layouts/CompanyNavbar";
import {
  deleteJob,
  getCompanyJobs,
  updateJob,
} from "../services/jobService";
import Footer from "../components/layouts/Footer";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <span className="ml-3 text-gray-600">Loading Job Listings...</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
    <h3 className="mt-2 text-lg font-medium text-gray-900">
      No Job Listings Found
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      You haven't posted any jobs yet.
    </p>
    <div className="mt-6">
      <Link
        to="/dashboard/company/create"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      >
        Post a New Job
      </Link>
    </div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex flex-col sm:flex-row items-center justify-between"
    role="alert"
  >
    <div className="flex items-center">
      <span className="block sm:inline">
        {message || "An error occurred while fetching job listings."}
      </span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
      >
        Retry
      </button>
    )}
  </div>
);

function JobListings() {
  const [jobListings, setJobListings] = useState([]);
  const token = localStorage.getItem("token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelecetedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedJobs = await getCompanyJobs(token);
      setJobListings(Array.isArray(fetchedJobs) ? fetchedJobs : []);
      console.log("eda");
    } catch (error) {
      console.log("Error fetching jobs");
      setError(
        error.message || "Failed to fetch job listings. Please try again."
      );
      setJobListings([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openModal = useCallback((job) => {
    setSelecetedJob(job);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelecetedJob(null);
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CompanyNavbar />
      <div className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          {jobListings && jobListings.length > 0 ? (
            <ul className="space-y-6">
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorMessage message={error} onRetry={fetchJobs} />
              ) : !jobListings || jobListings.length === 0 ? (
                <EmptyState />
              ) : (
                jobListings.map((job, index) => (
                  <li
                    key={index}
                    className="bg-white rounded-2xl p-6 mt-16 shadow-lg border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-xl"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          Position : {job.position}
                        </h2>
                      </div>
                      <div className="md:col-span-4 text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          📅 <span className="font-medium">Published:</span>{" "}
                          {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                        <p className="flex items-center gap-2">
                          ⏳ <span className="font-medium">Deadline:</span>{" "}
                          {new Date(job.deadline).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="md:col-span-4 flex flex-col sm:flex-row sm:justify-end gap-3">
                        <Link
                          to={`/job/${job.jobId}`}
                          className="bg-gradient-to-r from-[#005F73] to-[#008C94] text-white flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200"
                        >
                          View Post
                        </Link>
                        <button
                          onClick={() => {
                            openModal(job);
                          }}
                          className="bg-gradient-to-r from-red-700 to-red-600 text-white flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="text-gray-700 text-center text-lg font-medium">
              Henüz bir iş ilanı eklemediniz.
            </p>
          )}
        </div>
      </div>
      {isModalOpen && selectedJob && (
        <DeleteJobModal
          job={selectedJob}
          closeModal={closeModal}
          updateJobList={fetchJobs}
        />
      )}
      <Footer/>
    </div>
  );
}

const DeleteJobModal = ({ job, closeModal, updateJobList }) => {
  const token = localStorage.getItem("token");
  const [deadline, setDeadline] = useState("");
  const [formData, setFormData] = useState({
    title: job.title,
    location: job.location,
    deadline: job.deadline,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDelete = async () => {
    if (!job || !job.jobId) {
      console.error("Job data is missing or invalid.");
      return;
    }
    try {
      await deleteJob(job.jobId, token);
      console.log(`Job with ID ${job.jobId} deleted successfully.`);
      updateJobList();
      closeModal();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };
  const handleUpdate = async () => {
    try {
      await updateJob(job.jobId, formData, token);
      updateJobList();
      closeModal();
    } catch (error) {
      console.log("Error updating job");
    }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-60 backdrop-blur-xs">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Update</h2>

        <div>
          <p className="text-sm text-gray-800">
            You Can Update Deadline:
          </p>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
          />
        </div>

        <p className="text-sm text-gray-800 mb-2">
          Job Deletion action cannot be undone.
        </p>
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-sm space-y-1">
          <p>
            <span className="font-medium text-gray-700">Position:</span>{" "}
            {job.position}
          </p>
          <p>
            <span className="font-medium text-gray-700">Published:</span>{" "}
            {new Date(job.createdAt).toLocaleDateString("tr-TR")}
          </p>
          <p>
            <span className="font-medium text-gray-700">Deadline:</span>{" "}
            {new Date(job.deadline).toLocaleDateString("tr-TR")}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={closeModal}
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-[#007682] text-white py-2 px-4 rounded hover:bg-teal-700"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListings;
