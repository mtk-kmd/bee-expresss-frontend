import Head from "next/head";
import { useState } from "react";
import { Geist } from "next/font/google";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { getPublicApi, postPublicApi } from "@/utils/api_helper";
import { useAuth } from "@/context/AuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export default function Home() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await postPublicApi("login", {
                user_name: userName,
                password: password
            });

            if (response.status === 200) {
                const { token } = response.data;
                login(token);
                router.push("/dashboard");
            }
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Bee Express - Login</title>
                <meta name="description" content="Bee Express Login" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="card shadow">
                                <div className="card-body p-4">
                                    <h2 className="text-center mb-4">Bee Express</h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                User Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="userName"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                placeholder="Enter username"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                            ) : null}
                                            Login
                                        </button>
                                    </form>
                                    <p className="text-center mt-3">
                                        Not registered?{" "}
                                        <a href="#" onClick={() => router.push("/register")}>
                                            Create an account
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
