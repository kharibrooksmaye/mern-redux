import React from "react";
import { Box, Typography } from "@mui/material";

const About = () => {
  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        About Us
      </Typography>
      <Typography variant="body1">
        Welcome to our application! We are dedicated to providing the best
        services to our users. Our team is passionate about delivering
        high-quality solutions to meet your needs.
      </Typography>
    </Box>
  );
};

export default About;
