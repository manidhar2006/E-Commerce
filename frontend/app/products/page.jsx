"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";

export default function Products() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/api/items") // Replace with your actual API endpoint
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  const categories = [...new Set(items.map((item) => item.category))];
  const normalizedQuery = searchQuery.toLowerCase();
  
  const filteredItems = items.filter(
    (item) =>
      (item.name.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)) &&
      (selectedCategories.length === 0 || selectedCategories.includes(item.category))
  );

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  return (
    <Container maxWidth="md" sx={{ padding: 4, minHeight: "85vh" }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products by name or category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ marginBottom: 3 }}
      />

      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filter by Category:
        </Typography>
        {categories.map((category) => (
          <FormControlLabel
            key={category}
            control={
              <Checkbox
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
            }
            label={category}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" mt={1}>
                    Price: {item.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {item.category}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ marginTop: 2 }}
                    onClick={() => router.push(`/item/${item._id}`)}
                  >
                    View Item
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No products found...
          </Typography>
        )}
      </Grid>
    </Container>
  );
}