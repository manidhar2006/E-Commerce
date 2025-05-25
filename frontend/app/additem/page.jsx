"use client";

import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material";

export default function AddItem() {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/item/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Ensures session cookies are sent
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to add item");
            }

            const data = await response.json();
            console.log("Item added:", data);
            alert("Item added successfully!");
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item.");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, minHeight: "85vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Paper elevation={4} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom textAlign="center" color="primary">
                    Add Item
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required />
                    <TextField fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                    <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />
                    <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} required />
                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, py: 1.5 }}>
                        Add Item
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
