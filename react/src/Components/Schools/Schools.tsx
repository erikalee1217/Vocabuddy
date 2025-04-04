import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { school } from '../../Types';  // Ensure your School type has a non-optional SchoolId of type number

axios.defaults.baseURL = 'http://35.208.70.236/';

function Schools() {
  const [schools, setSchools] = useState<school[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools();
  }, [currentPage]);

  const fetchSchools = async () => {
    const pageSize = 20;
    const s_SchoolId = currentPage * pageSize;
    const e_SchoolId = (currentPage + 1) * pageSize;
    try {
      const response = await axios.get(`/api/Schools/`, { 
        params: { s_SchoolId, e_SchoolId }
      });
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      setSchools([]);
    }
  };

  const handleSchoolClick = (schoolId: number | undefined) => {
    if (typeof schoolId === 'number') {
      navigate(`/schools/${schoolId}`);
    }
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <List>
        {schools.map((school) => (
          <ListItemButton key={school.SchoolId} onClick={() => handleSchoolClick(school.SchoolId)}>
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  {school.SchoolName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                  Rank: {school.SchoolRank}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {school.Score}
                </Typography>
              </CardContent>
            </Card>
          </ListItemButton>
        ))}
      </List>
      <Box display="flex" justifyContent="center" my={2}>
        <Button onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))} disabled={currentPage === 0}>
          Previous
        </Button>
        <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={schools.length < 20}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Schools;
