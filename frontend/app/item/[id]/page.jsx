"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Container,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack
} from "@mui/material";
import { Alert } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default function Item() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/item/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setItem(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Error fetching item details");
          setLoading(false);
        });
    }
  }, [id]);

  const addToCart = async () => {
    let userId = localStorage.getItem("token");
    if (!userId) {
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error fetching user data");
        const data = await response.json();
        userId = data._id;
      } catch (error) {
        setError("Error fetching user data");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:5000/api/addCart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemId: id }),
      });

      const result = await response.json();
      if (response.status === 200) {
        setSuccess(true);
        setError(null);
      } else {
        setError(result.message);
        setSuccess(false);
      }
    } catch (error) {
      setError("An error occurred while adding the item to your cart.");
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="85vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Item not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              {item.name}
            </Typography>
            
            <Divider />

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalOfferIcon color="primary" />
              <Typography variant="h5" color="primary">
                ${item.price.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon color="action" />
              <Chip
                label={item.category}
                variant="outlined"
                size="medium"
              />
            </Box>

            <Button
              onClick={addToCart}
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              sx={{
                mt: 2,
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add to Cart
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Item added to cart!
        </Alert>
      </Snackbar>

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}