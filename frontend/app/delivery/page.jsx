"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Container
} from "@mui/material";

export default function PendingDeliveries() {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingDeliveries();
  }, []);

  const fetchPendingDeliveries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/orders/pending-deliveries", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingDeliveries(Array.isArray(data.pendingDeliveries) ? data.pendingDeliveries : []);
      }
    } catch (error) {
      console.error("Error fetching pending deliveries:", error);
    }
    setIsLoading(false);
  };

  const handleDeliverClick = (transactionId) => {
    setSelectedOrderId(transactionId);
    setErrorMessage("");
    setIsDialogOpen(true);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
  
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMessage("Please enter a valid 6-digit OTP.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrderId, otp }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert("OTP verified successfully. Delivery confirmed!");
        setIsDialogOpen(false);
        setOtp("");
        fetchPendingDeliveries();
      } else {
        setErrorMessage(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pending Deliveries
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : pendingDeliveries.length > 0 ? (
        <Grid container spacing={2}>
          {pendingDeliveries.map((order) => (
            <Grid item xs={12} key={order.transactionId}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography color="textSecondary" variant="subtitle2">
                        Transaction ID
                      </Typography>
                      <Typography variant="body1">{order.transactionId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography color="textSecondary" variant="subtitle2">
                        Item
                      </Typography>
                      <Typography variant="body1">{order.itemName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography color="textSecondary" variant="subtitle2">
                        Buyer
                      </Typography>
                      <Typography variant="body1">{order.buyerName || "Unknown"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleDeliverClick(order.transactionId)}
                        fullWidth
                      >
                        Deliver
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Typography color="textSecondary" align="center">
              No pending deliveries.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleOtpSubmit} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              inputProps={{ maxLength: 6 }}
              margin="normal"
            />
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleOtpSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}