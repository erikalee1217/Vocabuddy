import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';

import { word } from '../../Types'

axios.defaults.baseURL = 'http://35.208.70.236/';

const Word = () => {
  const { testId, wordId } = useParams<{ testId: string, wordId: string }>();
  const [wordDetails, setWordDetails] = useState<word[]>([]); // Adjusted to hold an array

  useEffect(() => {
    const fetchWordDetails = async () => {
      try {
        const response = await axios.get('/api/Word', { params: {TestId: testId, WordId: wordId }});
        setWordDetails(response.data); // Set the entire array
        console.log(response);
      } catch (error) {
        console.error('Error fetching word details:', error);
      }
    };

    fetchWordDetails();
  }, [testId, wordId]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      {wordDetails.map((word, index) => (
        <Card key={index} sx={{ minWidth: 275, maxWidth: 600, mt: 5, mb: 2 }}> {/* Added key and margin between cards */}
          <CardContent>
            <Typography variant="h4" gutterBottom component="div" color="primary">
              {word.Word}
            </Typography>
            <Chip label={word.PartOfSpeech} color="secondary" sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {word.Description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Stem:</strong> {word.Stem}
            </Typography>
            <Typography variant="body1">
              <strong>Example:</strong> {word.Example}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Word;
