import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, DialogContentText, Avatar, Divider, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Import icon for user avatar
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// Axios base URL setup (better to configure in a centralized Axios setup file)
axios.defaults.baseURL = 'http://35.208.70.236/';

const UserDetailsView: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [newSchoolId, setNewSchoolId] = useState("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate(); // Create navigate function
    
    useEffect(() => {
        // Load user data from session storage
        const rawData = sessionStorage.getItem('user');
        if (rawData) {
            const savedData = JSON.parse(rawData);
            if (savedData && savedData[0]) { // Ensure savedData is not empty
                setUser(savedData[0]);       // Assuming you want the first item of an array
            }
        }
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSchoolChange = async () => {
        try {
            await axios.post('/api/User/modify', { Email: user.Email, TargetSchoolId: newSchoolId });
            const updatedUser = { ...user, TargetSchoolId: newSchoolId };
            setUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify([updatedUser]));
            handleClose();
        } catch (err) {
            console.error('Error modifying school:', err);
            setError("Failed to update school. Please check the details and try again.");
        }
    };

    const handleNavigateToSchool = () => {
        navigate(`/schools/${user?.TargetSchoolId}`);
    };

    return (
        <Card style={{ maxWidth: 500, margin: 'auto', marginTop: '20px', padding: '20px' }}>
            <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <Avatar style={{ backgroundColor: '#1976d2', marginRight: '15px' }}>
                        <AccountCircleIcon />
                    </Avatar>
                    <Typography variant="h5" component="h2">
                        {user?.FirstName} {user?.LastName}
                    </Typography>
                </div>
                <Divider style={{ marginBottom: '20px' }} />
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    Username: {user?.Username}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Email: {user?.Email}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    School ID: {user?.TargetSchoolId}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Joined Time: {user?.JoinedTime && new Date(user.JoinedTime).toLocaleString()}
                </Typography>
                <Button variant="contained" color="primary" style={{ marginTop: '20px' }} onClick={handleOpen}>
                    Modify School
                </Button>
                <Button variant="contained" color="secondary" style={{ marginTop: '20px', marginLeft: '10px' }} onClick={handleNavigateToSchool}>
                    Go to School
                </Button>
                {error && <Alert severity="error" style={{ marginTop: '20px' }}>{error}</Alert>}
            </CardContent>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Update School</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To update your school ID, please enter the new school ID below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="school"
                        label="New School ID"
                        type="text"
                        fullWidth
                        value={newSchoolId}
                        onChange={(e) => setNewSchoolId(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSchoolChange} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default UserDetailsView;
