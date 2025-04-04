// Word.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

import { school } from '../../Types'

axios.defaults.baseURL = 'http://35.208.70.236/';

const School = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [schoolDetails, setSchoolDetails] = useState<school | null>(null);

  useEffect(() => {
    const fetchWordDetails = async () => {
      try {
        const response = await axios.get('/api/School', { params: {SchoolId: schoolId }});
        setSchoolDetails(response.data[0]);
            console.log(response);
        } catch (error) {
          console.error('Error fetching school details:', error);
          setSchoolDetails(null); // Handling the case when fetching fails
      }
    };

    fetchWordDetails();
  }, [schoolId]);

  return ( schoolDetails && (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
      <Card sx={{ maxWidth: 400, mt: 5, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Typography variant="h5" component="div" color="primary">
              {schoolDetails.SchoolName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {schoolDetails.Country}
            </Typography>
          </Box>
          <Typography variant="body1" gutterBottom>
            <strong>Rank:</strong> #{schoolDetails.SchoolRank}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Size:</strong> {schoolDetails.Size === 'L' ? 'Large' : 'Small'}
          </Typography>
          <Typography variant="body1">
            <strong>Score:</strong> {schoolDetails.Score}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  ));
};

export default School;
