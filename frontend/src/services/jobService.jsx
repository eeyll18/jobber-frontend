import axios from "axios";


export const createJob = async (jobData, token) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_BASE_URL}/job/create`,
      jobData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Job creation error:", error);
    throw error;
  }
};

export const getCompanyJobs = async (token) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/job`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.jobs;
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    throw error;
  }
};

export const getAllJobsForUsers = async (token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/job/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.allJobs;
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    throw error;
  }
};

// TODO:düzenlenebilir
export const updateJob = async (jobId, jobData, token) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_BASE_URL}/job/${jobId}`,
      jobData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

// TODO:düzenlenebilir
export const deleteJob = async (jobId, token) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_BASE_URL}/job/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

export const fetchJobDetails = async (jobId, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/job/${jobId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.job;
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw error;
  }
};
