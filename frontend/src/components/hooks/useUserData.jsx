import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchCvs, fetchUserData } from "../../services/userService";

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [cvs, setCvs] = useState([]);
  const token = localStorage.getItem("token");
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAuthenticated) {
          const userDataResponse = await fetchUserData(token);
          setUserData(userDataResponse);

          const cvResponse = await fetchCvs(token);
          setCvs(cvResponse);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [token, isAuthenticated]);

  return { userData, cvs };
}
