"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8080/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(`Thanks for joining the waitlist, ${email}!`);
        setEmail("");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom>
          HumanBillboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Get paid to advertise. Join our waitlist to be the first to access.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Stack spacing={2}>
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="contained" type="submit">
              Join Waitlist
            </Button>
            {success && <Typography color="green">{success}</Typography>}
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
