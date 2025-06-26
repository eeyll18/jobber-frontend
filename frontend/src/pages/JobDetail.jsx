import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import CompanyNavbar from "../components/layouts/CompanyNavbar";
import { fetchJobDetails } from "../services/jobService";
import {
  fetchApplicant,
  sendBulkApplicationEmail,
  sendSingleApplicationEmail,
} from "../services/applicationService";
import { fetchCvDetailsById } from "../services/userService";

const SCORE_BUCKETS = [
  { name: "0-20%", min: 0, max: 20 },
  { name: "21-40%", min: 21, max: 40 },
  { name: "41-60%", min: 41, max: 60 },
  { name: "61-80%", min: 61, max: 80 },
  { name: "81-100%", min: 81, max: 100 },
  { name: "N/A", min: -1, max: -1 },
];
const SCORE_THRESHOLD = 50;

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [minScorePercent, setMinScorePercent] = useState("");
  const [maxScorePercent, setMaxScorePercent] = useState("");
  const token = localStorage.getItem("token");

  const [selectedApplicants, setSelectedApplicants] = useState([]); // selected aday id set
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false); // email send loading
  const [sendingSingleEmailId, setSendingSingleEmailId] = useState(null); //adaya tek mail
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCvData, setSelectedCvData] = useState(null);
  const [isLoadingCvDetails, setIsLoadingCvDetails] = useState(false);
  const [cvDetailsError, setCvDetailsError] = useState(null);

  const [notification, setNotification] = useState({ type: "", message: "" });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({
    message: "",
    onConfirm: null,
  });

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message });
    if (duration) {
      setTimeout(() => setNotification({ type: "", message: "" }), duration);
    }
  };

  const clearNotification = () => {
    setNotification({ type: "", message: "" });
  };

  const openConfirmationModal = (message, onConfirmAction) => {
    setConfirmModalProps({ message, onConfirm: onConfirmAction });
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    if (confirmModalProps.onConfirm) {
      confirmModalProps.onConfirm();
    }
    setIsConfirmModalOpen(false);
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  const hasFinalStatus = (applicant) => {
    return (
      applicant &&
      (applicant.status === "accepted" || applicant.status === "rejected")
    );
  };

  const fetchData = useCallback(async () => {
    if (!jobId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [jobData, applicantsData] = await Promise.all([
        fetchJobDetails(jobId, token),
        fetchApplicant(jobId, token),
      ]);
      setJob(jobData);
      const processedApplicants = (applicantsData || []).map((app) => ({
        ...app,
        status: app.status || "pending",
      }));
      setApplicants(processedApplicants);
      console.log("[JobDetails] Fetched Applicants Data:", processedApplicants);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setError(
        "İş detayları veya başvuranlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parsePercentageInput = (value) => {
    if (value === null || value === undefined || value.trim() === "") {
      return null;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      return num / 100;
    }
    return null;
  };

  const handleCheckboxChange = (applicationId) => {
    const applicant = applicants.find((a) => a.applicationId === applicationId);
    if (hasFinalStatus(applicant)) {
      console.warn(
        `Cannot select applicant ${applicationId}, status is final.`
      );
      return;
    }
    setSelectedApplicants((prevSelected) => {
      if (prevSelected.includes(applicationId)) {
        return prevSelected.filter((id) => id !== applicationId);
      } else {
        return [...prevSelected, applicationId];
      }
    });
  };

  const filteredAndSortedApplicants = useMemo(() => {
    const minDecimal = parsePercentageInput(minScorePercent);
    const maxDecimal = parsePercentageInput(maxScorePercent);

    console.log(
      `Filtering with Min Decimal: ${minDecimal}, Max Decimal: ${maxDecimal}`
    );

    return [...applicants]
      .filter((a) => {
        if (!a || !a.user) return false;

        const applicantDecimalScore =
          typeof a.similarityScore === "number" ? a.similarityScore : null;

        // Skip filtering if score is not valid
        if (applicantDecimalScore === null) {
          // If score filters are set, exclude those without scores
          if (minDecimal !== null || maxDecimal !== null) {
            return false;
          }
          return true; // Otherwise include them
        }

        let passMin = true;
        let passMax = true;

        // Compare with decimal limits
        if (minDecimal !== null && applicantDecimalScore < minDecimal) {
          passMin = false;
        }
        if (maxDecimal !== null && applicantDecimalScore > maxDecimal) {
          passMax = false;
        }

        return passMin && passMax;
      })
      .sort((a, b) => {
        const scoreA_decimal =
          typeof a.similarityScore === "number" ? a.similarityScore : -Infinity;
        const scoreB_decimal =
          typeof b.similarityScore === "number" ? b.similarityScore : -Infinity;

        if (sortOption === "high") {
          return scoreB_decimal - scoreA_decimal;
        } else if (sortOption === "low") {
          return scoreA_decimal - scoreB_decimal;
        } else {
          return (a.applicationId || 0) - (b.applicationId || 0);
        }
      });
  }, [applicants, sortOption, minScorePercent, maxScorePercent]);

  const { chartData, summaryStats } = useMemo(() => {
    if (!applicants || applicants.length === 0) {
      return {
        chartData: [],
        summaryStats: {
          total: 0,
          aboveThreshold: 0,
          percentageAboveThreshold: 0,
        },
      };
    }

    // Initialize counts for each bucket
    const counts = SCORE_BUCKETS.reduce((acc, bucket) => {
      acc[bucket.name] = 0;
      return acc;
    }, {});

    let scoredApplicantsCount = 0;
    let countAboveThreshold = 0;

    applicants.forEach((applicant) => {
      const score = applicant.similarityScore;

      if (
        typeof score === "number" &&
        !isNaN(score) &&
        score >= 0 &&
        score <= 1
      ) {
        scoredApplicantsCount++;
        const scorePercent = score * 100;

        // Check against threshold
        if (scorePercent >= SCORE_THRESHOLD) {
          countAboveThreshold++;
        }

        // Find the correct bucket
        const bucket = SCORE_BUCKETS.find(
          (b) => scorePercent >= b.min && scorePercent <= b.max
        );
        if (bucket) {
          counts[bucket.name]++;
        } else {
          console.warn(`Score ${scorePercent}% did not fall into any bucket.`);
        }
      } else {
        // Count applicants with no valid score
        counts["N/A"]++;
      }
    });

    // Format data for Recharts [{ name: 'Bucket Name', count: Number }, ...]
    const formattedChartData = SCORE_BUCKETS.map((bucket) => ({
      name: bucket.name,
      count: counts[bucket.name] || 0,
    }));

    // Calculate summary percentage
    const percentageAboveThreshold =
      scoredApplicantsCount > 0
        ? Math.round((countAboveThreshold / scoredApplicantsCount) * 100)
        : 0;

    return {
      chartData: formattedChartData,
      summaryStats: {
        total: applicants.length,
        scored: scoredApplicantsCount,
        aboveThreshold: countAboveThreshold,
        percentageAboveThreshold: percentageAboveThreshold,
      },
    };
  }, [applicants]);

  const eligibleVisibleApplicantIds = useMemo(() => {
    return filteredAndSortedApplicants
      .filter((app) => !hasFinalStatus(app)) // Filter out those with final status
      .map((app) => app.applicationId);
  }, [filteredAndSortedApplicants]);

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      // Select only those eligible applicants currently visible
      setSelectedApplicants(eligibleVisibleApplicantIds);
    } else {
      setSelectedApplicants([]);
    }
  };

  const isAllEligibleVisibleSelected = useMemo(() => {
    if (eligibleVisibleApplicantIds.length === 0) {
      return false; // Nothing eligible to select
    }
    // Check if every eligible ID is present in the selectedApplicants array
    return eligibleVisibleApplicantIds.every((id) =>
      selectedApplicants.includes(id)
    );
  }, [eligibleVisibleApplicantIds, selectedApplicants]);

  // Determine if the "Select All" checkbox should be checked
  // It's checked if the filtered list is not empty AND every filtered applicant is selected
  // const isAllVisibleSelected = useMemo(() => {
  //   if (filteredAndSortedApplicants.length === 0) {
  //     return false;
  //   }
  //   return filteredAndSortedApplicants.every((app) =>
  //     selectedApplicants.includes(app.applicationId)
  //   );
  // }, [filteredAndSortedApplicants, selectedApplicants]);

  const handleSendSingleEmail = useCallback(
    async (applicationId, applicantUsername, type) => {
      const applicant = applicants.find(
        (a) => a.applicationId === applicationId
      );
      if (hasFinalStatus(applicant)) {
        showNotification(
          "warning",
          `${applicantUsername} has already been ${applicant.status}.`
        );
        return;
      }
      if (isSendingEmail) return;
      openConfirmationModal(
        `Are you sure you want to send ${
          type === "accept" ? "ACCEPTANCE" : "REJECTION"
        } email to ${applicantUsername}?`,
        async () => {
          // Onaylandığında çalışacak fonksiyon
          setIsSendingEmail(true);
          setSendingSingleEmailId(applicationId);
          try {
            const result = await sendSingleApplicationEmail(
              applicationId,
              type,
              token
            );
            console.log("Single email sent successfully:", result);
            showNotification(
              "success",
              `${
                type === "accept" ? "Acceptance" : "Rejection"
              } email sent to ${applicantUsername}.`
            );
            await fetchData();
          } catch (error) {
            console.error(
              `Error sending single email (ID: ${applicationId}):`,
              error
            );
            showNotification(
              "error",
              `Failed to send email to ${applicantUsername}: ${
                error.message || "Unknown error"
              }`
            );
          } finally {
            setIsSendingEmail(false);
            setSendingSingleEmailId(null);
          }
        }
      );
    },
    [token, applicants, fetchData, isSendingEmail]
  );

  const handleSendBulkEmail = useCallback(
    async (type) => {
      if (
        selectedApplicants.length === 0 ||
        isSendingBulkEmail ||
        sendingSingleEmailId
      ) {
        return;
      }

      const validSelectedApplicants = selectedApplicants.filter((id) => {
        const applicant = applicants.find((a) => a.applicationId === id);
        return applicant && !hasFinalStatus(applicant);
      });

      if (validSelectedApplicants.length === 0) {
        showNotification(
          "warning",
          "No applicants selected. Applicants who have already been accepted or rejected cannot be processed again."
        );
        return;
      }

      const confirmationMessage = `Are you sure you want to send ${
        type === "accept" ? "ACCEPTANCE" : "REJECTION"
      } emails to ${validSelectedApplicants.length} applicant(s)?`;

      openConfirmationModal(confirmationMessage, async () => {
        setIsSendingEmail(true);
        //  data for backend endpoint
        const applicantsToSend = validSelectedApplicants
          .map((id) => {
            const applicant = applicants.find((a) => a.applicationId === id);
            // Double check data integrity (should already be filtered but good safeguard)
            if (
              !applicant ||
              !applicant.user ||
              !applicant.user.email ||
              hasFinalStatus(applicant)
            ) {
              console.warn(
                `Skipping applicant ID ${id} during final prep: Missing data or final status.`
              );
              return null;
            }
            return {
              applicationId: applicant.applicationId,
              name: `${applicant.user.firstName || ""} ${
                applicant.user.lastName || ""
              }`.trim(),
              email: applicant.user.email,
              // Include status if backend needs it, otherwise it's just for filtering here
            };
          })
          .filter(Boolean); // Remove nulls

        if (applicantsToSend.length === 0) {
          console.log(
            "No valid applicants found to send bulk email after final filtering."
          );
          setIsSendingEmail(false);
          // Maybe show a message here too
          return;
        }

        console.log(
          `Preparing to send bulk ${type} emails to ${applicantsToSend.length} applicants:`,
          applicantsToSend
        );
        try {
          const result = await sendBulkApplicationEmail(
            applicantsToSend,
            type,
            token
          );
          console.log("Bulk email send result:", result);

          setSelectedApplicants([]);
          await fetchData();
        } catch (error) {
          console.error("Bulk email sending failed:", error);
        } finally {
          setIsSendingBulkEmail(false);
          setIsSendingEmail(false);
        }
      });
    },
    [
      selectedApplicants,
      token,
      applicants,
      fetchData,
      isSendingBulkEmail,
      sendingSingleEmailId,
    ]
  );

  if (!job || isLoading) {
    return <div className="text-center mt-8">Loading..</div>;
  }

  const handleProfileView = (userId, cvId) => {
    console.log("[JobDetails] handleProfileView called with:", {
      userId,
      cvId,
    });
    if (!userId) {
      console.error("user id not found");
      return;
    }
    if (cvId === undefined || cvId === null) {
      console.warn(
        "[JobDetails] handleProfileView: cvId eksik veya geçersiz!",
        cvId
      );
      // Seçenek: Kullanıcıyı uyar ve sadece genel profile yönlendir (state olmadan)
      // navigate(`/profile/${userId}`);
      // VEYA
      // Seçenek: Hata ver ve yönlendirme yapma
      alert("Bu başvuru için geçerli bir CV ID bulunamadı.");
      return;
    }

    const stateToPass = { appliedCvId: cvId };
    console.log("[JobDetails] Navigating to profile with state:", stateToPass);
    try {
      navigate(`/profile/${userId}`, { state: stateToPass }); // { state: { stateToPass } } DEĞİL!
      console.log("[JobDetails] Navigation initiated.");
    } catch (navError) {
      console.error("[JobDetails] Navigation Error:", navError);
      alert("Profil sayfasına yönlendirilirken bir hata oluştu.");
    }
  };

  const handleCvDetail = async (cvId) => {
    if (!cvId) {
      console.log("cannot fetch, cv id is missing");
      return;
    }

    if (!token) {
      console.log("auth token is missing");
      return;
    }

    console.log("fetching details for cvId: ", cvId);
    setIsModalOpen(true);
    setIsLoadingCvDetails(true);
    setSelectedCvData(null);
    setCvDetailsError(null);

    try {
      const cvDetails = await fetchCvDetailsById(cvId, token);
      if (!cvDetails) {
        throw new Error("CV data could not be retrieved or is empty.");
      }
      setSelectedCvData(cvDetails);
      console.log("cvDetails", cvDetails);
    } catch (err) {
      console.error("Error fetching CV details:", err);
      setCvDetailsError(err.message || "CV detayları yüklenemedi.");
    } finally {
      setIsLoadingCvDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCvData(null);
    setIsLoadingCvDetails(false);
    setCvDetailsError(null);
  };

  const formatScoreAsPercentage = (decimalScore) => {
    if (
      typeof decimalScore === "number" &&
      decimalScore >= 0 &&
      decimalScore <= 1
    ) {
      return `${(decimalScore * 100).toFixed(0)}%`; // percentage
    }
    return "-";
  };

  return (
    <>
      <CompanyNavbar />
      {notification.message && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg text-sm max-w-md
                ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : ""
                }
                ${
                  notification.type === "error"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : ""
                }
                ${
                  notification.type === "warning"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : ""
                }
                ${
                  notification.type === "info"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : ""
                }
            `}
          role="alert"
        >
          <div className="flex justify-between items-center">
            <span>{notification.message}</span>
            <button
              onClick={clearNotification}
              className="ml-4 text-xl leading-none font-semibold hover:opacity-75"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8 mt-20 px-4 min-h-screen">
        {/* left */}
        <div className="w-full lg:w-1/2 bg-white shadow-xl rounded-2xl p-8 space-y-4 border border-gray-200">
          <h2 className="text-3xl font-bold text-[#00768e]">{job.position}</h2>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <p className="text-gray-600 mt-2">
              📅 Published:{" "}
              {new Date(job.createdAt).toLocaleDateString("tr-TR")}
            </p>
            {/* <p className="text-gray-600 mt-2">
              🔗{job.company?.name || "Unknown"}
            </p> */}
          </div>
          <div className="border rounded-lg p-4 bg-gray-50">
            {/* <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Applicant Score Distribution
            </h3> */}
            {chartData && chartData.length > 0 && summaryStats.scored > 0 ? (
              <>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis
                        allowDecimals={false}
                        fontSize={10}
                        domain={[0, "dataMax"]}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: "12px", padding: "5px" }}
                        formatter={(value) => [`${value} applicants`, "Count"]}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="count"
                        name="Applicants"
                        fill="#008C94"
                        barSize={30}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              SCORE_BUCKETS[index].name === "N/A"
                                ? "#cccccc"
                                : "#008C94"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-center text-gray-600 mt-3">
                  {summaryStats.percentageAboveThreshold}% (
                  {summaryStats.aboveThreshold}/{summaryStats.scored}) of
                  applicants with scores are at or above {SCORE_THRESHOLD}%.
                  {summaryStats.total - summaryStats.scored > 0 &&
                    ` (${
                      summaryStats.total - summaryStats.scored
                    } applicants have no score).`}
                </p>
              </>
            ) : (
              <p className="text-center text-gray-500 italic py-10">
                {applicants.length === 0
                  ? "No applicants yet."
                  : "No score data available to display chart."}
              </p>
            )}
          </div>
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {job.description}
          </p>
        </div>
        {/* right */}
        <div className="w-full lg:w-1/2 bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          <h2 className="font-bold text-3xl text-[#00768e] mb-4">
            Applicants ({filteredAndSortedApplicants.length})
          </h2>
          {/* Sort Dropdown */}
          <div className="mb-4 flex justify-start">
            <select
              className="border w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">🔄 Default</option>
              <option value="high">⬆️ Similarity: Descending</option>
              <option value="low">⬇️ Similarity: Ascending</option>
            </select>
          </div>
          <div className="flex gap-4 items-center mb-4">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="Min Score % (0-100)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={minScorePercent}
              onChange={(e) => setMinScorePercent(e.target.value)}
              disabled={isSendingEmail}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="Max Score % (0-100)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={maxScorePercent}
              onChange={(e) => setMaxScorePercent(e.target.value)}
              disabled={isSendingEmail}
            />
          </div>
          {/* Select All Checkbox */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              className="h-4 w-4 text-[#00768e] focus:ring-[#005f73] border-gray-300 rounded"
              checked={isAllEligibleVisibleSelected}
              onChange={handleSelectAllChange}
              disabled={
                isSendingEmail || eligibleVisibleApplicantIds.length === 0
              }
            />
            <label htmlFor="selectAll" className="text-sm text-gray-700">
              Select All
            </label>
          </div>
          <div className="flex flex-wrap justify-between mb-4">
            <button
              onClick={() => handleSendBulkEmail("accept")}
              disabled={selectedApplicants.length === 0 || isSendingEmail}
              className="bg-slate-100 text-green-600 px-4 py-2 rounded hover:bg-green-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? "Sending..." : "✅ Accept"} (
              {selectedApplicants.length})
            </button>
            <button
              onClick={() => handleSendBulkEmail("reject")}
              disabled={selectedApplicants.length === 0 || isSendingEmail}
              className="bg-slate-100 text-red-600 px-4 py-2 rounded hover:bg-red-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? "Sending..." : "❌ Reject"} (
              {selectedApplicants.length})
            </button>
          </div>

          {applicants.length > 0 ? (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
              <div className="text-center">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 italic">
                    Select applicants individually or use "Select All to send
                    mail".
                  </p>
                </div>
              </div>

              {filteredAndSortedApplicants.map((applicant) => {
                const userId = applicant.user?.userId;
                if (!applicant || !applicant.user) {
                  console.warn(
                    "[JobDetails] Skipping applicant due to missing data:",
                    applicant
                  );
                  return null;
                }

                const appliedCvId = applicant.cvId;
                const isProcessed = hasFinalStatus(applicant);

                console.log(
                  `[JobDetails] Rendering applicant ${applicant.applicationId}: userId=${userId}, appliedCvId=${appliedCvId}`
                );
                return (
                  <div
                    key={applicant.applicationId}
                    className="bg-[#f9f9f9] p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-lg hover:scale-[1.01] hover:overflow-hidden overflow-hidden transition-transform duration-200"
                  >
                    {sendingSingleEmailId === applicant.applicationId && (
                      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                        <span className="text-sm font-semibold text-[#005f73]">
                          Processing...
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 w-full">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.includes(
                          applicant.applicationId
                        )}
                        onChange={() =>
                          handleCheckboxChange(applicant.applicationId)
                        }
                        disabled={isSendingEmail || isProcessed}
                        title="Select"
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 truncate">
                          {applicant.user.firstName} {applicant.user.lastName}
                          {isProcessed && (
                            <span
                              className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                                applicant.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {applicant.status.charAt(0).toUpperCase() +
                                applicant.status.slice(1)}
                            </span>
                          )}
                        </p>
                        <p className="font-semibold">
                          📊 Similarity:{" "}
                          <span className="font-bold">
                            {applicant.similarityScore
                              ? formatScoreAsPercentage(
                                  applicant.similarityScore
                                )
                              : "-"}
                          </span>
                        </p>
                      </div>
                      <div class="flex flex-wrap flex-col gap-1">
                        {" "}
                        <button
                          onClick={() => handleProfileView(userId, appliedCvId)}
                          disabled={!userId}
                          className="flex items-center gap-1 bg-gradient-to-r from-[#005F73] to-[#008C94] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#005f73] transition"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleCvDetail(appliedCvId)}
                          disabled={!appliedCvId}
                          className="flex items-center gap-1 bg-gradient-to-r from-[#005F73] to-[#008C94] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#005f73] transition"
                        >
                          See Details
                        </button>
                        <button
                          onClick={() =>
                            handleSendSingleEmail(
                              applicant.applicationId,
                              applicant.user.firstName,
                              "accept"
                            )
                          }
                          className="bg-[#2d6a4f] text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                          disabled={isSendingEmail || isProcessed}
                          title="Accept this candidate and send email"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleSendSingleEmail(
                              applicant.applicationId,
                              applicant.user.firstName,
                              "reject"
                            )
                          }
                          disabled={isSendingEmail || isProcessed}
                          title="Reject this candidate and send email"
                          className="bg-[#bf4342] text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-center text-gray-600 italic">
              {applicants.length === 0
                ? "No applications received for this job yet."
                : "No applicants match the current filters."}
            </p>
          )}
        </div>
      </div>
      <ApplicantCvModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cvData={selectedCvData}
        isLoading={isLoadingCvDetails}
        error={cvDetailsError}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        message={confirmModalProps.message}
        isConfirming={isSendingEmail}
      />
      <style jsx global>{`
        // ... (scrollbar styles remain the same) ...
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c5c5c5 #f1f1f1;
        }
      `}</style>
    </>
  );
}

const ApplicantCvModal = ({ isOpen, onClose, cvData, isLoading, error }) => {
  if (!isOpen) return null;

  const parseIfNeeded = (value) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      } catch (e) {
        // Not valid JSON or a simple string
      }
    }
    return value;
  };

  const processedCvData = cvData ? {
    ...cvData,
    experience: parseIfNeeded(cvData.experience),
    education: parseIfNeeded(cvData.education),
    skills: parseIfNeeded(cvData.skills),
    certifications: parseIfNeeded(cvData.certifications),
  } : null;

  const explicitlyHandledOrIgnoredKeys = [
    "fullName", "email", "phone",
    "experience", "education", "skills", "certifications", "Certification",
    // fields to ignore 
    "createdAt", "updatedAt", "CreatedAt", "UpdatedAt", "relevantPart","userId", "cvId","filePath","fileName",
    "id", "_id", "__v", 
  ];

  const renderSection = (title, data) => {
    if (!data) return null;

    if (Array.isArray(data)) {
      if (data.length === 0) return null;

      // Special handling for Skills and Certifications to be comma-separated
      if ((title === "Skills" || title === "Certification") && data.every(item => typeof item === 'string')) {
        return (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-[#005f73] border-b pb-1 mb-2">
              {title}
            </h4>
            <p className="text-sm">{data.join(', ')}</p>
          </div>
        );
      }

      // Default rendering for arrays of objects (like Work Experience)
      // or arrays of other types if not Skills/Certifications
      return (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-[#005f73] border-b pb-1 mb-2">
            {title}
          </h4>
          {data.map((item, index) => (
            <div key={index} className={`mb-2 ${typeof item === 'object' && item !== null ? 'pl-2 border-l-2 border-gray-200' : 'ml-1'}`}>
              {typeof item === 'object' && item !== null ? (
                Object.entries(item).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </span>{" "}
                    {value || "-"}
                  </p>
                ))
              ) : (
                <p className="text-sm">{item || "-"}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === 'object' && data !== null) {
      return (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-[#005f73] border-b pb-1 mb-2">
            {title}
          </h4>
          {Object.entries(data).map(([key, value]) => (
            <p key={key} className="text-sm">
              <span className="font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}:
              </span>{" "}
              {value || "-"}
            </p>
          ))}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-[#005f73] border-b pb-1 mb-2">
          {title}
        </h4>
        <p className="text-sm">{data}</p>
      </div>
    );
  };


  return (
    <div className="fixed inset-0  bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close modal"
        >
          ×
        </button>
        <h3 className="text-3xl font-bold text-[#005f73] mb-2">
          {processedCvData?.fullName ? processedCvData?.fullName : "Applicant Details"}
        </h3>
        <div className="flex flex-wrap flex-col gap-x-4 gap-y-1 text-sm mb-2 text-gray-600">
          <span className="inline-flex items-center">
            {processedCvData?.email ? processedCvData.email : "Email Unavailable"}
          </span>
          <span className="inline-flex items-center">
            {processedCvData?.phone ? processedCvData.phone : "Phone Unavailable"}
          </span>
        </div>
        {isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading CV details...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded border border-red-200">
            <p>Error loading CV details:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!isLoading && !error && processedCvData && (
          <div className="space-y-4">
            {renderSection("Work Experience", processedCvData.experience)}
            {renderSection("Education", processedCvData.education)}
            {renderSection("Skills", processedCvData.skills)}
            {renderSection("Certifications", processedCvData.certifications)}
            
            {Object.entries(processedCvData)
              .filter(([key]) => !explicitlyHandledOrIgnoredKeys.includes(key) && processedCvData[key])
              .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  if (Array.isArray(value) && value.length === 0) return null;
                  if (!Array.isArray(value) && Object.keys(value).length === 0) return null;
                }
                return renderSection(
                  key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase()),
                  value
                );
            })}
          </div>
        )}
        {!isLoading && !error && !processedCvData && (
          <div className="text-center py-6 text-gray-500 italic">
            No detailed CV data found.
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  title = "Confirm Action",
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmationModalTitle"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" // Added animation
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirmationModalTitle"
          className="text-lg font-semibold text-gray-800 mb-4"
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 rounded-lg bg-[#00768e] text-white hover:bg-[#005f73] text-sm font-medium disabled:opacity-50 transition-colors ${
              isConfirming ? "animate-pulse" : ""
            }`}
          >
            {isConfirming ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
      <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale { animation: fadeInScale 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default JobDetails;
