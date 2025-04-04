import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Tabs, Tab, Divider, useTheme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WordIcon from '@mui/icons-material/TextFields';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';

import { pop_word, pop_school, num_user } from '../../Types';

axios.defaults.baseURL = 'http://35.208.70.236/';

const SiteStatistics = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0); // 0 for GRE, 1 for TOEFL
  const [popularWord, setPopWord] = useState<pop_word | null>(null);
  const [popularSchool, setPopSchool] = useState<pop_school | null>(null);
  const [numUsers, setNumUser] = useState<num_user | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchPopWord = async () => {
      const TestId = activeTab === 0 ? 0 : 3;
      try {
        const response = await axios.get('/api/Stat/popular-word', { params: {TestId: TestId }});
        setPopWord(response.data[0]);
      } catch (error) {
        console.error('Error fetching word details:', error);
      }
    };

    fetchPopWord();
  }, [activeTab]);

  useEffect(() => {
    const fetchPopSchool = async () => {
      try {
        const response = await axios.get('/api/Stat/popular-school');
        setPopSchool(response.data[0]);
      } catch (error) {
        console.error('Error fetching school details:', error);
      }
    };

    fetchPopSchool();
  }, []);

  useEffect(() => {
    const fetchNumUsers = async () => {
      try {
        const response = await axios.get('/api/Stat/num-users');
        setNumUser(response.data[0]);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchNumUsers();
  }, []);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      bgcolor: theme.palette.background.default
    }}>
      <Card sx={{ width: '100%', maxWidth: 600, boxShadow: 6, m: 2 }}>
        <CardHeader
          title="Site Statistics"
          titleTypographyProps={{ align: 'center', variant: 'h4', color: 'primary.main' }}
          action={
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: -3 }}>
              <Tab label="GRE" />
              <Tab label="TOEFL" />
            </Tabs>
          }
          sx={{ paddingBottom: 0 }}
        />
        <CardContent>
          {popularWord && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <WordIcon color="primary" />
                <Typography variant="h6" component="div">
                  Most Popular Word: {popularWord.Word}
                </Typography>
              </Box>
            </>
          )}
          {popularSchool && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon color="secondary" />
                <Typography variant="h6">
                  Most Popular School: {popularSchool.SchoolName}
                </Typography>
              </Box>
            </>
          )}
          {numUsers && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="action" />
                <Typography variant="h6">
                  Number of Users: {numUsers.UserCount}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SiteStatistics;
