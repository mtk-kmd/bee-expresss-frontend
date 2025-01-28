import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Dashboard() {
    const { authToken, logout, user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { loading, userDetails } = useAuthGuard();
    if (loading) {
        return <p>Loading...</p>;
    }

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <DashboardLayout title="Dashboard">
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h5 className="card-title">Total Orders</h5>
                            <h2 className="card-text">150</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                    Recent Orders
                        </div>
                        <div className="card-body">
                            <table className="table">
                                {/* ... table content ... */}
                            </table>
                        </div>
                        <h1>Welcome, {userDetails?.username}</h1>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                    Quick Actions
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <button className="btn btn-primary">New Order</button>
                                <button className="btn btn-secondary">Generate Report</button>
                                <button className="btn btn-info">View Statistics</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
