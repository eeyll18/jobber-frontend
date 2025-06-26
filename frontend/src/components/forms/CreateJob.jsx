import React, { useState } from "react";
import { createJob } from "../../services/jobService";
import CompanyNavbar from "../layouts/CompanyNavbar";
import { useNavigate } from "react-router-dom";

export default function CreateJob() {
  const categories = [
    "HR",
    "Designer",
    "Information-Technology",
    "Teacher",
    "Advocate",
    "Business-Development",
    "Healthcare",
    "Fitness",
    "Agriculture",
    "BPO",
    "Sales",
    "Consultant",
    "Digital-Media",
    "Automobile",
    "Chef",
    "Finance",
    "Apparel",
    "Engineering",
    "Accountant",
    "Construction",
    "Public-Relations",
    "Banking",
    "Arts",
    "Aviation",
  ];

  const [departmant, setDepartmant] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage(""); 

    const jobData = {
      departmant,
      position,
      description,
      deadline,
    };
    setLoading(true);
    try {
      const result = await createJob(jobData, token);
      setSuccessMessage("Job Posting Published Succesfully");
      console.log(result.message);
      setTimeout(() => {
        navigate("/job-listings");
      }, 1500);
    } catch (error) {
      console.log("Error creating job");
      setErrorMessage("Error occurred while publishing. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <CompanyNavbar />
      <form
        onSubmit={handleSubmit}
        className="bg-slate-100 mt-16 mb-12 shadow-xl rounded-lg p-6 md:p-8 w-full max-w-3xl lg:max-w-4xl animate-fadeIn"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#00768e]">
          Job Posting Entry
        </h2>

        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 font-semibold rounded-md text-center">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-6 md:gap-y-4">
          {" "}
          {/* left */}
          <div className="md:col-span-1 flex flex-col gap-y-4">
            <div className="mb-4 md:mb-0">
              <label
                htmlFor="departmant"
                className="block text-sm font-medium text-gray-700"
              >
                Departmant
              </label>
              <select
                id="departmant"
                value={departmant}
                onChange={(e) => setDepartmant(e.target.value)}
                required
                className="mt-1 block w-full p-2 border cursor-pointer border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00768e] focus:border-[#00768e]"
              >
                <option value="" disabled>
                  Select a department
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700"
              >
                Job Position
              </label>
              <textarea
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                rows="1"
                placeholder="e.g., Senior React Developer"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00768e] focus:border-[#00768e]"
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700"
              >
                Application Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                min={today}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00768e] focus:border-[#00768e]"
              />
            </div>
          </div>
          {/* right */}
          <div className="md:col-span-2 md:row-span-3 flex flex-col mb-4 md:mb-0">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Job Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="8"
              placeholder="Provide a detailed description of the role, responsibilities, and required qualifications..."
              className="mt-1 block flex-grow w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00768e] focus:border-[#00768e]"
            ></textarea>
            <p className="mt-2 mb-2 text-xs text-gray-600 italic">
              ✏️ Enter a descriptive and understandable job description.
            </p>
          </div>
          {/* tips for posting */}
          {/* <div className="md:col-span-3 mt-4 p-4 bg-blue-50 border mb-4 border-blue-200 rounded-md text-sm text-blue-800">
            <h4 className="font-semibold mb-2">
              Tips for Writing a Great Job Description:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Start with a brief overview of the company and the role.</li>
              <li>
                Clearly list the key responsibilities and day-to-day tasks.
              </li>
              <li>
                Specify required skills, qualifications, and experience
                (distinguish between must-haves and nice-to-haves).
              </li>
              <li>
                Mention company culture, benefits, or perks to attract
                candidates.
              </li>
              <li>Ensure the language is clear, concise, and inclusive.</li>
            </ul>
          </div> */}
          <div className="md:col-span-3 flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#00768e] text-white font-bold rounded-md shadow hover:bg-[#005f73] transition-colors duration-300"
            >
              {loading ? "📤 Publishing..." : "📢 Publish"}
            </button>
          </div>
        </div>
      </form>
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
        </div>
      )}
    </div>
  );
}
