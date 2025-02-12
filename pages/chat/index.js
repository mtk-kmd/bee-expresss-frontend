import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getApi, postApi } from "@/utils/api_helper";
import { useEffect, useState } from "react";

export default function Chat() {
    const { authToken, getUserDetails } = useAuth();
    const [iframeSource, setIframeSource] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const logInToRC = async (details) => {
        try {
            if (!details) return;
            const response = await getApi('getUsers?user_id=' + details.id, authToken);

            const rcLogin = await postApi('rc-login', authToken, {
                userId: details.id,
                password: details.password,
            });

            if (rcLogin.status === 200) {
                const rcResponse = rcLogin.data.data;
                if (rcResponse.data.authToken) {
                    const chatUrl = 'https://chat.mtktechlab.com';
                    const resumeToken = encodeURIComponent(rcResponse.data.authToken);
                    const url = `${chatUrl}/home?resumeToken=${resumeToken}`;
                    setIframeSource(url);
                }
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (authToken) {
            const details = getUserDetails();
            if (details) {
                setUserDetails(details);
                logInToRC(details);
            } else {
                window.location.href = '/';
            }
        }
    }, [authToken]);

    return (
        <DashboardLayout title="Chat">
            <h1>Chat</h1>
            {!isLoading && iframeSource && (
                <iframe
                    src={iframeSource}
                    width="100%"
                    frameBorder="0"
                    style={{ height: "100vh" }}
                    allow="clipboard-write"
                />
            )}
            {(isLoading || !iframeSource) && (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
