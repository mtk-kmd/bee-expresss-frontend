import { useAuth } from "@/context/AuthContext";
import CustomerPackageDashboard from "@/components/user/customer_package_dashboard";
import CourierDashboard from "@/components/courier/dashboard";

export default function Dashboard() {
    const { getUserDetails } = useAuth();
    const user = getUserDetails();

    return (
        <>
            {user?.role === "USER" && <CustomerPackageDashboard />}
            {user?.role === "COURIER" && <CourierDashboard />}
        </>
    );
}
