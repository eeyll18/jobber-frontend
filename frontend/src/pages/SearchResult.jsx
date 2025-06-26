import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios"; // Make sure axios is installed: npm install axios
import MainNavbar from "../components/layouts/MainNavbar"; // Adjust path if needed

const JobCard = ({ job }) => (
  <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white mb-4">
    <h3 className="text-xl font-semibold text-[#007998]">{job.position}</h3>
    {job.company && (
      <p className="text-md text-gray-700 mb-1 hover:underline">
        {job.company.name}
      </p>
    )}
    {/* Link to a potential Job Details page - adjust path as needed */}
    <a
      // to={`/job/${job.jobId}`}
      className="text-[#007998] hover:underline text-sm cursor-pointer"
    >
      View Details
    </a>
    {/* Display deadline if available */}
    {job.deadline && (
      <p className="text-sm text-gray-500 mt-2">
        Deadline: {new Date(job.deadline).toLocaleDateString()}
      </p>
    )}
  </div>
);

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const query = searchParams.get("query");

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Arama isteği gönderiliyor...");
        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_BASE_URL
          }/job/search?query=${encodeURIComponent(query)}`
        );
        setResults(response.data.jobs || []);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(
          err.response?.data?.message || "Failed to fetch search results."
        );
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div>
      <MainNavbar />
      <div className="container mx-auto px-4 pt-28 pb-10">
        {isLoading && <p className="text-center text-gray-500">Loading...</p>}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && results.length === 0 && (
          <p className="text-center text-gray-500">
            No job postings found matching your search.
          </p>
        )}

        {!isLoading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((job) => (
              <JobCard key={job.jobId} job={job} />
              /* Example direct rendering:
              <div key={job.jobId} className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold">{job.position}</h2>
                {job.Company && <p className="text-gray-600">{job.Company.name}</p>}
                <p className="text-sm text-gray-500">{job.departmant}</p>
                 Add more details or a link as needed
              </div>
              */
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
