import React, { useState } from "react";
import axios from "axios";

const uploadTips = [
  "For best results, ensure clear headings like 'Education', 'Work Experience', and 'Skills'.",
  "Make sure your contact information (Email, Phone) is up-to-date and easy to find.",
  "A standard CV format helps us accurately extract your qualifications.",
  "Using a standard font and layout improves accuracy.",
];

export default function CvUpload({ onUploadSuccess, onClose }) {
  const [cv, setCv] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setCv(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!cv) {
      setMessage("Please select a CV file first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Authentication error. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("cv", cv);

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/cv/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("response data", response.data);
      setMessage(response.data.message);

      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        if (onClose) {
          // onClose();
        }
      }, 4000);
    } catch (error) {
      console.error("CV upload error:", error);
      setMessage(
        "Error uploading resume. Please ensure it's a valid PDF and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h4 className="text-md font-semibold text-[#005f73] mb-2">
          Tips
        </h4>
        <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
          {uploadTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label htmlFor="cv-upload" className="sr-only">
            Choose CV file
          </label>
          <input
            id="cv-upload"
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e0f7fa] file:text-[#00768e] hover:file:bg-[#b2ebf2] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00768e] focus:ring-offset-1"
          />
        </div>
        <div className="text-xs text-gray-900 mt-2">
          <p>
            The file you upload will only be used for job applications and will
            not be shared with third parties. Only PDF files are accepted.
            Ensure your CV is clearly formatted for best results.
          </p>
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out ${
            loading || !cv
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#00768e] hover:bg-[#005f73]"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00768e]`}
          disabled={loading || !cv}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>
      </form>
      {!loading && message && (
        <p className="mt-4 text-center text-sm font-medium text-green-600">
          {message}
        </p>
      )}
    </>
  );
}
