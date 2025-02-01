import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export const useAuthGuard = () => {
  const { authToken, getUserDetails } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      if (authToken === null) {
        setLoading(false);
        return;
      }
    }

    if (!authToken) {
      router.push("/");
    } else {
      const user = getUserDetails();
      user.role === "ADMIN" && router.push(process.env.NEXT_PUBLIC_ADMIN_FRONTEND_URL);
      setUserDetails(user);
      setLoading(false);
    }
  }, [authToken, getUserDetails, router, loading]);

  return { loading, userDetails };
};
