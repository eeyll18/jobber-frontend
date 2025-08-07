import React, { useCallback, useEffect, useRef, useState } from "react";
import UserNavbar from "../components/layouts/UserNavbar";
import { useSelector } from "react-redux";
import { deleteCv, fetchCvs } from "../services/userService";
import Loading from "../components/common/Loading";
import CvUpload from "../components/forms/CvUpload";
import Footer from "../components/layouts/Footer";

export default function ProfileUser() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cvs, setCvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cvSelectionRef = useRef(null); // cv bölümüne referans
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("token");
  // console.log("Profile'deki kullanıcı bilgisi:", user);

  // const { userData, cvs } = useUserData();

  const getCvsData = useCallback(async () => {
    if (!token) {
      setError("Authorization information not found.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCvs = await fetchCvs(token);
      setCvs(Array.isArray(fetchedCvs) ? fetchedCvs : []);
      // console.log("Fetched CVs:", fetchedCvs);
    } catch (error) {
      console.error("CV çekme hatası:", error);
      setError(
        "An issue occurred while loading your CVs. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      getCvsData();
    } else {
      setIsLoading(true);
    }
  }, [user, getCvsData]);

  const handleCvDelete = async (cvIdToDelete) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this CV? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const result = await deleteCv(cvIdToDelete, token);
      console.log("delete result", result);
      setCvs((prevCvs) => prevCvs.filter((cv) => cv.cvId !== cvIdToDelete));
    } catch (error) {
      console.error("Failed to delete CV:", error);
      const errorMessage =
        error.message || "Could not delete the CV. Please try again.";
      setError(errorMessage);
    }
  };

  const getCvSummary = () => {
    if (!cvs || cvs.length === 0) {
      return {
        phone: "Not specified",
        skills: "Not specified",
        experience: "Not specified",
      };
    }
    const firstCv = cvs[0];
    const safeParse = (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed)
          ? parsed.join(", ")
          : parsed || "Not specified";
      } catch (e) {
        return jsonString || "Not specified";
      }
    };
    return {
      phone: firstCv.phone || "Not specified",
      skills: safeParse(firstCv.skills),
      experience: safeParse(firstCv.experience),
    };
  };
  const cvSummary = getCvSummary();

  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!user && isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <UserNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loading />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <UserNavbar />
        <main className="flex-1 container mx-auto mt-20 p-6 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={getCvsData}
            className="mt-4 px-4 py-2 bg-[#00768e] text-white rounded hover:bg-[#005f73]"
          >
            Try Again!
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />
      <main className="flex-1 container mx-auto mt-16 md:mt-20 p-4 md:p-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
          <div
            className="text-white p-6 md:p-10 relative"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 118, 142, 1) 0%, rgba(0, 118, 142, 0.8) 50%, rgba(0, 118, 142, 0.6) 100%)",
            }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {formatName(user?.firstName)} {formatName(user?.lastName)}
            </h1>
            {/* <img src={user.profileImageUrl || defaultAvatar} alt="Profil Fotoğrafı" className="w-24 h-24 rounded-full mx-auto mt-4 border"/> */}
            <p className="text-lg sm:text-xl font-light">
              Discover job opportunities, build your career,{" "}
              <br className="hidden sm:block" /> and grow with us.
            </p>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-8 relative">
              <h2 className="text-2xl font-semibold text-[#005f73] mb-4">
                Personal Information
              </h2>
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <div className="space-y-2 text-gray-700 overflow-hidden">
                <p className="break-words">
                  <span className="font-medium mr-2">E-mail:</span>
                  {user.email}
                </p>
                <p className="break-words">
                  <span className="font-medium mr-2">Phone:</span>
                  {cvSummary.phone}
                </p>
                {/* <button
                  className="absolute -bottom-3 right-1 bg-[#00768e] text-[#ffffff] text-sm font-medium py-1 px-3 rounded-md shadow hover:bg-white hover:text-[#005f73] transition duration-200"
                >
                  Settings
                </button> */}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-2xl font-semibold text-[#005f73]">
                  Your Resumes ({cvs.length})
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#005F73] to-[#008C94] text-white px-4 py-2 rounded-lg hover:bg-[#005f73] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#00768e] focus:ring-opacity-50 self-end sm:self-center" // Mobil için tam genişlik, sonra otomatik
                >
                  Upload New
                </button>
              </div>

              {!error && cvs.length > 0 ? (
                <ul className="space-y-3">
                  {cvs.map((cv) => (
                    <li
                      key={cv.cvId}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition-shadow duration-200"
                    >
                      <span className="font-medium text-gray-800 truncate mb-2 sm:mb-0 sm:mr-4 flex-1">
                        {cv.fileName}
                      </span>
                      <div className="flex space-x-2 flex-shrink-0 self-end sm:self-center">
                        <a
                          href={`${import.meta.env.VITE_APP_BASE_URL}/${cv.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-gradient-to-r from-[#005F73] to-[#008C94] text-white px-3 py-1 rounded hover:bg-[#005f73] transition duration-200 whitespace-nowrap"
                          title="View CV"
                        >
                          View
                        </a>
                        <a
                          href={`${import.meta.env.VITE_APP_BASE_URL}/${cv.filePath}`}
                          download={cv.fileName}
                          className="text-sm bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200 whitespace-nowrap"
                          title="Download"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleCvDelete(cv.cvId)}
                          title="Delete"
                          className="text-sm px-3 py-1 rounded-full hover:bg-gray-300 bg-gray-200 transition duration-200 whitespace-nowrap"
                          aria-label={`Delete CV titled ${cv.fileName}`}
                        >
                          <span>🗑️</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  You haven't uploaded any CVs yet. Use the 'Upload New CV'
                  button to add one.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-60 z-50 backdrop-blur-xs">
          <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* <h3 className="text-xl font-semibold text-[#00768e] mb-4">
              Upload New Resume{" "}
            </h3> */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-1 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
              aria-label="close"
            >
              ×
            </button>
            <CvUpload
              onClose={() => setIsModalOpen(false)}
              onUploadSuccess={() => {
                setIsModalOpen(false);
                getCvsData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
