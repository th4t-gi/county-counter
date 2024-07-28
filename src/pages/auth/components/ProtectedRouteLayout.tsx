import React, { FC } from "react";
import { /*useNavigate,*/ Outlet, useLocation, Navigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { useSigninCheck, useUser } from "reactfire";
import CountyLoader from "../../../components/CountyLoader";
import { Box } from "@mui/joy";

interface ProtectedRouteLayoutProps { }

const ProtectedRouteLayout: FC<ProtectedRouteLayoutProps> = (props) => {
    // const navigate = useNavigate();
    const { data: user, status } = useUser()
    const location = useLocation();

    if (status == 'loading') {
        return (
            <Box height='100vh'>
                <CountyLoader/>
            </Box>)
    } 
    
    return user? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}
export default ProtectedRouteLayout;