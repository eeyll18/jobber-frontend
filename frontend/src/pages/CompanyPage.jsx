import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicCompany } from "../services/userService";
import UserNavbar from "../components/layouts/UserNavbar";
import Loading from "../components/common/Loading";
import Footer from "../components/layouts/Footer";

export default function CompanyPage() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return; // ID yoksa işlem yapma

      setLoading(true);
      setError(null);
      try {
        const data = await getPublicCompany(companyId, token);
        setCompany(data);
      } catch (err) {
        console.error("Şirket bilgisi çekme hatası:", err);
        setError("Şirket bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [companyId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <UserNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loading /> {/* Use the Loading component */}
        </main>
        <Footer />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <UserNavbar />
        <main className="flex-1 container mx-auto mt-20 p-6 text-center text-red-600">
          <p>{error}</p>
          <button
            // onClick={() => navigate(-1)} // Go back button
            className="mt-4 px-4 py-2 bg-[#00768e] text-white rounded hover:bg-[#005f73]"
          >
            Go Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <UserNavbar />
        <main className="flex-1 container mx-auto mt-20 p-6 text-center text-gray-600">
          <p>Company details could not be loaded.</p>
          <button
            // onClick={() => navigate(-1)} // Go back button
            className="mt-4 px-4 py-2 bg-[#00768e] text-white rounded hover:bg-[#005f73]"
          >
            Go Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <UserNavbar />
      <main className="flex-1 container mx-auto mt-20 p-6">
        <button
          onClick={() => navigate(-1)} // Go back
          className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
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
          Back
        </button>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#005F73] to-[#008C94] p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 break-words">
              {company?.name || "Company Name Unavailable"}
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
              {company?.email}
            </p>
          </div>
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#005f73] mb-4">
              About Us
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {company?.CompanyAbout?.about ? (
                company.CompanyAbout.about
              ) : (
                <span className="italic text-gray-500">
                  No description provided.
                </span>
              )}
            </p>
          </div>

          {(company.address || company.phone) && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#005f73] mb-4">
                Contact Information
              </h2>
              <div className="space-y-2 text-gray-700">
                {company.address && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {company.address}
                  </p>
                )}
                {company.phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {company.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
