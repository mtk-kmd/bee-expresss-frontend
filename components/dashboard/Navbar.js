import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { getApi } from "@/utils/api_helper";

export default function NavbarComponent({ toggleSidebar }) {
    const { authToken, getUserDetails, logout } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const getUnreadNotificationfromRocketChat = async () => {
        try {
            const response = await getApi("getUnReadMessages", authToken);

            console.log(response);
            if (response.status === 200) {
                setNotificationCount(response.data?.unreadMessages?.length);
                setNotifications(response.data?.unreadMessages || []);
            } else {
                console.error('Error fetching unread notifications:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    }

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    useEffect(() => {
        const user = getUserDetails();
        setUser(user);
        if (user) {
            getUnreadNotificationfromRocketChat();
        }
    }, [authToken]);

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                        <NavDropdown
                                align="end"
                                title={
                                    <div className="position-relative d-inline-block">
                                        <FontAwesomeIcon
                                            icon={faBell}
                                            className="fs-5"
                                            style={{ color: "black" }}
                                        />
                                        {notificationCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                                {notificationCount}
                                            </span>
                                        )}
                                    </div>
                                }
                            >
                                <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {notifications.length > 0 ? (
                                        notifications.map((notification, index) => (
                                            <>
                                                <NavDropdown.Item
                                                    key={index}
                                                    onClick={() => router.push("/chat")}
                                                >
                                                    <div className="d-flex flex-column">
                                                        {
                                                            notification.type === "d" ? (
                                                                <>
                                                                    <small className="text-muted">
                                                                        {notification.unreadCount} unread message
                                                                    </small>
                                                                    <span className="text-truncate">
                                                                        from {notification.roomName}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <small className="text-muted">
                                                                        {notification.unreadCount} unread message
                                                                    </small>
                                                                    <span className="text-truncate">
                                                                        from {notification.roomName} channel
                                                                    </span>
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </NavDropdown.Item>
                                                <NavDropdown.Divider />
                                            </>
                                        ))
                                    ) : (
                                        <NavDropdown.Item disabled>
                                            No new notifications
                                        </NavDropdown.Item>
                                    )}
                                </div>
                            </NavDropdown>
                            <NavDropdown title={user?.username} id="basic-nav-dropdown">
                                <NavDropdown.Item>
                                    <Link href="/user">
                                        Profile
                                    </Link>
                                </NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">
                                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
