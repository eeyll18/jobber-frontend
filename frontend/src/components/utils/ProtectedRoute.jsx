// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = () => {
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
// };

// export default ProtectedRoute;
// components/ProtectedRoute.js
// import React from 'react';
// import { Route, Navigate, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//     const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
//     const userRole = useSelector((state) => state.auth.role);
//     const location = useLocation();

//     if (!isAuthenticated) {
//       // Kullanıcı oturum açmamışsa login sayfasına yönlendir, ve gideceği sayfayı state olarak yanında taşır.
//       return <Navigate to="/login" state={{ from: location }} />;
//     }

//     if (allowedRoles && !allowedRoles.includes(userRole)) {
//       // Eğer kullanıcının rolü erişim izni verilen roller arasında değilse, yetkisiz erişim sayfası gösterebiliriz
//       return <Navigate to="/unauthorized" />;
//     }

//     return children;
//   };

// export default ProtectedRoute;
// components/utils/ProtectedRoute.js
// components/utils/ProtectedRoute.js
// components/utils/ProtectedRoute.js
//  import React from "react";
//  import { Route, Navigate, useLocation } from "react-router-dom";
//  import { useSelector } from "react-redux";

//  const ProtectedRoute = ({ children, allowedRoles }) => {
//    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
//    const userRole = useSelector((state) => state.auth.role);
//    const location = useLocation();

//    console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
//    console.log("ProtectedRoute - userRole:", userRole);
//    console.log("ProtectedRoute - allowedRoles:", allowedRoles);

//    if (!isAuthenticated) {
//       console.log("ProtectedRoute - yönlendirme /login");
//      return <Navigate to="/login" state={{ from: location }} />;
//    }
//     if (allowedRoles && !allowedRoles.includes(userRole)) {
//        console.log("ProtectedRoute - yönlendirme /unauthorized");
//        return <Navigate to="/unauthorized" />;
//    }
//  console.log("ProtectedRoute - izin verildi");
//    return children;
//  };

//  export default ProtectedRoute;
// components/utils/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userRole = useSelector((state) => state.auth.role);
  const location = useLocation();

  // console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  // console.log("ProtectedRoute - userRole:", JSON.stringify(userRole));
  // console.log("ProtectedRoute - allowedRoles:", JSON.stringify(allowedRoles));

  if (!isAuthenticated || !userRole) {
    // console.log("ProtectedRoute - yönlendirme /login - isAuthenticated false");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // console.log("ProtectedRoute - yönlendirme /unauthorized");
    return <Navigate to="/unauthorized" />;
  }

  // console.log("ProtectedRoute - izin verildi");
  return children;
};

export default ProtectedRoute;
