import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Paper, Typography, Grid } from '@mui/material';
import { email_query, word } from '../../Types'

axios.defaults.baseURL = 'http://35.208.70.236/';

const Demo: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firebaseUID, setFirebaseUID] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [targetSchoolId, setTargetSchoolId] = useState('');
    const [wordId, setWordId] = useState('');
    const [testId, setTestId] = useState('');
    const [resultUser, setResultUser] = useState<any>(null);
    const [resultWord, setResultWord] = useState<any>(null);

    const handleFetchUserDetails = async () => {
        try {
            console.log({ Email: email })
            const response = await axios.get('/api/User', { params: {Email: email }});
            setResultUser(response.data);
            console.log(response);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleFetchWordDetails = async () => {
        try {
            let response = await axios.get('/api/Word/', { params: { wordId: wordId, TestId: testId } });
            console.log(response);
            setResultWord(response.data);
        } catch (error) {
            console.error('Error fetching word details:', error);
        }
    };

    const handleCreateUser = async () => {
        try {
            const response = await axios.post('/api/User/new', {
                Email: email, Password: password, FirebaseUID: firebaseUID,
                Username: username, FirstName: firstName, LastName: lastName,
                JoinedTime: new Date().toISOString().slice(0, 19).replace('T', ' '), TargetSchoolId: targetSchoolId
            });
            setResultUser(response.data);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleModifyUserSchool = async () => {
        try {
            const response = await axios.post('/api/User/modify', { Email: email, TargetSchoolId: targetSchoolId });
            setResultUser(response.data);
        } catch (error) {
            console.error('Error modifying user school:', error);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Paper elevation={3} sx={{ padding: 2, margin: 2 }}>
                <Typography variant="h6" gutterBottom>User Operations</Typography>
                Demo steps: fetch naomifaulkner208@example.com, stuff@example.com, create a new user, change school ID
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
                        <TextField label="Firebase UID" value={firebaseUID} onChange={(e) => setFirebaseUID(e.target.value)} fullWidth />
                        <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
                        <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                        <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                        <TextField label="Target School ID" value={targetSchoolId} onChange={(e) => setTargetSchoolId(e.target.value)} fullWidth />
                        <Button onClick={handleFetchUserDetails} variant="contained">Fetch User</Button>
                        <Button onClick={handleCreateUser} variant="contained" color="primary">Create User</Button>
                        <Button onClick={handleModifyUserSchool} variant="contained" color="secondary">Modify User School</Button>
                    </Grid>
                </Grid>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2, margin: 2 }}>
                <Typography variant="h6" gutterBottom>User Results</Typography>
                <pre>{JSON.stringify(resultUser, null, 2)}</pre>
            </Paper>
            

            <Paper elevation={3} sx={{ padding: 2, margin: 2 }}>
                <Typography variant="h6" gutterBottom>Word Operations</Typography>
                Fetch any word
                <TextField label="Word ID" value={wordId} onChange={(e) => setWordId(e.target.value)} fullWidth />
                <TextField label="Test ID" value={testId} onChange={(e) => setTestId(e.target.value)} fullWidth />
                <Button onClick={handleFetchWordDetails} variant="contained" color="primary">Fetch Word Details</Button>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2, margin: 2 }}>
                <Typography variant="h6" gutterBottom>Word Results</Typography>
                <pre>{JSON.stringify(resultWord, null, 2)}</pre>
            </Paper>
        </Box>
    );
};

export default Demo;
