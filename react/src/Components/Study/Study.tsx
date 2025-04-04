import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Grid, Tab, Tabs, Collapse, CardActions } from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { word_progress, word } from '../../Types';  // Ensure your School type has a non-optional SchoolId of type number

axios.defaults.baseURL = 'http://35.208.70.236/';


function Study() {
  const [words, setWords] = useState<word_progress[]>([]);
  const [wordDetails, setWordDetails] = useState<word[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);  // 0 for GRE, 1 for TOEFL

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const rawData = sessionStorage.getItem('user');
    if (rawData) {
        const savedData = JSON.parse(rawData);
        if (savedData && savedData[0]) {
            setUser(savedData[0]);
        }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [activeTab, user]);

  const fetchWords = async () => {
    const TestId = activeTab === 0 ? 0 : 3;
    try {
      const response = await axios.get('/api/Study', { 
        params: {
          Email: user.Email, TestId:TestId
        }
      });
      
      const processedWords = response.data.map((word: any) => ({
        ...word,
        Learn: word.Learned !== undefined ? word.Learned : false, // Default to 0 if not provided
      }));

      setWords(processedWords);

    } catch (error) {
      console.error('Failed to fetch words:', error);
      setWords([]);
    }
  };

  const handleLearnClick = (word_progress: word_progress) => {    
    const updateLearningProgress = (currentPercent: number): number => {
      // Calculate the increment based on an exponentially decaying function
      const distanceFromMax = 100 - currentPercent;
      const increment = Math.max(3, distanceFromMax * 0.2); // Ensuring minimum increment is 1
  
      // Update the PercentLearned, ensuring it doesn't exceed 100
      return Math.min(Math.round(currentPercent + increment), 100);
    };
    
    // Calculate the new percent learned before the API call
    axios.post('/api/Learns/modify', {
      Email: user.Email,
      TestId: activeTab === 0 ? 0 : 3,
      WordId: word_progress.WordId,
      PercentLearned: updateLearningProgress(word_progress.PercentLearned),
      LastLearnedTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }) 
    .then(() => {
      console.log('Learning progress updated');
      // Ensure we use newPercentLearned within the scope it's defined
      const newPercentLearned = updateLearningProgress(word_progress.PercentLearned);
      setWords(words.map(word => {
          if (word.WordId === word_progress.WordId && word.TestId === word_progress.TestId) {
              // Also update PercentLearned here, using newPercentLearned directly
              return { ...word, Learned: true, PercentLearned: newPercentLearned, LastLearnedTime: new Date().toISOString() };
          }
          return word;
      }));
    })
    .catch((error) => console.error('Failed to update learning progress:', error));
  };
  
  

  const handleDetailsClick = async (word_progress: word_progress) => {
    const TestId = activeTab === 0 ? 0 : 3;
    console.log(wordDetails);
    if (wordDetails) {
      console.log(wordDetails);
    }
    console.log(word_progress.WordId);
    // Check if the details are already showing for this word, and toggle them if so
    if (wordDetails && wordDetails[0] && wordDetails[0].Word === word_progress.Word) {
        setWordDetails([]); // Toggle off if the same details are currently shown
        console.log("OFF");
        return; // Exit the function early
    }

    try {
        const response = await axios.get('/api/Word', { 
            params: {
                WordId: word_progress.WordId,
                TestId: TestId
            }
        });
        setWordDetails(response.data);
    } catch (error) {
        console.error('Failed to fetch word details:', error);
        setWordDetails([]);
    }
  };

  return (
    <Box sx={{ width: '90%', overflowX: 'hidden', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginX: "20%" }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="GRE" />
        <Tab label="TOEFL" />
      </Tabs>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => window.location.reload()}
        sx={{ marginRight: 2 }}
      >
        Refresh
      </Button>
    </Box>
      
      <Grid container spacing={1} sx={{ justifyContent: 'center', margin: 'auto', mt: 1 }}>
        {words.map((word) => (
          <Grid item key={word.Word} xs={12} sm={6} md={4}>
            <Card sx={{ minWidth: 275, maxWidth: 400, m: 1, transition: '0.3s', boxShadow: 3}}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography variant="h5" component="div" color="primary" gutterBottom>
                  {word.Word}
                </Typography>
                <Chip label={`${word.PercentLearned}%`} color="secondary" sx={{ mb: 2 }} />
                <Typography variant="body1">
                  <strong>Last Learned:</strong> {`${formatDistanceToNow(parseISO(word.LastLearnedTime))} ago`}
                </Typography>
              </Box>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  disabled={word.Learned} 
                  onClick={() => handleLearnClick(word)}
                  startIcon={<i className="fas fa-learn"></i>}
                  sx={{ mx: 1 }}
                >
                  Learn
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => handleDetailsClick(word)}
                  startIcon={<i className="fas fa-info-circle"></i>}
                  sx={{ mx: 1 }}
                >
                  Details
                </Button>
              </CardActions>
              </Box>
              <Collapse in={wordDetails && wordDetails[0] && wordDetails[0].Word === word.Word}>
              <CardContent>
                  {wordDetails.map((detail, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', mb: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>{detail.Word}</Typography>
                      <Chip label={detail.PartOfSpeech} color="secondary" />
                      <Typography><strong>Description:</strong> {detail.Description}</Typography>
                      <Typography><strong>Stem:</strong> {detail.Stem}</Typography>
                      <Typography><strong>Example:</strong> {detail.Example}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Study;

