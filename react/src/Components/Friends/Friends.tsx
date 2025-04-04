import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { friend_progress } from '../../Types';

const Friends: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [friendsData, setFriendsData] = useState<Map<string, friend_progress[]>>(new Map());

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
      const fetchFriends = async () => {
        try {
          const response = await axios.get('/api/IsFriendWith', { params: { Email: user.Email } });
          const friendsMap = new Map<string, friend_progress[]>();
          response.data.forEach((item: friend_progress) => {
            const entries = friendsMap.get(item.FriendEmail) || [];
            friendsMap.set(item.FriendEmail, [...entries, item]);
          });
          setFriendsData(friendsMap);
        } catch (error) {
          console.error('Failed to fetch friends:', error);
        }
      };
      fetchFriends();
    }
  }, [user]);

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Paper elevation={3} style={{ margin: '16px', padding: '16px' }}>
      <Typography variant="h6" component="div" style={{ marginBottom: '12px' }}>
        Friends List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell align="right">GRE Progress</TableCell>
              <TableCell align="right">TOEFL Progress</TableCell>
              <TableCell align="right">Last Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(friendsData.entries()).map(([email, records]) => {
              const greProgress = records.find(r => r.TestId === 0)?.Progress || 'N/A';
              const toeflProgress = records.find(r => r.TestId === 3)?.Progress || 'N/A';
              const lastActive = formatDate(records.sort((a, b) => new Date(b.LastActiveTime).getTime() - new Date(a.LastActiveTime).getTime())[0].LastActiveTime);
              return (
                <TableRow key={email}>
                  <TableCell component="th" scope="row">
                    {email}
                  </TableCell>
                  <TableCell align="right">{greProgress}%</TableCell>
                  <TableCell align="right">{toeflProgress}%</TableCell>
                  <TableCell align="right">{lastActive}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Friends;
