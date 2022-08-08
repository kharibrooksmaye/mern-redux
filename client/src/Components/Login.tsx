import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router";
import { authContext } from "../AuthContext";

const Login = () => {
  const auth = useContext(authContext);
  const navigate = useNavigate();

  interface UserProps {
    password?: string;
    email?: string;
    showPassword?: boolean;
  }

  const [formInput, setFormInput] = useReducer(
    (state: UserProps, newState: UserProps) => ({ ...state, ...newState }),
    {
      password: "",
      email: "",
      showPassword: false,
    }
  );
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: newValue } = evt.currentTarget as HTMLInputElement;
    setFormInput({ [name]: newValue });
  };
  const [error, setError] = useState(false);

  const handleClickShowPassword = () => {
    setFormInput({ ...formInput, showPassword: !formInput.showPassword });
  };
  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };
  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setError(false);

    try {
      const { password, email } = formInput;
      const { data } = await axios.post(
        "http://localhost:1337/api/auth/local",
        {
          identifier: email,
          password,
        }
      );
      auth.signIn(data);
      auth?.user?.id && navigate("/profile");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Box
      sx={{
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Grid item xs={12} md={12} lg={10}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            alignItems: "centeer",
          }}
        >
          <TextField
            margin="normal"
            variant="outlined"
            label="Username or Email Address"
            size="small"
            type="text"
            name="email"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            variant="outlined"
            label="Password"
            size="small"
            type={formInput.showPassword ? "text" : "password"}
            name="password"
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {formInput.showPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            color="success"
            sx={{ margin: "16px 0px", marginRight: "10px" }}
            variant="contained"
            fullWidth
            type="submit"
          >
            Login
          </Button>
        </Box>
        <p style={{ color: "red" }}>{error ? error : ""}</p>
      </Grid>
    </Box>
  );
};

export default Login;
