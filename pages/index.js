import Head from "next/head";
import { useState } from "react";
import { Geist } from "next/font/google";
import styles from "@/styles/Home.module.css";
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

        const fetchApi = postPublicApi("login",
            {
                user_name: userName,
                password: password
            }
        );

        await fetchApi.then((res) => {
            if (res.status === 200) {
                const { token, result } = res.data;
                login(token);
                router.push("/dashboard");
            }
            if (res.status === 403) {
                // toast.error("Error");
            }
        });

        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Bee Express Customer</title>
                <meta name="description" content="Bee Express Admin Login" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={`${styles.page} ${geistSans.variable}`}>
                <main className={styles.main}>
                    <h1>Login to Bee Express</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={`${styles.formGroup}`}>
                            <label htmlFor="userName">Username</label>
                            <input
                                className="form form-input"
                                type="text"
                                id="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={`${styles.primary} btn btn-primary`}>
                Login
                        </button>
                    </form>
                    <p>
                Don&apos;t have an account?{" "}
                        <a onClick={() => router.push("/register")}>Register here</a>
                    </p>
                </main>
            </div>
        </>
    );
}
