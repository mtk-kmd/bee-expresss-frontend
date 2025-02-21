import { useState } from "react";
import Link from "next/link";

export default function Sidebar({ isCollapsed, toggleSidebar }) {
    return (
        <div className={`bg-dark text-white ${isCollapsed ? "collapsed" : ""}`} id="sidebar">
            <div className="p-3">
                <h3 className="text-center">Bee Express</h3>
                <hr />
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link href="/dashboard" className="nav-link text-white active">
                            <i className="bi bi-speedometer2 me-2"></i>
                            {!isCollapsed && <span>Dashboard</span>}
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/package" className="nav-link text-white active">
                            <i className="bi bi-speedometer2 me-2"></i>
                            {!isCollapsed && <span>Packages</span>}
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/chat" className="nav-link text-white active">
                            <i className="bi bi-speedometer2 me-2"></i>
                            {!isCollapsed && <span>Chat</span>}
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/user" className="nav-link text-white">
                            <i className="bi bi-people me-2"></i>
                            {!isCollapsed && <span>User Management</span>}
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/dashboard/settings" className="nav-link text-white">
                            <i className="bi bi-gear me-2"></i>
                            {!isCollapsed && <span>Settings</span>}
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
