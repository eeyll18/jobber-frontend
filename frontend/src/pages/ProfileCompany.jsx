import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "../components/common/Loading";
import CompanyNavbar from "../components/layouts/CompanyNavbar";
import useCompanyData from "../components/hooks/useCompanyData";
import Footer from "../components/layouts/Footer";
import { updateCompanyAbout } from "../services/userService";

function CompanyProfile() {
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.auth.user);
  // console.log("Profile'deki kullanıcı bilgisi:", user);
  const { companyData, loading } = useCompanyData(token);
  console.log("Raw companyData from hook:", companyData);
  console.log("CompanyAbout:", companyData?.company?.CompanyAbout);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [about, setAbout] = useState("");
  const [newAbout, setNewAbout] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (companyData?.company?.CompanyAbout) {
      setAbout(companyData.company.CompanyAbout.about || "");
    } else if (companyData?.company && !companyData.company.CompanyAbout) {
      setAbout("");
    } else {
      setAbout("");
    }
  }, [companyData]);

  const handleOpenModal = () => {
    setNewAbout(about);
    setShowModal(true);
  };

  const handleAboutSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await updateCompanyAbout(newAbout, token);
      console.log(
        "Hakkında bilgisi başarıyla güncellendi (via service):",
        result
      );

      setAbout(newAbout);
      setShowModal(false);
    } catch (error) {
      console.error(
        "Hakkında bilgisi güncellenirken hata (Component):",
        error.message
      );
      console.log(`Bir hata oluştu: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleSidebar = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };

  if (loading && !companyData) {
    <div className="min-h-screen flex flex-col">
      <CompanyNavbar toggleSidebar={toggleSidebar} />
      <main className="flex-1 flex items-center justify-center">
        <Loading />
      </main>
      <Footer />
    </div>;
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <CompanyNavbar toggleSidebar={toggleSidebar} />
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
              {capitalizeName(user?.name || user?.username || "Your Company")}
            </h1>
            <p className="text-lg sm:text-xl font-light">
              Publish your job postings, <br className="hidden sm:block" />
              discover talented candidates, and grow together.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="border-t pt-6 md:border-t-0 md:pt-0 relative pb-10">
              {" "}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-2xl font-semibold text-[#005f73]">
                  About Us
                </h2>
              </div>
              {about ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {about}
                </p>
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  No information provided yet. Use the button above to add
                  details about your company.
                </p>
              )}
              <button
                onClick={handleOpenModal}
                className="absolute -bottom-3 -right-3 bg-[#005f73] text-white text-sm font-medium py-1 px-3 rounded-md shadow hover:bg-gray-100 hover:text-[#005f73] transition duration-200"
              >
                {about ? "Edit" : "Add"}
              </button>
            </div>
            <div className="border-t pt-6 mt-8 relative">
              <h2 className="text-2xl font-semibold text-[#005f73] mb-4">
                Contact Information
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium mr-1">E-mail:</span>
                  {companyData?.company?.email || "Not specified"}
                </p>
                <p>
                  <span className="font-medium mr-1">Phone:</span>
                  {companyData?.company?.phone || "Not specified"}
                </p>
                {/* <button className="absolute -bottom-3 -right-3 bg-[#005f73] text-[#ffffff] text-sm font-medium py-1 px-3 rounded-md shadow hover:bg-white hover:text-[#005f73] transition duration-200">
                  Settings
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showModal && (
        <div className="fixed inset-0  bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <h3 className="text-xl font-semibold text-[#00768e] mb-4">
              Update Company Information
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
              aria-label="Close"
              disabled={isSubmitting}
            >
              ×
            </button>
            <textarea
              value={newAbout}
              onChange={(e) => setNewAbout(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-[#00768e] focus:border-transparent text-gray-700" // Added focus styles
              placeholder="Tell potential candidates about your company culture, mission, and values..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAboutSubmit}
                className={`px-4 py-2 rounded-md bg-[#00768e] text-white hover:bg-[#005f73] transition duration-200 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyProfile;
