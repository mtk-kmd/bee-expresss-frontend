import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Modal, Button } from "react-bootstrap";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getPublicApi,postApi } from "@/utils/api_helper";
import moment from "moment";
import Image from "next/image";
import { DELIVERY_STATUS, DELIVERY_STATUS_BADGES, LOCALES} from "@/utils/locales";

export default function CustomerPackageDashboard() {
    const { authToken, logout, getUserDetails } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showViewDeliveryStatusModal, setShowViewDeliveryStatusModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [packages, setPackages] = useState([]);
    const { loading } = useAuthGuard();
    const [createdPackageId, setCreatedPackageId] = useState(null);
    const [formData, setFormData] = useState({
        package_type_id: 1,
        description: "",
        weight: 0,
        length: 0,
        height: 0,
        width: 0,
        sender_name: "",
        receiver_name: "",
        sender_number: "",
        receiver_number: "",
        pickup_address: "",
        delivery_address: ""
    });
    const STATUS_MAP = {
        1: DELIVERY_STATUS?.PROCESSING,
        2: DELIVERY_STATUS?.ORDER_RECEIVED,
        3: DELIVERY_STATUS?.ITEM_PICKED_UP,
        4: DELIVERY_STATUS?.OUT_FOR_DELIVERY,
        5: DELIVERY_STATUS?.DELIVERED,
        6: DELIVERY_STATUS?.CANCELLED
    };

    useEffect(() => {
        getPackages();
    }, [authToken]);

    const getPackages = async () => {
        try {
            const userDetails = getUserDetails();
            if (!userDetails) return;

            const [packagesResponse, deliveryStatusResponse, stripeResponse] = await Promise.all([
                getPublicApi("getPackages?user_id=" + userDetails.id),
                getPublicApi("getDelivery"),
                fetch("/api/stripe/sessions")
            ]);

            const stripeData = await stripeResponse.json();
            const deliveryStatusData = await deliveryStatusResponse.data.result;
            const packageData = packagesResponse.data.result;

            const paymentIntentIds = stripeData.data
                .filter(session => session.payment_intent)
                .map(session => session.payment_intent);

            const paymentIntentPromises = paymentIntentIds.map(id =>
                fetch(`/api/stripe/payment-intent?payment_intent_id=${id}`).then(res => res.json())
            );

            const paymentIntentResponses = await Promise.all(paymentIntentPromises);

            // Combine package data with stripe session data and paymentIntentData
            const combinedPackages = packageData.map(pkg => {
                const stripeSession = stripeData.data?.find(
                    session => session.client_reference_id === pkg.package_id.toString()
                );

                const paymentIntent = paymentIntentResponses.find(
                    payment => payment.id === stripeSession?.payment_intent
                );

                const deliveryStatus = deliveryStatusData.find(
                    status => status.package[0].package_id === pkg.package_id
                );

                return {
                    ...pkg,
                    delivery_status: deliveryStatus,
                    stripe_session_id: stripeSession?.id || "Not paid",
                    payment_intent_id: stripeSession?.payment_intent || null,
                    payment_status: paymentIntent?.status || "Not processed",
                    payment_amount: paymentIntent?.amount ? paymentIntent.amount / 100 : null,
                    payment_method_type: paymentIntent?.payment_method_types[0] || null
                };
            });

            console.log(combinedPackages);

            setPackages(combinedPackages);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleCourierService = () => {
        setCurrentStep(1);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleViewPackage = (packageData) => {
        setSelectedPackage(packageData);
        setShowViewModal(true);
    };

    const handleViewDeliveryStatus = (packageData) => {
        setSelectedPackage(packageData);
        setShowViewDeliveryStatusModal(true);
    };

    const handleCloseViewModal = () => {
        setSelectedPackage(null);
        setShowViewModal(false);
    };

    const handleCloseViewDeliveryStatusModal = () => {
        setSelectedPackage(null);
        setShowViewDeliveryStatusModal(false);
    };

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        const submitData = {
            ...formData,
            user_id: getUserDetails().id,
            sender_number: parseInt(formData.sender_number),
            receiver_number: parseInt(formData.receiver_number),
            package_type_id: parseInt(formData.package_type_id),
            weight: parseFloat(formData.weight),
            length: parseFloat(formData.length),
            height: parseFloat(formData.height),
            width: parseFloat(formData.width),
        };

        const response = await postApi("createPackage", authToken, submitData);

        if (response.status === 200) {
            setCreatedPackageId(response.data.result.package.package_id); // Save the package ID
            handleNext();
        }
    };

    return (
        <DashboardLayout title="Package">
            <div className="container-fluid">
                <div className="d-flex flex-row-reverse">
                    <div></div>
                    <div>
                        <button onClick={handleCourierService} className="btn btn-warning mb-3">Apply for Courier Service</button>
                    </div>
                </div>
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Package Information</h5>
                            <button onClick={handleLogout} className="btn btn-light btn-sm">Logout</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Package ID</th>
                                        <th>Package Type</th>
                                        <th>Date Created</th>
                                        <th>Payment Status</th>
                                        <th>Amount</th>
                                        <th>Payment Method</th>
                                        <th>Delivery Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(packages) && packages.length > 0 ? (
                                        packages.map((p) => (
                                            <tr key={p.package_id}>
                                                <td>{p.package_id}</td>
                                                <td>{p.package_type.package_type_name}</td>
                                                <td>{moment(p.createdAt).format("YYYY-MM-DD, h:mm a")}</td>
                                                <td>
                                                    {p.stripe_session_id === "Not paid" ? (
                                                        <span className="badge bg-warning">Not Paid</span>
                                                    ) : (
                                                        <span className="badge bg-success">Paid</span>
                                                    )}
                                                </td>
                                                <td>{p.payment_amount ? `$${p.payment_amount}` : "-"}</td>
                                                <td>{p.payment_method_type}</td>
                                                <td>
                                                    {!p.delivery ? (
                                                        <span className="badge bg-secondary">Not yet processed</span>
                                                    ) : (
                                                        <span
                                                            className={`badge ${DELIVERY_STATUS_BADGES[STATUS_MAP[p.delivery_status?.delivery_status_log[0].status]]}`}
                                                        >
                                                            {STATUS_MAP[p.delivery_status?.delivery_status_log[0].status]}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary me-2"
                                                        onClick={() => handleViewPackage(p)}
                                                    >
                                                        {LOCALES.VIEW_PACKAGE}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-info me-2"
                                                        onClick={() => handleViewDeliveryStatus(p)}
                                                    >
                                                        {LOCALES.VIEW_DELIVERY_STATUS}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center">No packages found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for New Package */}
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
                                <input
                                    type="text"
                                    className="form-control"
                                    name="sender_name"
                                    value={formData.sender_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Sender Contact Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    pattern="[0-9]{2}[0-9]{9}"
                                    placeholder="09xxxxxxxxx"
                                    maxLength="11"
                                    name="sender_number"
                                    value={formData.sender_number}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Receiver Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="receiver_name"
                                    value={formData.receiver_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Receiver Contact Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    pattern="[0-9]{2}[0-9]{9}"
                                    placeholder="09xxxxxxxxx"
                                    maxLength="11"
                                    name="receiver_number"
                                    value={formData.receiver_number}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Pickup Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="pickup_address"
                                    value={formData.pickup_address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Delivery Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="delivery_address"
                                    value={formData.delivery_address}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </form>
                    ) : currentStep === 2 ? (
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Package Weight (kg)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Package Type</label>
                                <select
                                    name="package_type_id"
                                    className="form-select"
                                    value={formData.package_type_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="1">Document</option>
                                    <option value="2">Parcel</option>
                                    <option value="3">Other</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Package Dimensions</label>
                                <div className="row">
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="height"
                                            value={formData.height}
                                            placeholder="Height"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="width"
                                            value={formData.width}
                                            placeholder="Width"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="length"
                                            value={formData.length}
                                            placeholder="Length"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Package Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <stripe-pricing-table
                                pricing-table-id="prctbl_1Qo7qNJDHoTbxcrY2Jw0dFxF"
                                publishable-key="pk_test_51Odu8fJDHoTbxcrYBHy80TQ18t8SIYbz6rd1GbKfIoZRwPlU5Ye7d4BKitWEw3RnDFiiYzJj5bZnBCOPTDZYB5Sx0003yVorjX"
                                client-reference-id={createdPackageId}
                                success-url={`${window.location.origin}/dashboard`}
                                cancel-url={`${window.location.origin}/dashboard`}
                            >
                            </stripe-pricing-table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    {currentStep > 1 && currentStep < 2 && (
                        <Button variant="secondary" onClick={handlePrevious}>
                            Previous
                        </Button>
                    )}
                    {currentStep === 1 ? (
                        <Button variant="primary" onClick={handleNext}>
                            Next
                        </Button>
                    ) : currentStep === 2 ? (
                        <Button variant="primary" onClick={handleSubmit}>
                            Submit Request
                        </Button>
                    ) : currentStep > 1 && currentStep < 2 && (
                        <Button variant="primary" onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Modal for Package Information */}
            <Modal show={showViewModal} onHide={handleCloseViewModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Package Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPackage && (
                        <div className="package-details">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <h6 className="text-muted">Package ID</h6>
                                    <p className="fw-bold">{selectedPackage.package_id}</p>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted">Package Type</h6>
                                    <p className="fw-bold">{selectedPackage.package_type.package_type_name}</p>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <h6 className="text-muted">Weight</h6>
                                    <p className="fw-bold">{selectedPackage.weight} kg</p>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted">Created Date</h6>
                                    <p className="fw-bold">{moment(selectedPackage.createdAt).format("YYYY-MM-DD, h:mm a")}</p>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <h6 className="text-muted">Dimensions</h6>
                                <p className="fw-bold">
                                    {selectedPackage.height} × {selectedPackage.width} × {selectedPackage.length} cm
                                </p>
                            </div>
                            {selectedPackage.description && (
                                <div className="row mb-3">
                                    <h6 className="text-muted">Description</h6>
                                    <p className="fw-bold">{selectedPackage.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseViewModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Delivery Information */}
            <Modal show={showViewDeliveryStatusModal} onHide={handleCloseViewDeliveryStatusModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Package Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPackage && (
                        <div className="package-details">
                            <div className="tracking-header mb-4">
                                <h6>Your shipment</h6>
                                <h5 className="fw-bold">#{selectedPackage.package_id}</h5>
                                <div className="estimated-delivery">
                                    <h6 className="text-muted">Estimated delivery</h6>
                                    <h5 className="text-success">Today, {moment().format('MMMM DD')} between 1:45 P.M. - 4:45 P.M.</h5>
                                </div>
                            </div>

                            <div className="tracking-timeline mb-4">
                                <div className="timeline-container">
                                    <div className={
                                        `timeline-item ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 1
                                            ? 'active'
                                            : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 1 && 'completed'
                                        }`}
                                    >
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <span className={`badge ${
                                                !selectedPackage.delivery_status
                                                    ? 'bg-secondary'
                                                    : selectedPackage.delivery_status?.delivery_status_log[0]?.status === 1
                                                    ? 'bg-primary'
                                                    : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 1
                                                    ? 'bg-success'
                                                    : 'bg-secondary'
                                            }`}>
                                                {DELIVERY_STATUS?.PROCESSING}
                                            </span><br/>
                                            <small className="text-muted">
                                                {moment(selectedPackage.createdAt).format("MM/DD/YYYY, h:mm A")}
                                            </small>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            `timeline-item ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 2
                                                ? 'active'
                                                : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 2 && 'completed'}
                                            `}
                                    >
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <span className={
                                                    `badge ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 2
                                                    ? 'bg-primary'
                                                    : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 2 ? 'bg-success' : 'bg-secondary'
                                                }`}
                                            >
                                                {DELIVERY_STATUS?.ORDER_RECEIVED}
                                            </span><br/>
                                            <small className="text-muted">
                                                {selectedPackage.sender_info[0]?.address}
                                            </small>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            `timeline-item ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 3
                                                ? 'active'
                                                : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 3 && 'completed'}
                                            `}
                                    >
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <span className={
                                                    `badge ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 3
                                                    ? 'bg-primary'
                                                    : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 3 ? 'bg-success' : 'bg-secondary'
                                                }`}
                                            >
                                                {DELIVERY_STATUS?.ITEM_PICKED_UP}
                                            </span><br/>
                                            <small className="text-muted">
                                                {selectedPackage.sender_info[0]?.address}
                                            </small>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            `timeline-item ${selectedPackage.delivery_status?.delivery_status_log[0]?.status < 6
                                                && selectedPackage.delivery_status?.delivery_status_log[0]?.status > 4
                                                ? 'completed' : ''}
                                            `}
                                    >
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <span className={
                                                    `badge ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 4
                                                    ? 'bg-primary'
                                                    : selectedPackage.delivery_status?.delivery_status_log[0]?.status > 4 ? 'bg-success' : 'bg-secondary'
                                                }`}
                                            >
                                                {DELIVERY_STATUS?.OUT_FOR_DELIVERY}
                                            </span><br/>
                                            <small className="text-muted">
                                                {selectedPackage.receiver_info[0]?.address}
                                            </small>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            `timeline-item ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 5
                                                && selectedPackage.delivery_status?.delivery_status_log[0]?.status === 5
                                                ? 'completed' : ''}
                                            `}
                                    >
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <span className={
                                                    `badge ${selectedPackage.delivery_status?.delivery_status_log[0]?.status === 5 ? 'bg-success' : 'bg-secondary'
                                                }`}
                                            >
                                                {DELIVERY_STATUS?.DELIVERED}
                                            </span><br/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Existing package details */}
                            <div className="additional-details mt-4">
                                {/* ... your existing package details ... */}
                            </div>

                            <img
                                src={selectedPackage.delivery.tracking.photo_url}
                                alt="Package Preview"
                                style={{
                                    maxWidth: '200px',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseViewDeliveryStatusModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .tracking-timeline {
                    padding: 20px 0;
                }

                .timeline-container {
                    position: relative;
                    padding-left: 50px;
                }

                .timeline-container::before {
                    content: '';
                    position: absolute;
                    left: 20px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #e0e0e0;
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 30px;
                }

                .timeline-marker {
                    position: absolute;
                    left: -50px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #e0e0e0;
                    border: 3px solid #fff;
                    box-shadow: 0 0 0 2px #e0e0e0;
                }

                .timeline-item.completed .timeline-marker {
                    background: #28a745;
                    box-shadow: 0 0 0 2px #28a745;
                }

                .timeline-item.active .timeline-marker {
                    background: #007bff;
                    box-shadow: 0 0 0 2px #007bff;
                }

                .timeline-content {
                    padding-left: 20px;
                }

                .estimated-delivery {
                    border-left: 4px solid #28a745;
                    padding-left: 15px;
                    margin: 15px 0;
                }
            `}</style>
        </DashboardLayout>
    );
};
