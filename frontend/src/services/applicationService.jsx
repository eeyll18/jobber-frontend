import axios from "axios";

export const applyForJob = async (cvId, userId, jobId, token) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_BASE_URL}/application`,
      { cvId, userId, jobId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying for job:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Başvuru sırasında bir hata oluştu.",
    };
  }
};

export const fetchApplicant = async (jobId, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/application/job/${jobId}/applicants`, // `:jobId` yerine `${jobId}` koy!
      // {jobId},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching applicants", error);
  }
};

export const fetchApplicationsByUser = async (userId, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/application/job/user/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    console.error("Error fetching applications by user", error);
    if (
      error.response &&
      error.response.status === 404 &&
      error.response.data?.message === "No applications found for this user"
    ) {
      console.log(
        "Service: Handled 404 'No applications found'. Returning empty array."
      );
      return { data: [] };
    } else {
      console.log("Service: Re-throwing error for component to handle.");
      throw error;
    }
  }
};

export const sendSingleApplicationEmail = async (
  applicationId,
  type,
  token
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BASE_URL}/application/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, type }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data; // Başarılı yanıtı döndür
  } catch (error) {
    console.error(
      `Error sending ${type} email for application ${applicationId}:`,
      error
    );
    throw error;
  }
};

export const sendBulkApplicationEmail = async (applicantsData, type, token) => {
  // Basic validation
  if (!Array.isArray(applicantsData) || applicantsData.length === 0) {
    throw new Error("Applicant data must be a non-empty array.");
  }
  if (type !== "accept" && type !== "reject") {
    throw new Error("Invalid email type specified.");
  }

  console.log("Sending bulk email request with data:", {
    applicants: applicantsData,
    type,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BASE_URL}/application/send-bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicants: applicantsData, type }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Bulk email API error response:", data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    console.log("Bulk email API success response:", data);
    return data;
  } catch (error) {
    console.error(`Error sending bulk ${type} emails:`, error);
    throw error;
  }
};

export const fetchUserProfile = async (userId, token) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BASE_URL}/auth/${userId}/profile`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    throw error;
  }
};
