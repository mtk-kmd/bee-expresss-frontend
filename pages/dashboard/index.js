import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Modal, Button } from "react-bootstrap";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Dashboard() {
    const { authToken, logout, user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const { loading, userDetails } = useAuthGuard();

    if (loading) {
        return <p>Loading...</p>;
    }

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleCourierService = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <DashboardLayout title="Document Approval">
            <div className="container-fluid">
                <div className="d-flex flex-row-reverse">
                    <div></div>
                    <div>
                        <button onClick={handleCourierService} className="btn btn-warning">Apply for Courier Service</button>
                    </div>

                </div>
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Documents Pending Approval</h5>
                            <button onClick={handleLogout} className="btn btn-light btn-sm">Logout</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Sender</th>
                                        <th>Date sent</th>
                                        <th>View by</th>
                                        <th>Transmission number</th>
                                        <th>Document name</th>
                                        <th>Type of File</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>sysadm</td>
                                        <td>12-08-2016</td>
                                        <td>14-08-2016</td>
                                        <td>7e015bb6-d93d-4f72-b2ff-24bceb50b59</td>
                                        <td>Invoice #15400 Eastern Connection 16-Jan-1997</td>
                                        <td>PDF</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary me-2">View</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3">
                            <button className="btn btn-danger me-2">Do not approve</button>
                            <button className="btn btn-primary">Request changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentStep === 1 ? "Customer Information" : "Package Information"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentStep === 1 ? (
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Sender Full Name</label>
                                <input type="text" className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Sender Contact Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    pattern="[0-9]{2}[0-9]{9}"
                                    placeholder="09xxxxxxxxx"
                                    maxLength="11"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Receiver Full Name</label>
                                <input type="text" className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Receiver Contact Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    pattern="[0-9]{2}[0-9]{9}"
                                    placeholder="09xxxxxxxxx"
                                    maxLength="11"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Pickup Location</label>
                                <input type="text" className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Delivery Location</label>
                                <input type="text" className="form-control" />
                            </div>
                        </form>
                    ) : (
                        <form>

                            <div className="mb-3">
                                <label className="form-label">Package Weight (kg)</label>
                                <input type="number" className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Package Type</label>
                                <select className="form-select">
                                    <option value="1">Document</option>
                                    <option value="2">Parcel</option>
                                    <option value="3">Other</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Package Dimensions</label>
                                <div className="row">
                                    <div className="col-md-4">
                                        <input type="number" className="form-control" placeholder="Height" />
                                    </div>
                                    <div className="col-md-4">
                                        <input type="number" className="form-control" placeholder="Width" />
                                    </div>
                                    <div className="col-md-4">
                                        <input type="number" className="form-control" placeholder="Length" />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Package Description</label>
                                <textarea className="form-control" rows="3"></textarea>
                            </div>
                        </form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    {currentStep > 1 && (
                        <Button variant="secondary" onClick={handlePrevious}>
                            Previous
                        </Button>
                    )}
                    {currentStep === 1 ? (
                        <Button variant="primary" onClick={handleNext}>
                            Next
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={handleCloseModal}>
                            Submit Request
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </DashboardLayout>
    );
}
