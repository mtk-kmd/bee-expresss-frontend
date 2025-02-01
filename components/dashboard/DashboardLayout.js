import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Head from "next/head";

export default function DashboardLayout({ children, title = "Dashboard" }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <>
            <Head>
                <title>{{ title }} | Bee Express</title>
                <meta name="description" content="Bee Express Admin Dashboard" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="dashboard-layout">
                <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

                <div className="main-content">
                    <Navbar toggleSidebar={toggleSidebar} />
                    <div className="page-content">{children}</div>
                </div>
            </div>

            <style jsx>{`
        .dashboard-layout {
          display: flex;
          height: 100vh;
        }

        .main-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .page-content {
          flex-grow: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        #sidebar {
          height: 100vh;
          width: 250px;
          background-color: #f8f9fa;
          transition: all 0.3s;
        }

        #sidebar.collapsed {
          width: 80px;
        }

        #sidebar.collapsed .nav-link span {
          display: none;
        }
      `}</style>
        </>
    );
}
