import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getApi, putApi } from "@/utils/api_helper";

export default function UserDashboard() {
    const { authToken, getUserDetails } = useAuth();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [user, setUser] = useState(null);
    const { loading } = useAuthGuard();
    const [profileForm, setProfileForm] = useState({
        user_id: '',
        name: '',
        email: '',
        phone_number: '',
        address: '',
        username: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        const user = getUserDetails();
        setUser(user);
        if (user) {
            getUserProfile();
        }
    }, [authToken]);

    const getUserProfile = async () => {
        try {
            const userDetails = getUserDetails();
            if (!userDetails) return;

            const response = await getApi('getUsers?user_id=' + userDetails.id, authToken);
            if (response.status === 200) {
                setUserProfile(response.data.result);
                setProfileForm({
                    user_id: response.data.result.id ,
                    name: response.data.result.full_name || '',
                    email: response.data.result.email || '',
                    phone_number: response.data.result.phone_number || '',
                    address: response.data.result.address || '',
                    username: response.data.result.user_name || '',
                    role: response.data.result.role,
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await putApi('updateUser', authToken, profileForm);
            if (response.status === 200) {
                alert('Profile updated successfully!');
                getUserProfile();
                setShowProfileModal(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <DashboardLayout title="User Dashboard">
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">User Profile</h5>
                                    <button
                                        className="btn btn-light btn-sm"
                                        onClick={() => setShowProfileModal(true)}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>User Name:</strong> {userProfile?.user_name}</p>
                                        <p><strong>Full Name:</strong> {userProfile?.full_name}</p>
                                        <p><strong>Email:</strong> {userProfile?.email}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Phone Number:</strong> {userProfile?.phone_number}</p>
                                        <p><strong>Address:</strong> {userProfile?.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Edit Modal */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="mb-3">
                            <label className="form-label">User Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                value={profileForm.username}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={profileForm.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={profileForm.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                name="phone_number"
                                value={profileForm.phone_number}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-control"
                                name="address"
                                value={profileForm.address}
                                onChange={handleInputChange}
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="d-grid">
                            <Button type="submit" variant="primary">
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
}
