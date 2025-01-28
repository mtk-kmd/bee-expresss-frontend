import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function Navbar({ toggleSidebar }) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <div className="container-fluid">
                <button
                    className="btn btn-link"
                    onClick={toggleSidebar}
                >
                    <i className="bi bi-list"></i>
                </button>
                <div className="ms-auto">
                    <div className="dropdown">
                        <button className="btn btn-link dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                            <i className="bi bi-person-circle"></i>
              Admin
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#">Profile</a></li>
                            <li><a className="dropdown-item" href="#">Settings</a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}
