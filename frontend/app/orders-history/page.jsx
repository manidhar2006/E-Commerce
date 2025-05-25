"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Alert,
  Tab,
  Tabs,
  CircularProgress
} from "@mui/material";
import { LocalShipping, ShoppingBag, Pending, Refresh } from "@mui/icons-material";

export default function History() {
  const [orders, setOrders] = useState({ bought: [], sold: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");

  const regenerateOTP = async (order) => {
    try {
      const response = await fetch("http://localhost:5000/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: order.transactionId,
          itemId: order.itemId,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          amount: order.amount,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate OTP");
      const data = await response.json();
      alert(`OTP generated successfully! OTP is: ${data.otp}`);
    } catch (error) {
      setError("Error generating OTP");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/orders/history", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (error) {
        setError("Error loading orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const OrderCard = ({ order, isPending }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Transaction ID: {order.transactionId}
          </Typography>
          <Typography variant="h6">{order.itemName}</Typography>
          <Typography color="primary" variant="h6">
            ${order.amount}
          </Typography>
          {order.buyerName && (
            <Typography variant="body2">Buyer: {order.buyerName}</Typography>
          )}
          {isPending && (
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => regenerateOTP(order)}
                size="small"
              >
                Regenerate OTP
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="85vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Order History</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab icon={<ShoppingBag />} label="Bought" />
          <Tab icon={<LocalShipping />} label="Sold" />
          <Tab icon={<Pending />} label="Pending" />
        </Tabs>
      </Box>

      <Box hidden={tab !== 0}>
        {orders.bought.length ? 
          orders.bought.map(order => <OrderCard key={order.transactionId} order={order} />) :
          <Alert severity="info">No orders bought yet.</Alert>
        }
      </Box>

      <Box hidden={tab !== 1}>
        {orders.sold.length ?
          orders.sold.map(order => <OrderCard key={order.transactionId} order={order} />) :
          <Alert severity="info">No items sold yet.</Alert>
        }
      </Box>

      <Box hidden={tab !== 2}>
        {orders.pending.length ?
          orders.pending.map(order => <OrderCard key={order.transactionId} order={order} isPending />) :
          <Alert severity="info">No pending orders.</Alert>
        }
      </Box>
    </Container>
  );
}