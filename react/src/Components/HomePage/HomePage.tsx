import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Paper, Tabs, Tab } from '@mui/material';

import { word } from '../../Types'


axios.defaults.baseURL = 'http://35.208.70.236/';

function HomePage() {
  const [activeTab, setActiveTab] = useState(0); // 0 for GRE, 1 for TOEFL
  const [wordData, setWordData] = useState<word | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchWord = async () => {
      const TestId = activeTab === 0 ? 0 : 3;
      try {
        const response = await axios.get('/api/Words/random', { params: {TestId: TestId }});
            setWordData(response.data[0]);
            console.log(response);
        } catch (error) {
            console.error('Error fetching user details:', error);
      }

    };

    fetchWord();
  }, [activeTab]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="75vh">
      <Typography variant="h3" gutterBottom>Vocabuddy</Typography>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="GRE" />
        <Tab label="TOEFL" />
      </Tabs>
      {wordData && (
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', maxWidth: '600px' }}>
          <Typography variant="h5">{wordData.Word}</Typography>
          <Typography variant="subtitle1">{wordData.PartOfSpeech}</Typography>
          <Typography>{wordData.Description}</Typography>
          <Typography variant="body2" color="textSecondary">Example: {wordData.Example}</Typography>
          <Typography variant="caption" display="block" gutterBottom>Source: {wordData.Source}</Typography>
        </Paper>
      )}
    </Box>
  );
}

export default HomePage;
