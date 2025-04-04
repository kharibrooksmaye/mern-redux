import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Auth } from "../@types/auth";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const { user, loggedIn, token, login, setMessage } = useContext(
    AuthContext
  ) as Auth;
  const navigate = useNavigate();

  interface UserProps {
    password?: string;
    username?: string;
    email?: string;
    showPassword?: boolean;
  }

  const [formInput, setFormInput] = useReducer(
    (state: UserProps, newState: UserProps) => ({ ...state, ...newState }),
    {
      password: "",
      username: "",
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
      const { password, username, email } = formInput;
      const { data } = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });
      data?.error && setError(data?.error);
      if (data?.userCreated) {
        setFormInput({
          password: "",
          username: "",
          email: "",
          showPassword: false,
        });
        setMessage({
          content: "User created successfully. Login to continue",
          type: "success",
        });
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    user?._id && navigate("/profile");
  }, [user, loggedIn]);
  return (
    <Box
      sx={{
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Grid item xs={12} md={12} lg={12}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            alignItems: "center",
            width: "100%",
          }}
        >
          <TextField
            margin="normal"
            variant="outlined"
            label="Username"
            size="small"
            type="text"
            name="username"
            sx={{ width: "100%" }}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            variant="outlined"
            label="Email Address"
            size="small"
            type="text"
            name="email"
            sx={{ width: "100%" }}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            variant="outlined"
            label="Password"
            size="small"
            sx={{ width: "100%" }}
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
            sx={{ margin: "16px 0px" }}
            variant="contained"
            fullWidth
            type="submit"
          >
            Register
          </Button>
        </Box>
        <p style={{ color: "red" }}>{error ? error : ""}</p>
        <Typography component="p">
          Already have an account? <Link to="/login"> Login here </Link>
        </Typography>
      </Grid>
    </Box>
  );
};

export default Register;
