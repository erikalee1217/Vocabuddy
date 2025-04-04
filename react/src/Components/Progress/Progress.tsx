import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { recent, least, progress } from '../../Types';

axios.defaults.baseURL = 'http://35.208.70.236/';

function Progress() {
  const [activeTest, setActiveTest] = useState<string>('GRE'); // 'GRE' or 'TOEFL'
  const [recentWords, setRecentWords] = useState<recent[]>([]);
  const [leastLearnedWords, setLeastLearnedWords] = useState<least[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<progress[]>([]);

  const { Email } = useParams<{ Email: string }>();

  useEffect(() => {
    const testId = activeTest === 'GRE' ? 0 : 3;

    const fetchData = async () => {
      try {
        const [recentRes, leastRes, progressRes] = await Promise.all([
          axios.get(`/api/Learns/recent`, { params: { Email, num_words: 10 } }),
          axios.get(`/api/Learns/least`, { params: { Email, TestId: testId, num_words: 10 } }),
          axios.get(`/api/Learns/progress`, { params: { Email, TestId: testId } })
        ]);
        setRecentWords(recentRes.data);
        setLeastLearnedWords(leastRes.data);
        setProgressPercentage(progressRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (Email) fetchData();
  }, [Email, activeTest]);

  const handleTestChange = (event: React.MouseEvent<HTMLElement>, newTest: string) => {
    if (newTest) {
      setActiveTest(newTest);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, typography: 'body1', padding: 2 }}>
      <Box sx={{ padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <ToggleButtonGroup
              value={activeTest}
              exclusive
              onChange={handleTestChange}
              fullWidth
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <ToggleButton value="GRE">GRE</ToggleButton>
              <ToggleButton value="TOEFL">TOEFL</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
              {progressPercentage.map((test, index) => (
                <React.Fragment key={index}>
                  
                  <Typography component="span" color="primary">
                    Progress: {test.Progress}%
                  </Typography>
                  {index < progressPercentage.length - 1 && <br />}
                </React.Fragment>
              ))}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recently Learned Words
            </Typography>
            <List>
              {recentWords.map((word, index) => (
                <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText primary={word.Word} />
                  <Typography variant="body2">
                    {`${formatDistanceToNow(parseISO(word.LastLearnedTime))} ago`}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Words to Improve
            </Typography>
            <List>
              {leastLearnedWords.map((word, index) => (
                <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText primary={word.Word} />
                  <Typography variant="body2">
                    {`Learned: ${word.PercentLearned}%`}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Progress;
