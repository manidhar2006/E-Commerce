"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Support() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/logout", {
          method: "POST",
          credentials: "include", // Ensures cookies are sent with the request
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to logout");
        }

        // Clear cookies on the client side
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to login
        router.push("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    logout();
  }, [router]);

  return <p>Logging out...</p>;
}
