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
import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Auth } from "../@types/auth";
import { AuthContext } from "../context/AuthContext";
import RouterLink from "./RouterLink";

const Login = () => {
  const { login } = useContext(AuthContext) as Auth;
  const navigate = useNavigate();
  const location = useLocation();

  const navigatePathname = useMemo(() => {
    const state = location.state as { from: string };

    if (state && state.from) {
      console.log(state.from);
      return state.from;
    }

    return "/";
  }, [location]);
  interface UserProps {
    password?: string;
    username?: string;
    showPassword?: boolean;
  }

  const [formInput, setFormInput] = useReducer(
    (state: UserProps, newState: UserProps) => ({ ...state, ...newState }),
    {
      password: "",
      username: "",
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
      const { password, username } = formInput;
      const { data } = await axios.post(
        "http://localhost:5000/api/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(data);
      login(data);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (loggedIn) {
  //     console.log(navigatePathname);
  //     navigate(navigatePathname);
  //   }
  // }, [loggedIn]);
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
            name="username"
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
        <Typography component="p">
          Don't have an account? <Link to="/register"> Register here </Link>
        </Typography>
        <Typography component="p">
          Forgot your password?{" "}
          <Link to="/recover"> Recover password here </Link>
        </Typography>
      </Grid>
    </Box>
  );
};

export default Login;
