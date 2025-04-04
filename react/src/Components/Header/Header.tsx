import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';
import './Header.css'; // Make sure the CSS supports the layout
import { useAuth } from '../../AuthContext'; // Ensure the path is correct

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        setUser(JSON.parse(savedUser)[0]);
    }
  }, []);


  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/">Vocabuddy</Button>
        <Button color="inherit" component={Link} to="/words/0">Words</Button>
        <Button color="inherit" component={Link} to="/schools">Schools</Button>
        <Button color="inherit" component={Link} to="/stats">Statistics</Button>
        {/* <Button color="inherit" component={Link} to="/demo">Demo</Button> */}

        <div className="spacer"></div>
        {isLoggedIn ? (
          <>
            <Button color="inherit" component={Link} to="/profile" >Profile</Button>
            <Button color="inherit" component={Link} to={`/progress/${user.Email}`}>Progress</Button>
            <Button color="inherit" component={Link} to="/study">Study</Button>
            <Button color="inherit" component={Link} to="/friends">Friends</Button>
            <Button color="inherit" onClick={() => {
                logout(); // Log in using the context's login function
                navigate('/'); // Redirect after login
            }}>Log Out</Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">Log In / Sign Up</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
