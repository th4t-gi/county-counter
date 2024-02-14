import React, { FC, ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Route, useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import { auth } from "../../utils/firebase";

interface ProtectedRouteLayoutProps { }

const ProtectedRouteLayout: FC<ProtectedRouteLayoutProps> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    return auth.currentUser ? (<Outlet />) : (<Navigate to="/login" state={{ from: location }} replace />)
}
export default ProtectedRouteLayout;