import React, { FC, ReactNode, useEffect, useState } from "react";
import { Route, useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import { auth } from "../../../firebase";

interface ProtectedRouteLayoutProps { }

const ProtectedRouteLayout: FC<ProtectedRouteLayoutProps> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    return auth.currentUser ? (<Outlet />) : (<Navigate to="/login" state={{ from: location }} replace />)
}
export default ProtectedRouteLayout;