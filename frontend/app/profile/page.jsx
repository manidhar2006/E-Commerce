"use client";

import React, { useEffect, useState } from "react";
import Profile from "@/components/profile";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); 
        console.log(token)
        const response = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          credentials: "include", // Include cookies for session authentication
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Include token in Authorization header
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <Profile user={user} />;
}
