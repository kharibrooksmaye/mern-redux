import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

const Contact = () => {
  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" gutterBottom>
        Have questions or need help? Feel free to reach out to us using the form
        below.
      </Typography>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "400px",
        }}
      >
        <TextField label="Name" variant="outlined" fullWidth />
        <TextField label="Email" variant="outlined" fullWidth />
        <TextField
          label="Message"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
        />
        <Button variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default Contact;
