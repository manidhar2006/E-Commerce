"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserId = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error fetching user data");
      const data = await response.json();
      setUserId(data);
    } catch (error) {
      setError("Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async (userId) => {
    if (!userId?._id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userId._id}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      setError("Error fetching cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId?._id) {
      fetchCart(userId);
    }
  }, [userId]);

  const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const handleBuy = async () => {
    if (cart.length === 0) return;
    try {
      const orders = cart.map((item) => ({
        transactionId: crypto.randomUUID(),
        itemId: item._id,
        buyerId: userId._id,
        sellerId: item.sellerId,
        amount: item.price,
        otp: generateOtp,
      }));

      const response = await fetch(`http://localhost:5000/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });

      if (!response.ok) throw new Error("Error processing order");
      await fetch(`http://localhost:5000/api/cart/${userId._id}/clear`, { method: "DELETE" });
      setCart([]);
      alert("Order placed successfully!");
    } catch (error) {
      setError("Error processing purchase");
    }
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingCartIcon fontSize="large" /> Shopping Cart
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : cart.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">Your cart is empty</Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          <Grid container spacing={3}>
            {cart.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocalOfferIcon color="primary" fontSize="small" />
                      <Typography variant="h6" color="primary">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {item.category}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleBuy}
                sx={{ minWidth: 200 }}
              >
                Checkout
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}
    </Container>
  );
}