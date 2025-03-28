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

  const disabled = JSON.stringify(user) === JSON.stringify(localUser);
  console.log(user, localUser);

  const handleSubmit = async (e: React.FormEvent<FormElement>) => {
    e.preventDefault();
    const newUser = { ...localUser };
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user?._id}`,
        newUser
      );
      console.log(data);
      if (data.user) setUser(data.user);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { type } = e.target;
    if (localUser) {
      if (type === "checkbox") {
        const { value, name, checked } = e.target;
        const newUser = { ...localUser };
        (newUser as any)[name] = checked;
        setUser(newUser);
      } else {
        const { value, name, checked } = e.target;

        console.log(value);
        const newUser = { ...localUser };
        (newUser as any)[name] = value;
        console.log(newUser);
        setLocalUser(newUser);
      }
    }
  };

  return (
    <Grid display="flex" container flexDirection="column">
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
                <Typography variant="body1">{`${localUser?.firstName} ${localUser?.lastName}`}</Typography>
              )}
            </Grid>
          </Grid>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid
              display="flex"
              justifyContent="flex-start"
              flexDirection="column"
            >
              {user &&
                Object.keys(user).map((field) => {
                  if (["isActivated", "2fa", "admin"].includes(field)) {
                    return (
                      <FormGroup>
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
                      <FormControl>
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
