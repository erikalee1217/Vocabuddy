import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';


import Header from './Components/Header/Header';
import HomePage from './Components/HomePage/HomePage';
import Words from './Components/Words/Words';
import Word from './Components/Words/Word';
import Schools from './Components/Schools/Schools';
import School from './Components/Schools/School';
import Statistics from './Components/Statistics/Statistics'
import Demo from './Components/Demo/Demo'

import Study from './Components/Study/Study';
import Progress from './Components/Progress/Progress';
import Friends from './Components/Friends/Friends'
import LoginView from './Components/Login/loginView'
import UserView from './Components/Profile/profileView'
import SignupView from './Components/Signup/signupView'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/words/:testId" element={<Words></Words>}></Route>
          <Route path="/words/:testId/:wordId" element={<Word />} />
          <Route path="/schools" element={<Schools></Schools>}></Route>
          <Route path="/schools/:schoolId" element={<School></School>}></Route>
          <Route path="/stats" element={<Statistics></Statistics>}></Route>
          <Route path="/demo" element={<Demo></Demo>}></Route>
          

          <Route path="/study/" element={<Study></Study>}></Route>
          <Route path="/progress/:Email" element={<Progress></Progress>}></Route>
          <Route path="/friends" element={<Friends></Friends>}></Route>



          <Route path="/login" element={<LoginView></LoginView>}></Route>
          <Route path="/profile" element={<UserView></UserView>}></Route>
          <Route path="/signup" element={<SignupView></SignupView>}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

 
