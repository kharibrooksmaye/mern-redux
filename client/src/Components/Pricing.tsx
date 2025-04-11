import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router";

const Pricing = () => {
  const navigate = useNavigate();
  const subscriptionTiers = [
    {
      title: "Free",
      perks: ["Basic access to features"],
      price: "$0/month",
      users: "5 users",
      samples: "3 unprocessed samples per month",
    },
    {
      title: "Bronze",
      perks: [
        "Access to standard features",
        "10 users",
        "5 unprocessed samples per month",
      ],
      price: "$10/month",
      stripeLookup: "bronze_monthly",
    },
    {
      title: "Silver",
      perks: [
        "Access to advanced features",
        "20 users",
        "10 unprocessed samples per month",
      ],
      price: "$20/month",
      stripeLookup: "silver_monthly",
    },
    {
      title: "Gold",
      perks: [
        "All features + priority support",
        "Unlimited users",
        "Unlimited unprocessed samples per month",
      ],
      price: "$30/month",
      stripeLookup: "gold_monthly",
      bestValue: true, // Mark this tier as the best value
    },
  ];

  const oneTimePackages = [
    { title: "Basic Package", price: "$100", stripeLookup: "basic_package" },
    {
      title: "Standard Package",
      price: "$200",
      stripeLookup: "standard_package",
    },
    {
      title: "Premium Package",
      price: "$300",
      stripeLookup: "premium_package",
    },
  ];

  const createCheckoutSession = async (
    stripeLookup: string,
    paymentType: string
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/create-checkout-session",
        {
          stripeLookup,
          paymentType,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { url } = response.data;
      if (url) {
        window.location.replace(url); // Redirect to the Stripe checkout page
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const freeTier = subscriptionTiers[0]; // Extract the Free tier
  const paidTiers = subscriptionTiers.slice(1); // Exclude the Free tier

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Pricing
      </Typography>

      {/* Free Tier as a Separate Block */}
      <Box mb={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {freeTier.title}
            </Typography>
            <Typography variant="body1">{freeTier.perks}</Typography>
            <Typography variant="body2" style={{ marginTop: "10px" }}>
              <strong>Number of users:</strong> {freeTier.users}
            </Typography>
            <Typography variant="body2">
              <strong>Unprocessed samples:</strong> {freeTier.samples}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              style={{ marginTop: "10px" }}
            >
              {freeTier.price}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Paid Tiers */}
      <Grid container spacing={3}>
        {paidTiers.map((tier, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <CardContent style={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {tier.title}
                </Typography>
                {tier.bestValue && (
                  <Typography
                    variant="body2"
                    color="secondary"
                    style={{ fontWeight: "bold" }}
                  >
                    Best Value
                  </Typography>
                )}
                <List>
                  {tier.perks.map((perk, perkIndex) => (
                    <React.Fragment key={perkIndex}>
                      <ListItem disableGutters sx={{ textAlign: "center" }}>
                        <ListItemText primary={perk} />
                      </ListItem>
                      {perkIndex < tier.perks.length - 1 && <Divider />}{" "}
                      {/* Add Divider */}
                    </React.Fragment>
                  ))}
                </List>
                <Typography
                  variant="h6"
                  color="primary"
                  style={{ marginTop: "10px" }}
                >
                  {tier.price}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: "15px" }}
                onClick={() =>
                  createCheckoutSession(tier.stripeLookup ?? "", "subscription")
                }
              >
                Subscribe
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom style={{ marginTop: "40px" }}>
        One-Time Payment Options
      </Typography>
      <Grid container spacing={3}>
        {oneTimePackages.map((pkg, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {pkg.title}
                </Typography>
                <Typography variant="h5" color="primary">
                  {pkg.price}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{ marginTop: "15px" }}
                  onClick={() => createCheckoutSession(pkg.title, "payment")}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Pricing;
