import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import App from './App';
import Connect from './Components/Connect';
import Today from './Components/Today';
import Calendar from './Components/Calendar';
import Unscheduled from './Components/Unscheduled';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} >
        <Route path="/"  element={<Navigate replace to="/today"/>} />
        <Route path="/today/*" element={<Today />} />
        <Route path="/calendar/*" element={<Calendar />} />
        <Route path="/unscheduled/*" element={<Unscheduled />} />
      </Route>    
      <Route path="/connect" element={<Connect />} />
    </Routes>
  </Router>
);

