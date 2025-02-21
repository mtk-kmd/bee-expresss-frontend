import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getPublicApi } from "@/utils/api_helper";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Chart() {
    const { authToken, logout, getUserDetails } = useAuth();
    const { loading } = useAuthGuard();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalPackages: 0,
        pendingDeliveries: 0,
        completedDeliveries: 0
    });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, [authToken]);

    const fetchDashboardData = async () => {
        try {
            const userDetails = getUserDetails();
            if (!userDetails) return;

            const [packagesResponse, deliveryResponse] = await Promise.all([
                userDetails.role === "USER" ? getPublicApi('getPackages?user_id=' + userDetails.id) : getPublicApi('getPackages?courier_id=' + userDetails.id),
                userDetails.role === "USER" ? getPublicApi('getDelivery?user_id=' + userDetails.id) : getPublicApi('getDelivery?courier_id=' + userDetails.id)
            ]);

            const packages = packagesResponse.data.result;
            const deliveries = deliveryResponse.data.result;

            // Calculate statistics
            const totalPackages = packages.length;
            const totalOrders = deliveries.length;
            const pendingDeliveries = deliveries.filter(d => d.delivery_status_log[0].status < 5).length;
            const completedDeliveries = deliveries.filter(d => d.delivery_status_log[0].status === 5).length;

            setStats({
                totalOrders,
                totalPackages,
                pendingDeliveries,
                completedDeliveries
            });

            // Prepare chart data
            const last7Days = [...Array(7)].map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse();

            const deliveriesPerDay = last7Days.map(date => {
                return deliveries.filter(d =>
                    d.createdAt.split('T')[0] === date
                ).length;
            });

            setChartData({
                labels: last7Days,
                datasets: [{
                    label: 'Deliveries',
                    data: deliveriesPerDay,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <DashboardLayout title="Dashboard">
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h5 className="card-title">Total Orders</h5>
                                <h2 className="card-text">{stats.totalOrders}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h5 className="card-title">Total Packages</h5>
                                <h2 className="card-text">{stats.totalPackages}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-white">
                            <div className="card-body">
                                <h5 className="card-title">Pending Deliveries</h5>
                                <h2 className="card-text">{stats.pendingDeliveries}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h5 className="card-title">Completed Deliveries</h5>
                                <h2 className="card-text">{stats.completedDeliveries}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Delivery Trends (Last 7 Days)</h5>
                            </div>
                            <div className="card-body">
                                <Line data={chartData} options={{
                                    responsive: true,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
