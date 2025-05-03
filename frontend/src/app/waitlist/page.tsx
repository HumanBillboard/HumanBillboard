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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call backend API for sending email
    alert(`Thanks for joining the waitlist, ${email}!`);
    setEmail("");
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
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
