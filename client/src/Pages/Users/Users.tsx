import {
  Box,
  Button,
  Card,
  Grid,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridValueGetterParams } from "@mui/x-data-grid";
import axios from "axios";
import React, { useReducer, useState } from "react";
import { User } from "../../@types/user";
import { userRows } from "../../Components/Constants/userRows";
import { useFetch } from "../../Helpers/functions";
const Users = () => {
  const [open, setOpen] = useState(false);
  interface OrgProps {
    value: {
      contact: string;
      createdAt: Date;
      id: number;
      joined: Date;
      name: string;
    };
  }
  const columns = [
    { field: "id", headerName: "ID", width: 130 },
    { field: "firstName", headerName: "First Name", width: 130 },
    { field: "lastName", headerName: "Last Name", width: 130 },
    {
      field: "organization",
      headerName: "Organization",
      width: 130,
      valueGetter: (params: GridValueGetterParams) => params?.value?.name || "",
    },
    { field: "age", headerName: "Age", width: 90 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "createdAt", headerName: "Created At", width: 150 },
    { field: "lastLogin", headerName: "Last Login", width: 150 },
    { field: "samples", headerName: "# of Samples", width: 150 },
  ];
  const { data, isLoading, error } = useFetch(
    "http://localhost:5000/api/admin/users"
  );

  const mappedData = data.map((d) => {
    const newData = d as User;
    if (d && newData) {
      newData.id = d._id;
    }
    return newData;
  });
  interface UserProps {
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    age?: number;
    organization?: string;
    email?: string;
  }

  const [formInput, setFormInput] = useReducer(
    (state: UserProps, newState: UserProps) => ({ ...state, ...newState }),
    {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      confirmPassword: "",
      age: undefined,
      organization: "",
      email: "",
    }
  );
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: newValue } = evt.currentTarget as HTMLInputElement;
    setFormInput({ [name]: newValue });
  };
  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    try {
      console.log(formInput);
      const { confirmPassword, ...data } = formInput;
      const result = await axios.post(
        "http://localhost:5000/api/register",
        data
      );
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };
  const inputs = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      size: 6,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      size: 6,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      size: 12,
    },
    {
      name: "username",
      label: "Username",
      type: "string",
      size: 12,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      size: 12,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      size: 12,
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      size: 4,
    },
    {
      name: "organization",
      label: "Organization",
      type: "text",
      size: 8,
    },
  ];

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <Box sx={{ margin: "50px", height: "100%" }}>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h5" sx={{ m: 2 }}>
            Add New User
          </Typography>
          <Box component="form" sx={{ m: 2 }} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {inputs.map(({ name, type, label, size }) => (
                <Grid item xs={size}>
                  <TextField
                    key={name}
                    sx={{ margin: "5px" }}
                    size="small"
                    variant="outlined"
                    type={type}
                    label={label}
                    fullWidth
                    name={name}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
              <Button
                sx={{ m: 3 }}
                type="submit"
                variant="contained"
                color="primary"
              >
                Add User
              </Button>
            </Grid>
          </Box>
        </Box>
      </Modal>
      <Typography marginBottom="20px" variant="h3">
        Users
      </Typography>
      <DataGrid
        autoHeight
        columns={columns}
        rows={data || []}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        sx={{}}
      />
      <Button
        sx={{ m: 3 }}
        onClick={handleOpen}
        variant="contained"
        color="primary"
      >
        Add User
      </Button>
    </Box>
  );
};

export default Users;
