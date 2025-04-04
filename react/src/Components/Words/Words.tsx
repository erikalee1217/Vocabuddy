import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Button, Tabs, Tab, TextField, Grid, styled } from '@mui/material';

import { word } from "../../Types"

enum TestId {
  GRE = 0,
  TOEFL = 3,
}

axios.defaults.baseURL = 'http://35.208.70.236/';

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%', // Grid will handle the width
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[10],
    backgroundColor: theme.palette.action.hover,
  },
}));

const BoldTypography = styled(Typography)({
  fontWeight: 'bold',
});

const Words: React.FC = () => {
  const [words, setWords] = useState<word[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(TestId.GRE);

  useEffect(() => {
    fetchWords();
  }, [currentPage, activeTab, searchQuery]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: TestId) => {
    setActiveTab(newValue);
    setCurrentPage(0);
  };

  const fetchWords = async () => {
    const pageSize = 20;
    const s_WordId = currentPage * pageSize;
    const e_WordId = (currentPage + 1) * pageSize;
    const apiUrl = searchQuery ? '/api/search/Word/' : '/api/Words/';
    try {
      const response = await axios.get<word[]>(apiUrl, { 
        params: searchQuery ? { Word: searchQuery } : { TestId: activeTab, s_WordId, e_WordId }
      });
      setWords(response.data);
    } catch (error) {
      console.error('Failed to fetch words:', error);
      setWords([]);
    }
  };

  const handleWordClick = (wordId: number | undefined, testId: number | undefined) => {
    if (typeof wordId === 'number' && typeof testId === 'number') {
      navigate(`/words/${testId}/${wordId}`);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0); // Reset to the first page when search query changes
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TextField
        fullWidth
        label="Search Words"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        margin="normal"
        sx={{ maxWidth: '500px' }} // Set a max width for better aesthetics and centering
      />
      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ width: '100%' }}>
        <Tab label="GRE" value={TestId.GRE} />
        <Tab label="TOEFL" value={TestId.TOEFL} />
      </Tabs>
      <Grid container spacing={2} sx={{ maxWidth: 1200, margin: 'auto', marginTop: 2 }}> {/* Grid container to manage layout */}
        {words.map((word, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${word.WordId}-${currentPage}`}> {/* Grid item for each card */}
            <StyledCard onClick={() => handleWordClick(word.WordId, word.TestId)}>
              <CardContent>
                <BoldTypography variant="h6">{word.Word}</BoldTypography>
                <Typography variant="subtitle2" color="textSecondary">{word.Stem}</Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      {searchQuery === '' && (
        <Box display="flex" justifyContent="center" my={2}>
          <Button onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))} disabled={currentPage === 0}>
            Previous
          </Button>
          <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={words.length < 20}>
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Words;
