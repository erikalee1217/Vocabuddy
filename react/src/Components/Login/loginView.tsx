import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Typography, Alert, Box, TextField, Button, Paper } from '@mui/material';

const LoginView: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
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
            <Paper elevation={3} style={{ padding: '40px', width: '300px', textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>Login Here</Typography>
                <TextField
                    label="Email"
                    type="text"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleLogin} 
                    style={{ marginTop: '20px' }}
                    fullWidth
                >
                    Log In
                </Button>
                {error && <Alert severity="error" style={{ marginTop: '20px' }}>{error}</Alert>}
                <Typography variant="body2" style={{ marginTop: '20px' }}>
                    Not a member?&nbsp;
                    <Link to="/signup" style={{ textDecoration: 'none' }}>Register</Link>
                </Typography>
                naomifaulkner208@example.com<br/>
                473651210407
            </Paper>
        </Box>
    );
};

export default LoginView;
