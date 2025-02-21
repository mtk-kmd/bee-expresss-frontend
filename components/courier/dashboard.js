import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getPublicApi,postApi, putApi } from "@/utils/api_helper";
import moment from "moment";
import { DELIVERY_STATUS, DELIVERY_STATUS_BADGES, LOCALES } from "@/utils/locales";

export default function CourierDashboard() {
    const { authToken, getUserDetails } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [packages, setPackages] = useState([]);
    const { loading } = useAuthGuard();
    const [activeTab, setActiveTab] = useState('new');
    const STATUS_MAP = {
        1: DELIVERY_STATUS.PROCESSING,
        2: DELIVERY_STATUS.ORDER_RECEIVED,
        3: DELIVERY_STATUS.ITEM_PICKED_UP,
        4: DELIVERY_STATUS.OUT_FOR_DELIVERY,
        5: DELIVERY_STATUS.DELIVERED,
        6: DELIVERY_STATUS.CANCELLED
    };
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const filterPackages = (type) => {
        if (type === 'new') {
            return packages.filter(p => !p.delivery_status?.delivery_status_log[0]?.status);
        }
        return packages.filter(p => p.delivery_status?.delivery_status_log[0]?.status && p.delivery_status?.tracking.courier.id === getUserDetails().id);
    };

    const handleShowDeliveryDetails = (packageData) => {
        setSelectedPackage(packageData);
        setShowDeliveryModal(true);
    };

    const handleCloseDeliveryModal = () => {
        setSelectedPackage(null);
        setShowDeliveryModal(false);
    };

    const handleDeliveryStatus = async (packageData, status) => {
        const object = {
            "status_log_id": packageData.delivery_status.delivery_status_log[0].status_log_id,
            "status": parseInt(status),
        }

        let response = null;
        let stripeResponse = null;

        if (status === 0) {
            const stripeObject = {
                "amount": ((packageData.stripe_data.line_items.data[0].amount_total * 0.3) / 100).toFixed(2) * 100,
                "currency": "usd",
                "userId": packageData.delivery.tracking.courier.stripe_acc_id,
            }

            stripeResponse = await postApi('createStripePayout', authToken, stripeObject);
        }


        response = await putApi('updateDeliveryStatus', authToken, object);

        if (response.status === 200) {
            handleRocketChatDMMessage(
                packageData.user?.user_name,
                `Your package with tracking ID ${packageData.delivery.tracking.tracking_id} has been ${STATUS_MAP[status]}`
            );
        }

        await getPackages();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heif'];

        if (file && allowedTypes.includes(file.type)) {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('userId', getUserDetails().id);
            formData.append('packageId', selectedPackage.package_id);
            formData.append('trackingId', selectedPackage.delivery?.tracking?.tracking_id);

            setSelectedFile(formData);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file (PNG, JPG, JPEG, or HEIF)');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const response = await postApi('upload', authToken, selectedFile, true);

            if (response.status === 200) {
                response.data.fileUrl

                await handleRocketChatDMMessage(
                    selectedPackage.user?.user_name,
                    `Your package with tracking ID got delivered! and here is the drop-off photo: ${response.data.fileUrl}`
                );
                alert('Photo uploaded successfully!');
                setSelectedFile(null);
                setPreviewUrl(null);
                handleCloseDeliveryModal();
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload photo');
        }
    };

    const handleRocketChatDMMessage = async (userName, message) => {
        try {
            const response = await postApi('createDM', authToken, {
                targetUsername: userName,
                message: message,
            });

            if (response.status === 200) {
                console.log(response);
            }
        } catch (error) {
            console.error('Error creating DM:', error);
        }
    }

    useEffect(() => {
        getPackages();
    }, [authToken]);

    const getPackages = async () => {
        try {
            const userDetails = getUserDetails();
            if (!userDetails) return;

            const [packagesResponse, deliveryStatusResponse,stripeResponse] = await Promise.all([
                getPublicApi('getPackages'),
                getPublicApi('getDelivery'),
                fetch('/api/stripe/sessions')
            ]);

            const stripeData = await stripeResponse.json();
            const deliveryStatusData = await deliveryStatusResponse.data.result;
            const packageData = packagesResponse.data.result;

            const combinedPackages = packageData.map(pkg => {
                const stripeSession = stripeData.data?.find(
                    session => session.client_reference_id === pkg.package_id.toString()
                );

                const deliveryStatus = deliveryStatusData.find(
                    status => status.package[0].package_id === pkg.package_id
                );

                return {
                    ...pkg,
                    delivery_status: deliveryStatus,
                    stripe_session_id: stripeSession?.id || 'Not paid',
                    stripe_data: {
                        line_items: stripeSession?.line_items || [],
                    },
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

    const handleCourierService = () => {}

    const handleLogout = () => {}

    const handleViewPackage = (packageData) => {
        setSelectedPackage(packageData);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setSelectedPackage(null);
        setShowViewModal(false);
    };

    const handleAcceptDelivery = async (delivery) => {
        const object = {
            "package_id": delivery.package_id,
            "priority": delivery.stripe_data.line_items.data[0].description,
            "user_id": getUserDetails().id
        }
        const response = await postApi('acceptDelivery', authToken, object);

        if (response.status === 200) {
            console.log(response);
        }
    }

    return (
        <DashboardLayout title="Courier Dashboard">
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
                            <div>
                                <h5 className="mb-0">Package Information</h5>
                                <div className="btn-group mt-2">
                                    <button
                                        className={`btn btn-sm ${activeTab === 'new' ? 'btn-light' : 'btn-outline-light'}`}
                                        onClick={() => setActiveTab('new')}
                                    >
                                        New Packages
                                    </button>
                                    <button
                                        className={`btn btn-sm ${activeTab === 'accepted' ? 'btn-light' : 'btn-outline-light'}`}
                                        onClick={() => setActiveTab('accepted')}
                                    >
                                        {LOCALES.ACCEPTED_PACKAGES}
                                    </button>
                                </div>
                            </div>
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
                                        <th>Priority</th>
                                        <th>Pay Out</th>
                                        <th>Delivery Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(packages) && filterPackages(activeTab).length > 0 ? (
                                        filterPackages(activeTab).map((p) => (
                                            <tr key={p.package_id}>
                                                <td>{p.package_id}</td>
                                                <td>{p.package_type.package_type_name}</td>
                                                <td>{moment(p.createdAt).format("YYYY-MM-DD, h:mm a")}</td>
                                                <td>
                                                    {p.stripe_data?.line_items?.data?.[0]?.description ? (
                                                        <span className="badge bg-info">
                                                            {p.stripe_data?.line_items?.data[0]?.description}
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Unknown</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {Object.keys(p.stripe_data?.line_items).length > 0 ? (
                                                        <span className="h4 text-success">
                                                            ${((p.stripe_data?.line_items?.data?.[0]?.amount_total * 0.3) / 100).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Unknown</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {!p.delivery ? (
                                                        <span className="badge bg-secondary">Not yet processed</span>
                                                    ) : (
                                                        <span
                                                            className={`badge ${DELIVERY_STATUS_BADGES[STATUS_MAP[p.delivery_status.delivery_status_log[0].status]]}`}
                                                        >
                                                            {STATUS_MAP[p.delivery_status.delivery_status_log[0].status]}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-row">
                                                        <div>
                                                            <button
                                                                className="btn btn-sm btn-primary me-2"
                                                                onClick={() => handleViewPackage(p)}
                                                            >
                                                                {LOCALES.VIEW_PACKAGE}
                                                            </button>
                                                        </div>
                                                        <div>
                                                            {
                                                                p.stripe_data?.line_items?.data?.[0] && (
                                                                    p.delivery_status?.delivery_status_log[0].status ? (
                                                                        <button
                                                                            className="btn btn-sm btn-warning me-2"
                                                                            onClick={() => handleShowDeliveryDetails(p)}
                                                                        >
                                                                            {LOCALES.VIEW_DELIVERY_STATUS}
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="btn btn-sm btn-success me-2"
                                                                            onClick={() => handleAcceptDelivery(p)}
                                                                        >
                                                                            Accept Delivery
                                                                        </button>
                                                                    )
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                {activeTab === 'new' ? 'No new packages found' : 'No accepted packages found'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
                            <div className="row mb-3">
                                <h6 className="text-muted">Pickup Location</h6>
                                <p className="fw-bold">
                                    {selectedPackage.sender_info[0]?.address
                                        || <span className="badge bg-danger">Address not found</span>
                                    }
                                </p>
                            </div>
                            <div className="row mb-3">
                                <h6 className="text-muted">Delivery Location</h6>
                                <p className="fw-bold">
                                    {selectedPackage.receiver_info[0]?.address
                                        || <span className="badge bg-danger">Address not found</span>
                                    }
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

            <Modal show={showDeliveryModal} onHide={handleCloseDeliveryModal} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Delivery Status Update</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPackage && (
                        <div className="delivery-status-container">
                            <button className="btn btn-link" onClick={() => handleRocketChatDMMessage(selectedPackage.user?.user_name, `Package ID: ${selectedPackage.package_id}`)}>
                                Send Message
                            </button>
                            <div className="package-summary mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Package #{selectedPackage.package_id}</h6>
                                    <span className={`badge ${DELIVERY_STATUS_BADGES[STATUS_MAP[selectedPackage.delivery_status?.delivery_status_log[0]?.status]]}`}>
                                        {STATUS_MAP[selectedPackage.delivery_status?.delivery_status_log[0]?.status]}
                                    </span>
                                </div>
                            </div>

                            <div className="status-actions mb-4">
                                <div className="d-grid gap-3">
                                    {/* {selectedPackage.delivery_status?.delivery_status_log[0]?.status > 5 && ( */}
                                        {selectedPackage.delivery_status?.delivery_status_log[0]?.status < 3 ? (
                                            <button
                                                className="btn btn-outline-primary d-flex justify-content-between align-items-center p-3"
                                                onClick={() => handleDeliveryStatus(selectedPackage, 3)}
                                            >
                                                <div>
                                                    <h6 className="mb-1 text-start">Mark as Picked Up</h6>
                                                    <small className="">Confirm package pickup from sender</small>
                                                </div>
                                                <i className="bi bi-box-arrow-up fs-4"></i>
                                            </button>
                                        ) : selectedPackage.delivery_status?.delivery_status_log[0]?.status < 4 ? (
                                                <button
                                                    className="btn btn-outline-primary d-flex justify-content-between align-items-center p-3"
                                                    onClick={() => handleDeliveryStatus(selectedPackage, 4)}
                                                >
                                                    <div>
                                                        <h6 className="mb-1">Mark as Delivering</h6>
                                                        <small className="text-muted">Confirm successful delivery to recipient</small>
                                                    </div>
                                                    <i className="bi bi-check2-circle fs-4"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-outline-success d-flex justify-content-between align-items-center p-3"
                                                    onClick={() => handleDeliveryStatus(selectedPackage, 5)}
                                                >
                                                    <div>
                                                        <h6 className="mb-1">Mark as Delivered</h6>
                                                        <small className="text-muted">Confirm successful delivery to recipient</small>
                                                    </div>
                                                    <i className="bi bi-check2-circle fs-4"></i>
                                                </button>
                                            )

                                    }
                                </div>
                            </div>

                            <div className="delivery-info">
                                <div className="card">
                                    <div className="card-body">
                                        <h6 className="card-title mb-3">Delivery Information</h6>
                                        <div className="mb-3">
                                            <label className="text-muted d-block">Pickup Location</label>
                                            <p className="mb-0">{selectedPackage.sender_info[0]?.address}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-muted d-block">Delivery Location</label>
                                            <p className="mb-0">{selectedPackage.receiver_info[0]?.address}</p>
                                        </div>
                                        <div>
                                            <label className="text-muted d-block">Priority</label>
                                            <span className="badge bg-info">
                                                {selectedPackage.stripe_data?.line_items?.data?.[0]?.description || 'Standard'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {selectedPackage.delivery?.tracking?.photo_url && (
                                <img
                                    src={selectedPackage.delivery?.tracking?.photo_url}
                                    alt="Package Preview"
                                    style={{
                                        maxWidth: '200px',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                            )}
                            {!selectedPackage.delivery?.tracking?.photo_url && selectedPackage.delivery_status?.delivery_status_log[0]?.status > 4 && (
                                <div className="card mt-4">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0">Upload Drop-off Photo</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Select Photo</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept=".png,.jpg,.jpeg,.heif"
                                                        onChange={handleFileSelect}
                                                    />
                                                    <small className="text-muted">
                                                        Allowed formats: PNG, JPG, JPEG, HEIF
                                                    </small>
                                                </div>
                                                {selectedFile && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleUpload}
                                                    >
                                                        Upload Photo
                                                    </button>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                {previewUrl && (
                                                    <div>
                                                        <h6>Preview:</h6>
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '200px',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeliveryModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .delivery-status-container {
                    padding: 1rem;
                }
                .status-actions .btn {
                    border-width: 2px;
                    transition: all 0.3s ease;
                }
                .status-actions .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
            `}</style>
        </DashboardLayout>
    );
}
