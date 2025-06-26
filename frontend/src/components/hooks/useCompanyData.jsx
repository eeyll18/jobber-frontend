import axios from "axios";
import { useEffect, useState } from "react";

const useCompanyData = (token) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/auth/dashboard/company`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompanyData(response.data);
      } catch (error) {
        console.error("Şirket verileri alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { companyData, loading };
};

export default useCompanyData;
