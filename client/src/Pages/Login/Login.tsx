import { Box, Button, TextField } from '@mui/material'
import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

type Props = {}

const Login = (props: Props) => {
    const auth = useContext(AuthContext)
    const fields = [
        {'name': 'email', 'type': 'text'},
        {'name': 'password', type: 'password'}
    ]
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', margin: '5px auto'}}>
    <div>Login</div>
    <Box component="form" sx={{display: 'flex', flexDirection: 'column'}}>
        {fields.map(({name, type}) => (
            <TextField key={name} size="small" type={type} name={name} sx={{margin: '5px auto'}}/>
        ))}
        <Button color="primary" sx={{margin: '20px auto'}} variant="contained">Login</Button>
    </Box>
    </Box>
  )
}

export default Login;