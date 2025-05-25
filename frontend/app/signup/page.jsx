"use client";

import React, { useState } from "react";
import { TextField, Button, Container, Grid, Typography, Box } from "@mui/material";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    contactNumber: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // To manage errors
  const router = useRouter(); // Initialize router for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateEmail = (email) => {
    const iiitEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.iiit\.ac\.in$/;
    return iiitEmailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setErrorMessage("Only IIIT emails are allowed!");
      return;
    }

    const hashedPassword = btoa(formData.password);
    const secureFormData = { ...formData, password: hashedPassword };

    fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(secureFormData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          localStorage.setItem('userId', data.user._id); // Store user ID in localStorage
          router.push("/profile");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("An error occurred while registering the user.");
      });
  };

  return (
    <Container maxWidth="sm" className="signup-container" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit} className="signup-form">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Age"
              variant="outlined"
              fullWidth
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Contact Number"
              variant="outlined"
              fullWidth
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className="signup-button"
          sx={{ mt: 3 }}
        >
          Sign Up
        </Button>
      </form>
      {errorMessage && (
        <Box sx={{ mt: 2, color: "red" }}>
          <Typography variant="body2">{errorMessage}</Typography>
        </Box>
      )}
    </Container>
  );
}