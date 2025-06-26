import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchUserProfile } from "../services/applicationService";
import Loading from "../components/common/Loading";
import Footer from "../components/layouts/Footer";
import CompanyNavbar from "../components/layouts/CompanyNavbar";

export default function ApplicantProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const location = useLocation();

  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvsData, setCvsData] = useState([]);

  // State'ten gelen CV ID'sini al (optional chaining ile güvenli erişim)
  const appliedCvId = location.state?.appliedCvId;

  const fetchProfileData = useCallback(async () => {
    if (!userId || !token) {
      setError("Kullanıcı ID veya yetkilendirme bilgisi eksik.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(
        `[ApplicantProfile] Fetching profile for user ${userId}, expecting specific CV ID: ${appliedCvId}`
      );
      const profileData = await fetchUserProfile(userId, token);
      console.log("[ApplicantProfile] Profile data received:", profileData);

      setUserData({
        name: profileData.name,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      console.log("userdata", profileData);

      // CV filtreleme
      const allCvs = profileData.cvs || [];
      console.log("allCvs", allCvs);
      if (appliedCvId !== "undefined" && appliedCvId !== null) {
        // Gelen ID (appliedCvId) ve listedeki CV ID'lerinin tiplerini eşleştirmek önemli
        const targetAppliedCv = parseInt(appliedCvId, 10);
        if (isNaN(targetAppliedCv)) {
          console.error(
            "[ApplicantProfile] Invalid appliedCvId received:",
            appliedCvId
          );
          setCvsData([]);
          return;
        }
        const specificCv = allCvs.find(
          (cv) => parseInt(cv.cvId, 10) === targetAppliedCv
        );
        if (specificCv) {
          console.log("[ApplicantProfile] Specific CV found:", specificCv);
          setCvsData([specificCv]);
        } else {
          console.warn(
            `[ApplicantProfile] CV with ID ${appliedCvId} (numeric: ${targetAppliedCv}) not found in user's CV list.`,
            allCvs
          );
          setCvsData([]);
        }
      } else {
        console.log(
          "[ApplicantProfile] No specific CV ID provided via state. Showing no CVs (or optionally show all)."
        );
        setCvsData([]);
      }
    } catch (err) {
      console.error("Profil verisi çekme hatası:", err);
      setError(
        "Failed to load applicant profile. Please check the ID or try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, appliedCvId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <>
        <CompanyNavbar />
        <Loading />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <CompanyNavbar />
        <div className="container mx-auto mt-20 p-4 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#00768e] text-white rounded hover:bg-[#005f73]"
          >
            Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!userData) {
    return (
      <>
        <CompanyNavbar />
        <div className="container mx-auto mt-20 p-4 text-center text-gray-600">
          Applicant profile data could not be loaded or the applicant does not
          exist.
        </div>
        <Footer />
      </>
    );
  }

  // CV bilgilerinden derlenmiş özet (ilk CV'yi baz alabilir veya birleştirebilirsiniz)
  const getCvSummary = () => {
    if (!cvsData || cvsData.length === 0)
      // cvsData null kontrolü eklendi
      return { phone: "N/A", skills: "N/A", experience: "N/A" };
    // Şimdilik ilk CV'yi kullanalım
    const firstCv = cvsData[0];
    if (!firstCv) return { phone: "N/A", skills: "N/A", experience: "N/A" };

    return {
      phone: firstCv.phone || "Not Specified",
      skills: firstCv.skills || "Not Specified",
      experience: firstCv.experience || "Not Specified",
    };
  };
  const cvSummary = getCvSummary();
  console.log("cv summary", cvSummary);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <CompanyNavbar />
      <main className="flex-1 container mx-auto mt-16 sm:mt-20 px-4 py-6 sm:px-6 lg:px-8">
        {" "}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm transition duration-150 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Applicants
        </button>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#005F73] to-[#008C94] p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 break-words">
              {formatName(userData?.firstName)} {formatName(userData?.lastName)}
            </h1>
            <p className="text-sm md:text-base text-teal-100 text-center break-words flex items-center justify-center gap-2">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {userData.email}
            </p>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#005f73] mb-4">
              Information
            </h2>
            <div className="gap-4 text-gray-700">
              <p className="break-words">
                <span className="font-medium">Phone:</span> {cvSummary.phone}
              </p>
              <p className=" break-words">
                <span className="font-medium">E-mail:</span> {userData?.email}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-[#005f73] mb-4">
              Submitted Resume
            </h2>
            {cvsData.length > 0 ? (
              <ul className="space-y-3">
                {cvsData.map((cv) => (
                  <li
                    key={cv.cvId || cv.filePath}
                    className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span className="font-medium text-gray-800 mr-2 break-words flex-grow">
                      {cv.fileName}
                    </span>
                    <a
                      // TODO: env'de olmalı
                      href={`${import.meta.env.VITE_APP_BASE_URL}/${cv.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-sm bg-[#00768e] text-white px-3 py-1 rounded hover:bg-[#005f73] transition duration-200 whitespace-nowrap"
                      title="View"
                    >
                      View Resume
                    </a>
                    {/* İsteğe bağlı: İndirme butonu (gizlilik politikasına göre karar verin) */}
                    {/*
                    
                    */}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 px-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  {appliedCvId !== undefined && appliedCvId !== null
                    ? "The specific resume submitted for this application could not be found or wasn't linked correctly."
                    : "No specific resume was linked to this profile view. The applicant may have multiple resumes."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
