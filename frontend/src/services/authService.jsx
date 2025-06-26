import axios from "axios";
import { loginSuccess, logoutSuccess } from "../redux/authSlice";
import { store } from "../store/store";

export const authService = {
  async login(userData) {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_BASE_URL}/auth/login`,
      userData
    );
    console.log("BASE_URL:", import.meta.env.VITE_APP_BASE_URL);
    localStorage.setItem("token", response.data.token);
    store.dispatch(loginSuccess(response.data));
    return response.data;
  },
  async logout() {
    localStorage.removeItem("token");
    store.dispatch(logoutSuccess());
  },
  async fetchUser() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("token bulunmadi");
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Gelen veriyi Redux'a kaydetmeden önce dönüştür
      const userData = {
        ...response.data,
        name: response.data.name || response.data.username,
        role: response.data.role, // role'yi al
      };
      // console.log("fetchUser Response:", userData); // bu log sayfa yenilenmeden gelmiyor
      store.dispatch(loginSuccess(userData));
      return response.data;
    } catch (error) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      // Token geçersizse veya hata olursa, logout yap
      localStorage.removeItem("token");
      store.dispatch(logoutSuccess());
      throw error;
    }
  },
};
