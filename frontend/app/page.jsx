"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/products"); // Redirect to the profile page
  }, []);

  return null; // No UI needed, just handling redirection
}
