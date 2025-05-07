import React, { useContext, useEffect, useState } from "react";
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
  useTheme,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import { AuthContext } from "../context/AuthContext";
import { Auth } from "../@types/auth";
import { useAuth } from "../hooks/useAuth";
import {
  oneTimePackages,
  subscriptionTiers,
} from "./Constants/subscriptionTiers";

const Pricing = () => {
  const { user } = useContext(AuthContext) as Auth;
  const isAuthenticated = useAuth("Pricing");
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const theme = useTheme(); // Access the theme

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
          customerId,
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
  const manageSubscription = async (customer: string) => {
    const { data } = await axios.post(
      "http://localhost:5000/api/create-portal-session",
      {
        customer,
      }
    );

    const { url } = data;
    if (url) {
      window.location.replace(url);
    }
  };

  const handleClick = async (stripeLookup: string) => {
    if (user?.subscribed) {
      manageSubscription(user.customerId);
    } else {
      createCheckoutSession(stripeLookup ?? "", "subscription");
    }
  };
  const createCustomer = async () => {
    if (user?.customerId) {
      setCustomerId(user.customerId);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/create-customer",
        {
          userId: user?._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Customer created:", response.data);
      setCustomerId(response.data.customer.id);
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  useEffect(() => {
    createCustomer();
  }, []);
  const freeTier = subscriptionTiers[0]; // Extract the Free tier
  const paidTiers = subscriptionTiers.slice(1); // Exclude the Free tier

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.primary.main }}
      >
        Pricing
      </Typography>

      <Grid mb={4} container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              ...(user?.subscription === "free" && {
                border: "5px solid #3f51b5",
              }),
              boxShadow: 3,
              borderRadius: "8px",
            }}
          >
            <CardContent>
              {user?.subscription === "free" && (
                <Typography
                  variant="h5"
                  color="#3f51b5"
                  style={{ fontWeight: "bold" }}
                >
                  Current Plan
                </Typography>
              )}
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: theme.palette.secondary.main }}
              >
                {freeTier.title}
              </Typography>
              <List>
                {freeTier.perks.map((perk, perkIndex) => (
                  <React.Fragment key={perkIndex}>
                    <ListItem disableGutters sx={{ textAlign: "center" }}>
                      <ListItemText primary={perk} />
                    </ListItem>
                    {perkIndex < freeTier.perks.length - 1 && <Divider />}{" "}
                    {/* Add Divider */}
                  </React.Fragment>
                ))}
              </List>
              <Typography variant="body2" style={{ marginTop: "10px" }}>
                <strong>Number of users:</strong> {freeTier.users}
              </Typography>
              <Typography variant="body2">
                <strong>Unprocessed samples:</strong> {freeTier.samples}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.primary.dark, marginTop: "10px" }}
              >
                {freeTier.price}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                disabled={user?.subscription === freeTier.stripeLookup}
                style={{ margin: "15px" }}
                onClick={() =>
                  createCheckoutSession(
                    freeTier.stripeLookup ?? "",
                    "subscription"
                  )
                }
              >
                {user?.subscription === freeTier.stripeLookup
                  ? "Your Current Plan"
                  : "Downgrade to Free"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {paidTiers.map((tier, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                border: `8px solid ${
                  user?.subscription === tier.stripeLookup
                    ? "#3f51b5"
                    : "transparent"
                }`,
                boxShadow: 3,
                borderRadius: "20px",
              }}
            >
              <CardContent style={{ flexGrow: 1 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ color: theme.palette.secondary.main }}
                >
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
                  sx={{ color: theme.palette.primary.dark, marginTop: "10px" }}
                >
                  {tier.price}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                disabled={user?.subscription === tier.stripeLookup}
                style={{ margin: "15px" }}
                onClick={() => handleClick(tier.stripeLookup ?? "")}
              >
                {user?.subscription === tier.stripeLookup
                  ? "Your Current Plan"
                  : `${user?.subscribed ? "Switch" : "Subscribe"} to ${
                      tier.title
                    }`}
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
    </Box>
  );
};

export default Pricing;
