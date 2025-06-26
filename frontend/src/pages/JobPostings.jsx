import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useState } from "react";
import UserNavbar from "../components/layouts/UserNavbar";
import { getAllJobsForUsers, fetchJobDetails } from "../services/jobService";
import { fetchCvs } from "../services/userService";
import {
  applyForJob,
  fetchApplicationsByUser,
} from "../services/applicationService";
import { Link } from "react-router-dom";

const cleanString = (str) => (str || "").replace(/"/g, "").toLowerCase().trim();

const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(23, 59, 59, 999);

  const now = new Date();

  return now > deadlineDate;
};

function JobListings() {
  const [allJobListings, setAllJobListings] = useState([]); // Store all fetched jobs
  const [filteredJobListings, setFilteredJobListings] = useState([]); // Store jobs to display
  const [initialSector, setInitialSector] = useState(""); // Sector from the first CV for initial load/reset
  // Filter states
  const [selectedCvIdForFilter, setSelectedCvIdForFilter] = useState(""); // CV selected in the filter
  const [positionFilter, setPositionFilter] = useState(""); // Position text from the filter input
  const [isLoadingData, setIsLoadingData] = useState(true); // Added loading state

  const [userApplications, setUserApplications] = useState([]); // <-- State for user's applications

  const [userCvs, setUserCvs] = useState([]);
  // const [userSector, setUserSector] = useState("");
  const [applyModal, setApplyModal] = useState({
    selectedJob: null,
    selectedCv: null,
    isOpen: false,
    isLoading: false,
    feedbackMessage: null,
    feedbackType: null,
  });
  const [detailModal, setDetailModal] = useState({
    selectedJob: null,
    isOpen: false,
    isLoading: false,
    feedbackMessage: null,
    feedbackType: null,
  });
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  const applyInitialFilter = useCallback((jobs, sector) => {
    if (sector) {
      return jobs.filter((job) => cleanString(job.departmant) === sector);
    }
    return jobs; // Return all jobs if no initial sector
  }, []);

  // --- Data Fetching and Initial Filtering ---
  useEffect(() => {
    if (!token || !userId) {
      console.error("Token or userId missing.");
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);

    const fetchData = async () => {
      try {
        const cvs = await fetchCvs(token);
        setUserCvs(cvs);
        console.log("CV data:", cvs);

        const firstCvWithSector = cvs.length > 0 ? cvs[0] : null;
        const sector = firstCvWithSector?.sector
          ? cleanString(firstCvWithSector.sector)
          : "";
        setInitialSector(sector);
        console.log("Initial user sector:", sector);

        const allJobs = await getAllJobsForUsers(token);
        setAllJobListings(allJobs);
        console.log("All job postings:", allJobs);

        // Apply initial filter based on the first CV's sector
        const initiallyFiltered = applyInitialFilter(allJobs, sector);
        setFilteredJobListings(initiallyFiltered);
        console.log("Initially filtered jobs:", initiallyFiltered);

        const applications = await fetchApplicationsByUser(userId, token);
        setUserApplications(applications.data);
        console.log("User applications:", applications.data);
      } catch (error) {
        console.error("Data fetching error:", error);
        setAllJobListings([]);
        setFilteredJobListings([]);
        setUserApplications([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [token, userId, applyInitialFilter]);

  const applyFilters = useCallback(() => {
    console.log("--- Applying Filters ---");
    console.log("Selected CV ID for Filter:", selectedCvIdForFilter);
    console.log("Position Filter Text:", positionFilter);
    console.log("Initial Sector for context:", initialSector);

    let jobsToFilter = [...allJobListings];
    let activeSectorFilter = null;

    // 1. Determine the sector context
    if (selectedCvIdForFilter) {
      // A specific CV is selected, use its sector
      const selectedCvIdAsNumber = Number(selectedCvIdForFilter);
      const selectedCv = userCvs.find((cv) => cv.cvId === selectedCvIdAsNumber);

      if (selectedCv && selectedCv.sector) {
        activeSectorFilter = cleanString(selectedCv.sector);
        console.log("Using sector from selected CV:", activeSectorFilter);
      } else {
        // CV selected but not found or has no sector - treat as no sector filter
        console.log(
          "Selected CV not found or has no sector. No sector filter applied based on selection."
        );
        activeSectorFilter = null;
      }
    } else if (initialSector && initialSector !== '""') {
      // No CV selected, fall back to the initial sector (if it exists)
      activeSectorFilter = initialSector;
      console.log("No CV selected, using initial sector:", activeSectorFilter);
    } else {
      // No CV selected and no valid initial sector
      console.log(
        "No CV selected and no initial sector. No sector filter applied."
      );
      activeSectorFilter = null;
    }

    if (activeSectorFilter) {
      jobsToFilter = jobsToFilter.filter(
        (job) => cleanString(job.departmant) === activeSectorFilter
      );
      console.log(
        `Jobs after filtering by sector '${activeSectorFilter}':`,
        jobsToFilter.length
      );
    } else {
      console.log("Skipping sector filtering step.");
    }

    const cleanedPositionFilter = positionFilter.toLowerCase().trim();
    if (cleanedPositionFilter) {
      console.log("Filtering by position containing:", cleanedPositionFilter);
      jobsToFilter = jobsToFilter.filter((job) =>
        job.position?.toLowerCase().includes(cleanedPositionFilter)
      );
      console.log("Jobs after position filter:", jobsToFilter.length);
    }

    console.log("Final filtered job count:", jobsToFilter.length);
    setFilteredJobListings(jobsToFilter);
  }, [
    allJobListings,
    selectedCvIdForFilter,
    positionFilter,
    userCvs,
    initialSector,
  ]);

  const handleClearFilters = () => {
    setSelectedCvIdForFilter("");
    setPositionFilter("");

    if (initialSector) {
      const initiallyFilteredJobs = allJobListings.filter(
        (job) => cleanString(job.departmant) === initialSector
      );
      setFilteredJobListings(initiallyFilteredJobs);
    } else {
      setFilteredJobListings([...allJobListings]);
    }
    console.log("Filters cleared, reverting to initial view.");
  };

  const handleApply = (job) => {
    if (isDeadlinePassed(job.deadline)) {
      alert("The application deadline for this job has passed.");
      return;
    }
    const alreadyApplied =
      Array.isArray(userApplications) &&
      userApplications.some((app) => app.jobId === job.jobId);
    if (alreadyApplied) {
      alert("You have already applied for this job.");
      return;
    }
    setApplyModal({
      // Create a fresh state object for opening
      isOpen: true, // Open the modal
      selectedJob: job, // Set the new job
      selectedCv: null, // Clear previous CV selection
      isLoading: false, // Ensure loading is false initially
      feedbackMessage: null, // <<-- Explicitly clear feedback message
      feedbackType: null, // <<-- Explicitly clear feedback type
    });
  };

  const handleGetDetail = (job) => {
    setDetailModal((prev) => ({ ...prev, selectedJob: job, isOpen: true }));
  };

  const handleSubmitApply = async () => {
    if (isDeadlinePassed(applyModal.selectedJob?.deadline)) {
      alert("The application deadline has passed while you were applying.");
      setApplyModal((prev) => ({
        ...prev,
        isOpen: false,
        isLoading: false,
        selectedCv: null,
      }));
      return;
    }

    const alreadyApplied =
      Array.isArray(userApplications) &&
      userApplications.some(
        (app) => app.jobId === applyModal.selectedJob.jobId
      );
    if (alreadyApplied) {
      alert("You seem to have already applied for this job.");
      setApplyModal((prev) => ({
        ...prev,
        isOpen: false,
        isLoading: false,
        selectedCv: null,
      }));
      return;
    }

    if (!applyModal.selectedCv) {
      alert("Lütfen bir CV seçin.");
      return;
    }
    if (!userId || !applyModal.selectedJob) {
      console.error("userId veya selectedJob eksik!");
      setApplyModal((prev) => ({
        ...prev,
        isLoading: false,
        feedbackMessage: "An internal error occurred. Please try again later.",
        feedbackType: "error",
      }));
      return;
    }

    setApplyModal((prev) => ({
      ...prev,
      isLoading: true,
      feedbackMessage: null,
      feedbackType: null,
    }));

    try {
      const result = await applyForJob(
        applyModal.selectedCv,
        userId,
        applyModal.selectedJob.jobId
      );
      console.log("result", result);
      // alert("Başvurunuz başarıyla alındı!");
      // closeApplyModal();
      const newApplication = { jobId: applyModal.selectedJob.jobId };
      setUserApplications((prevApps) => {
        if (!prevApps.some((app) => app.jobId === newApplication.jobId)) {
          return [...prevApps, newApplication];
        }
        return prevApps;
      });

      setApplyModal((prev) => ({
        ...prev,
        isLoading: false,
        feedbackMessage: "Your application has been successfully received!",
        feedbackType: "success",
      }));
    } catch (error) {
      alert("Başvuru sırasında bir hata oluştu.");
      console.error("Başvuru hatası:", error);
    }
  };

  const handleCvSelection = (cvId) => {
    setApplyModal((prev) => ({ ...prev, selectedCv: cvId }));
  };

  const closeApplyModal = () => {
    setApplyModal((prev) => ({
      ...prev,
      isOpen: false,
      selectedCv: null,
      isLoading: false,
    }));
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, selectedJob: null, isLoading: false });
  };

  const handleApplyFromDetail = () => {
    if (detailModal.selectedJob) {
      const jobToApply = detailModal.selectedJob;
      closeDetailModal();

      setTimeout(() => {
        handleApply(jobToApply);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-100 p-4 pt-24 md:sticky md:top-0 md:h-screen md:overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">
        <div className="">
          <h2 className="mb-4 text-xl font-semibold text-center">
            Filter Jobs
          </h2>
          {/* <label className="block mb-2 font-medium text-gray-700">
            Filter by Resume
          </label>
          <select
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            onChange={(e) => setSelectedCvIdForFilter(e.target.value)}
            value={selectedCvIdForFilter}
            disabled={userCvs.length === 0}
          >
            <option value="">Select (Optional)</option>
            {userCvs.map((cv) => (
              <option key={cv.cvId} value={cv.cvId}>
                {cv.fileName || `CV ${cv.cvId}`}{" "}
              </option>
            ))}
          </select> */}
          {userCvs.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">Upload a CV to filter.</p>
          )}
          {/* <label className="block mb-2 font-medium text-gray-700">
            Filter by Position
          </label> */}
          <input
            type="text"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., Front-End Developer"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          />
          <button
            onClick={applyFilters}
            className="w-full bg-[#005F73]  hover:bg-[#006873] text-white text-sm font-medium px-4 py-2 rounded mb-2 transition duration-150 ease-in-out"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="w-full bg-gray-500 hover:bg-gray-600 text-sm font-medium text-white px-4 py-2 rounded transition duration-150 ease-in-out"
          >
            Clear Filters
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center p-4 md:p-6 lg:p-8">
        <UserNavbar />
        <div className="w-full max-w-5xl mt-6 md:mt-16">
          {" "}
          {filteredJobListings && filteredJobListings.length > 0 ? (
            <ul className="space-y-4 md:space-y-6">
              {filteredJobListings.map((job) => {
                const expired = isDeadlinePassed(job.deadline);
                const hasApplied =
                  !expired &&
                  Array.isArray(userApplications) &&
                  userApplications.some((app) => app.jobId === job.jobId);
                const isDisabled = expired || hasApplied;

                let buttonText = "Apply Now";
                let buttonClass =
                  "bg-gradient-to-r from-[#005F73] to-[#008C94] hover:shadow-md hover:scale-105";
                let buttonTitle = "Apply for this job";
                if (expired) {
                  buttonText = "Deadline Passed";
                  buttonClass = "bg-gray-400 cursor-not-allowed opacity-70";
                  buttonTitle = "Application deadline has passed";
                } else if (hasApplied) {
                  buttonText = "Applied";
                  buttonClass = "bg-green-700 cursor-not-allowed opacity-80";
                  buttonTitle = "You have already applied for this job";
                }
                return (
                  <li
                    key={job.jobId}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 transition-transform transform hover:scale-[1.02] hover:shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Job Info */}
                      <div className="flex-grow mb-3 sm:mb-0">
                        <h3 className="text-lg sm:text-xl font-bold text-[#005F73] mb-1 sm:mb-2">
                          {job.position || "Position Not Specified"}
                        </h3>
                        <p className="text-sm sm:text-md text-gray-700 mb-2">
                          <span className="font-semibold">Department:</span>{" "}
                          {job.departmant || "N/A"}
                        </p>
                        <p className="text-sm sm:text-md text-gray-800 mb-1">
                          🏢 <span className="font-semibold">Company:</span>{" "}
                          {job.company ? (
                            <Link
                              to={`/company/${job.company.companyId}`}
                              className="text-[#005F73] hover:underline font-medium"
                            >
                              {job.company.name}
                            </Link>
                          ) : (
                            "Unknown Company"
                          )}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-2 flex flex-col sm:flex-row sm:gap-4">
                        <p>
                          📅 <span className="font-medium">Published:</span>{" "}
                          {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                        <p className={expired ? "text-red-500" : ""}>
                          ⏳<span className="font-medium">Deadline:</span>{" "}
                          {new Date(job.deadline).toLocaleDateString("tr-TR")}
                          {expired && " (Expired)"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end flex-shrink-0">
                        <button
                          onClick={() => handleGetDetail(job)}
                          className="w-full sm:w-auto bg-gradient-to-r from-[#005F73] to-[#008C94] text-white text-xs sm:text-sm py-2 px-5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200"
                        >
                          Get Details
                        </button>
                        <button
                          onClick={() => handleApply(job)}
                          disabled={isDisabled}
                          className={`w-full sm:w-auto text-white text-xs sm:text-sm py-2 px-5 rounded-lg shadow transition-all duration-200 ${buttonClass}`}
                          title={buttonTitle}
                        >
                          {buttonText}{" "}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center mt-10 md:mt-20 p-6 bg-white rounded-lg shadow border border-gray-200">
              {selectedCvIdForFilter || positionFilter ? (
                <p className="text-gray-700 text-md sm:text-lg font-medium">
                  No job listings match your current filters.
                  <br />
                  <button
                    onClick={handleClearFilters}
                    className="text-teal-600 hover:underline mt-2 text-sm"
                  >
                    Clear filters and view all jobs?
                  </button>
                </p>
              ) : (
                <p className="text-gray-700 text-md sm:text-lg font-medium">
                  {initialSector
                    ? `No job listings found${
                        initialSector !== '""'
                          ? ` matching your initial sector (${initialSector})`
                          : ""
                      }.`
                    : "No job listings currently available."}
                  {userCvs.length === 0 &&
                    " Consider uploading a CV via your profile."}
                  {allJobListings.length > 0 &&
                    !selectedCvIdForFilter &&
                    !positionFilter && (
                      <span className="block mt-2 text-sm text-gray-500">
                        Try clearing filters or searching by position title.
                      </span>
                    )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {applyModal.isOpen && (
        <ApplyModal
          job={applyModal.selectedJob}
          userCvs={userCvs}
          selectedCv={applyModal.selectedCv}
          isLoading={applyModal.isLoading}
          onClose={closeApplyModal}
          onSelectCv={handleCvSelection}
          onSubmit={handleSubmitApply}
          feedbackMessage={applyModal.feedbackMessage}
          feedbackType={applyModal.feedbackType}
        />
      )}
      {detailModal.isOpen && (
        <DetailModal
          job={detailModal.selectedJob}
          onClose={() => setDetailModal({ isOpen: false, selectedJob: null })}
          onApply={handleApplyFromDetail}
          hasApplied={
            Array.isArray(userApplications) &&
            userApplications.some(
              (app) => app.jobId === detailModal.selectedJob?.jobId
            )
          }
          isExpired={isDeadlinePassed(detailModal.selectedJob?.deadline)}
        />
      )}
    </div>
  );
}

const ApplyModal = React.memo(
  ({
    job,
    userCvs,
    selectedCv,
    isLoading,
    onClose,
    onSelectCv,
    onSubmit,
    feedbackMessage,
    feedbackType,
  }) => {
    useEffect(() => {
      let timerId;
      if (feedbackMessage) {
        // If there's a feedback message, set a timer to close the modal
        timerId = setTimeout(() => {
          onClose(); // Call the parent's close function
        }, 3000); // Close after 3 seconds (adjust as needed)
      }

      // Cleanup function to clear the timer if the modal is closed manually
      // or if the feedback message changes before the timer finishes
      return () => {
        clearTimeout(timerId);
      };
    }, [feedbackMessage, onClose]);
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
        <div className="relative p-6 sm:p-8 bg-white rounded-lg shadow-xl w-11/12 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
            Apply for: <span className="text-[#005F73]">{job?.position}</span>
          </h2>
          <p className="text-sm text-[#005F73] mb-5">
            at {job?.company?.name || "Unknown Company"}
          </p>
          {!feedbackMessage ? (
            <>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Select CV to Apply With:
              </h3>
              {userCvs.length > 0 ? (
                <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-2">
                  {userCvs.map((cv) => (
                    <div
                      key={cv.cvId}
                      className="flex items-center p-2 border rounded hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        id={`cv-${cv.cvId}`}
                        name="selectedCv"
                        value={cv.cvId}
                        checked={selectedCv === cv.cvId}
                        onChange={() => onSelectCv(cv.cvId)}
                        className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <label
                        htmlFor={`cv-${cv.cvId}`}
                        className="text-gray-800 flex-grow cursor-pointer"
                      >
                        {cv.fileName}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-600 bg-red-100 p-3 rounded mb-6">
                  No CV available. Please upload a CV first via your profile.
                </p>
              )}
              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="py-2 px-4 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-150 ease-in-out font-medium w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isLoading || userCvs.length === 0 || !selectedCv}
                  className={`py-2 px-6 rounded text-white transition duration-150 ease-in-out ${
                    isLoading || userCvs.length === 0 || !selectedCv
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </>
          ) : (
            <div
              className={`mt-6 p-4 rounded text-center ${
                feedbackType === "success"
                  ? "bg-green-100 border border-green-300 text-green-800"
                  : "bg-red-100 border border-red-300 text-red-800"
              }`}
            >
              <p className="font-medium">{feedbackMessage}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 font-bold text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            X
          </button>
        </div>
      </div>
    );
  }
);

const DetailModal = ({ job, onClose, onApply, hasApplied, isExpired }) => {
  const [jobData, setJobData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (job?.jobId && token) {
      const loadDetails = async () => {
        setIsLoadingDetails(true);
        setDetailError(null);
        setJobData(null);
        try {
          const data = await fetchJobDetails(job.jobId, token);
          console.log(`DetailModal: Fetched details:`, data);
          setJobData(data);
        } catch (error) {
          console.error("DetailModal: Error fetching job details:", error);
          setDetailError(
            "Failed to load job description. Please try closing and reopening the details."
          );
        } finally {
          setIsLoadingDetails(false);
        }
      };
      loadDetails();
    } else {
      setJobData(null);
      setIsLoadingDetails(false);
      setDetailError(null);
    }
  }, [job?.jobId, token]);

  if (!job) return null;

  const disableApplyButton = isExpired || hasApplied;
  let applyButtonText = "Apply Now";
  let applyButtonClass = "bg-[#007682] hover:bg-teal-800";
  let applyButtonTitle = "Apply for this job from details";

  if (isExpired) {
    applyButtonText = "Deadline Passed";
    applyButtonClass = "bg-gray-400";
    applyButtonTitle = "Application deadline has passed";
  } else if (hasApplied) {
    applyButtonText = "Already Applied";
    applyButtonClass = "bg-green-600";
    applyButtonTitle = "You have already applied for this job";
  }

  const descriptionToShow = jobData?.description || job.description;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="relative bg-white w-full md:w-3/4 lg:w-2/3 max-h-[85vh] p-6 rounded-lg shadow-xl overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">
          {job.position || "Job Details"}
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          at{" "}
          <span className="font-semibold">
            {job.company?.name || "Unknown Company"}
          </span>
        </p>
        <h3 className="text-md font-semibold mt-5 mb-2 text-gray-800">
          Description:
        </h3>
        {isLoadingDetails ? (
          <div className="text-gray-500 italic py-4">
            Loading description...
          </div>
        ) : detailError ? (
          <div className="text-red-500 bg-red-50 p-3 rounded border border-red-200">
            {detailError}
          </div>
        ) : (
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {descriptionToShow || "No description available."}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
          <p className="bg-gray-100 p-2 rounded">
            <span className="font-semibold text-gray-700">
              Publication Date:
            </span>{" "}
            {new Date(job.createdAt).toLocaleDateString("en-EN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="bg-gray-100 p-2 rounded">
            <span className="font-semibold text-gray-700">
              Application Deadline:
            </span>{" "}
            {new Date(job.deadline).toLocaleDateString("en-EN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-150 ease-in-out order-last sm:order-first"
          >
            Close
          </button>
          <button
            onClick={onApply}
            disabled={disableApplyButton}
            className={`py-2 px-5 rounded text-white font-medium transition duration-150 ease-in-out ${applyButtonClass} ${
              disableApplyButton
                ? "cursor-not-allowed opacity-70"
                : "hover:opacity-90"
            }`}
            title={applyButtonTitle}
          >
            {applyButtonText}
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-bold text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default JobListings;
