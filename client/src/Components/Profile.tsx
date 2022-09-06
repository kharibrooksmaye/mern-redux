import { Check } from "@mui/icons-material";
import {
  Avatar,
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
import React, { useContext } from "react";
import { Auth } from "../@types/auth";
import { User } from "../@types/user";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, loggedIn, token, login, setUser } = useContext(
    AuthContext
  ) as Auth;

  type Userkey = keyof typeof user;

  console.log(user);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { type } = e.target;
    console.log(type);
    if (type === "checkbox") {
      const { value, name, checked } = e.target;
      const newUser = { ...user };
      (newUser as any)[name] = checked;
      setUser(newUser);
    } else {
      const { value, name, checked } = e.target;

      console.log(value);
      const newUser = { ...user };
      (newUser as any)[name] = value;
      setUser(newUser);
    }
  };
  return (
    <Card sx={{ margin: "10px 25px", padding: "25px" }}>
      <Typography variant="h5">Your Profile</Typography>
      <Grid sx={{ margin: "5px", alignItems: "center" }} container>
        <Grid sx={{ padding: "5px" }} item xs="auto">
          <Avatar sx={{ width: 56, height: 56 }}>{user?.firstName}</Avatar>
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
          <Typography variant="body1">{`${user?.firstName} ${user?.lastName}`}</Typography>
          <Typography
            sx={{ fontStyle: "italic" }}
            variant="body2"
            color="GrayText"
          >
            {user?._id}
          </Typography>
        </Grid>
      </Grid>
      <Grid display="flex" justifyContent="flex-start" flexDirection="column">
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
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              );
            }
            if (["password", "records", "_id", "__v"].includes(field)) return;
            return (
              <TextField
                size="small"
                variant="outlined"
                type={typeof field}
                name={field}
                label={field}
                margin="normal"
                value={user[field as keyof User]}
                InputLabelProps={{ shrink: true }}
              />
            );
          })}
      </Grid>
    </Card>
  );
};

export default Profile;
