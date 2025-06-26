import axios from "axios";
import { authService } from "./authService";
import { logoutSuccess } from "../redux/authSlice";

export const fetchUserData = async (token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/auth/dashboard/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Kullanıcı dashboard verileri alınırken hata oluştu:", error);
  }
};

export const fetchCvs = async (token) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/cv/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "CV verileri alınamadı:",
      error.response?.data || error.message
    );
  }
};

export const deleteCv = async (cvId, token) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/cv/${cvId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting CV ${cvId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to delete CV");
  }
};

export const fetchCvDetailsById = async (cvId, token) => {
  if (!cvId) {
    throw new Error("CV ID is required.");
  }
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/cv/${cvId}/details`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Fetched CV Details:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `CV detayları alınamadı (ID: ${cvId}):`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch CV details."
    );
  }
};

export const updateCompanyAbout = async (aboutText, token) => {
  if (!token) {
    throw new Error("Yetkilendirme token'ı bulunamadı.");
  }

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_BASE_URL}/auth/profile/about`,
      { about: aboutText }, // Request body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Profil güncellenemedi.");
    }
  } catch (error) {
    console.error(
      "updateCompanyAbout Service Hatası:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Sunucu ile iletişim kurulamadı."
    );
  }
};

export const getPublicCompany = async (companyId, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_BASE_URL}/auth/company/${companyId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("getpubliccompany", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching company profile for ID ${companyId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch company profile");
  }
};

export const handleLogout = async (dispatch, navigate) => {
  await authService.logout();
  dispatch(logoutSuccess());
  navigate("/login");
};

// export const updateProfile = async (token, userData) => {
//   try {
//     const response = axios.get(
//       "/auth/profile",
//       userData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     console.log("Profile update response:", response.data);
//     return response.data;

//   } catch (error) {
//     console.error('Error updating user profile:', error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
//   }
// };
