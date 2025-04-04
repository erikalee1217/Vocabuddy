import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Alert, Box, TextField, Button, Paper, Grid } from '@mui/material';
import { useAuth } from '../../AuthContext';

import axios from 'axios';
axios.defaults.baseURL = 'http://35.208.70.236/';

const SignUpView: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [targetSchoolId, setTargetSchoolId] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();

    const handleSignUp = async () => {
        // Add your API call logic for signup here
        try {
            try {
                const response = await axios.post('/api/User/new', {
                    Email: email, Password: password,
                    Username: username, FirstName: firstName, LastName: lastName,
                    JoinedTime: new Date().toISOString().slice(0, 19).replace('T', ' '), TargetSchoolId: targetSchoolId
                });
            } catch (error) {
                console.error('Error creating user:', error);
            }
            
            await login(email, password);
            const savedUser = sessionStorage.getItem('user');
            
            if (savedUser) {
                navigate('/');
            } else {
                setError("Failed to log in. Please check your credentials and try again.");
            }
        } catch (err) {
            setError("Failed to log in. Please check your credentials and try again.");
        }
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="90vh">
            <Paper elevation={3} style={{ padding: '40px', width: '450px' }}>
                <Typography variant="h5" gutterBottom>Sign Up</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="First Name"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Last Name"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Username"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Target School ID"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={targetSchoolId}
                            onChange={(e) => setTargetSchoolId(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSignUp} 
                    style={{ marginTop: '20px', width: '100%' }}
                >
                    Sign Up
                </Button>
                {error && <Alert severity="error" style={{ marginTop: '20px' }}>{error}</Alert>}
                <Typography variant="body2" style={{ marginTop: '20px' }}>
                    Already a member?&nbsp;
                    <Link to="/login" style={{ textDecoration: 'none' }}>Log In</Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default SignUpView;
