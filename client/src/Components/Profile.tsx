import { Check, Edit } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Auth } from "../@types/auth";
import { User } from "../@types/user";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

interface FormElements extends HTMLFormControlsCollection {
  usernameInput: HTMLInputElement;
  emailInput: HTMLInputElement;
  firstNameInput: HTMLInputElement;
  lastNameInput: HTMLInputElement;
}

interface FormElement extends HTMLFormElement {
  readonly elements: FormElements;
}
const Profile = () => {
  const { user, loggedIn, token, login, setUser } = useContext(
    AuthContext
  ) as Auth;

  type Userkey = keyof typeof user;

  const [localUser, setLocalUser] = useState(user);
  const [hover, setHover] = useState(false);
  const [edit, setEdit] = useState(false);
  const [updatedProperties, setUpdatedProperties] = useState<{}>({});
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const disabled = JSON.stringify(user) === JSON.stringify(localUser);

  const saveSessionId = async (sessionId: string) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user?._id}/session`,
        { sessionId }
      );
      if (data.success) {
        setUser(data.user);
        setLocalUser(data.user);
        console.log("Session ID saved successfully");
      }
    } catch (error) {
      console.error("Error saving session ID:", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent<FormElement>) => {
    e.preventDefault();
    const newUser = { ...localUser };
    delete newUser.password;
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user?._id}`,
        newUser
      );
      if (data.user) setUser(data.user);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { type } = e.target;
    const updatedObj = {
      ...updatedProperties,
    };
    if (localUser) {
      if (type === "checkbox") {
        const { value, name, checked } = e.target;
        const newUser = { ...localUser };
        (newUser as any)[name] = checked;
        (updatedObj as any)[name] = checked;
        setUser(newUser);
      } else {
        const { value, name, checked } = e.target;

        const newUser = { ...localUser };
        (newUser as any)[name] = value;
        (updatedObj as any)[name] = value;
        setLocalUser(newUser as User);
      }
      setUpdatedProperties(updatedObj);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setSuccess(true);
      setSessionId(query.get("session_id") || "");
      saveSessionId(query.get("session_id") || "");
    }
    if (query.get("canceled")) {
      setSuccess(false);
    }

    if (localUser?.session) {
      setSessionId(localUser?.session);
    }
  }, [sessionId]);

  const fullName =
    localUser?.firstName || localUser?.lastName
      ? `${localUser?.firstName} ${localUser?.lastName}`
      : "User";

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
  return (
    <Grid container flexDirection="column">
      <Grid item>
        <Card sx={{ margin: "10px 25px", padding: "25px" }}>
          <Typography variant="h5">Your Profile</Typography>
          <Grid sx={{ margin: "5px", alignItems: "center" }} container>
            <Grid sx={{ padding: "5px" }} item xs="auto">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  cursor: hover ? "pointer" : "default",
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => setEdit(true)}
                alt={user?._id}
              >
                <Edit sx={{ display: hover ? "flex" : "none" }} />
                {!hover && user?.firstName}
              </Avatar>
            </Grid>
            <Grid
              sx={{
                textAlign: "left",
                alignContent: "flex-start",
                marginLeft: "10px",
              }}
              item
              xs="auto"
            >
              {edit ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    name="firstName"
                    size="small"
                    variant="outlined"
                    type="text"
                    label="First Name"
                    id="firstNameInput"
                    margin="normal"
                    defaultValue={localUser?.firstName}
                    InputLabelProps={{ shrink: true }}
                    sx={{ marginRight: "10px" }}
                    onChange={handleChange}
                  />
                  <TextField
                    name="lastName"
                    size="small"
                    variant="outlined"
                    type="text"
                    label="Last Name"
                    id="lastNameInput"
                    margin="normal"
                    defaultValue={localUser?.lastName}
                    InputLabelProps={{ shrink: true }}
                    sx={{ marginRight: "10px" }}
                    onChange={handleChange}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      setEdit(false);
                    }}
                    sx={{
                      "&:hover": {
                        cursor: "pointer",
                      },
                      marginTop: "16px",
                    }}
                  >
                    <Check />
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1">{fullName}</Typography>
              )}
            </Grid>
          </Grid>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid
              display="flex"
              justifyContent="flex-start"
              flexDirection="column"
            >
              {user?.customerId && user?.subscribed && (
                <Button
                  variant="contained"
                  onClick={() => manageSubscription(user?.customerId)}
                >
                  Manage Subscription
                </Button>
              )}
              {user &&
                Object.keys(user).map((field) => {
                  if (
                    ["isActivated", "2fa", "admin", "subscribed"].includes(
                      field
                    )
                  ) {
                    return (
                      <FormGroup key={field}>
                        <FormControlLabel
                          control={
                            <Switch
                              name={field}
                              checked={user[field as keyof User]}
                              onChange={handleChange}
                              disabled={!user.admin}
                              id={`${field}Input`}
                            />
                          }
                          label={field}
                        />
                      </FormGroup>
                    );
                  }

                  if (field === "authMethod") {
                    const options = ["sms", "email"];
                    return (
                      <FormControl key={field}>
                        <FormLabel id="authmethod">Auth Method</FormLabel>
                        <RadioGroup
                          row
                          value={user[field as keyof User]}
                          onChange={handleChange}
                        >
                          {options.map((op) => {
                            const checked = user[field as keyof User] === op;
                            return (
                              <FormControlLabel
                                label={op}
                                value={op}
                                control={<Radio />}
                                name={field}
                                id={`${field}Input`}
                                key={op}
                              />
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                    );
                  }
                  if (
                    [
                      "password",
                      "records",
                      "_id",
                      "__v",
                      "firstName",
                      "lastName",
                      "session",
                    ].includes(field)
                  )
                    return;
                  return (
                    <TextField
                      onChange={handleChange}
                      size="small"
                      variant="outlined"
                      type={typeof field}
                      name={field}
                      label={field}
                      id={`${field}Input`}
                      margin="normal"
                      defaultValue={user[field as keyof User]}
                      InputLabelProps={{ shrink: true }}
                      key={field}
                      InputProps={{
                        readOnly: field === "customerId",
                      }}
                    />
                  );
                })}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                disabled={disabled}
                variant="contained"
                sx={{
                  "&:hover": {
                    cursor: disabled ? "not-allowed" : "default",
                  },
                  marginTop: "20px",
                }}
                type="submit"
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Profile;
