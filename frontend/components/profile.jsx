import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Grid, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export default function Profile({ user }) {
  const { email, firstName, lastName, contactNumber, age } = user;
  const [editedUser, setEditedUser] = useState({ email, firstName, lastName, contactNumber, age });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleUpdateProfile = async (updatedUser) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Error updating profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateProfile(editedUser);
    setIsEditing(false);
  };

  return (
    <Grid container justifyContent="center" style={{ padding: "20px", minHeight: "85vh" }}>
      <Grid item xs={12} sm={8} md={6}>
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Grid container justifyContent="center" mb={2}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
                {firstName.charAt(0)}{lastName.charAt(0)}
              </Avatar>
            </Grid>
            <Typography variant="h5" align="center" gutterBottom>
              Profile
            </Typography>
            <form >
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={editedUser.firstName}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={editedUser.lastName}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editedUser.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Phone"
                name="contactNumber"
                value={editedUser.contactNumber}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Age"
                name="age"
                value={editedUser.age}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={!isEditing}
              />
              <Grid container justifyContent="center" mt={2}>
                {isEditing ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
