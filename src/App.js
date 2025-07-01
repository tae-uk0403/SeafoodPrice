import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { ReactPlugin } from '@stagewise-plugins/react';
import Dashboard from './components/Dashboard';
import FishPricePage from './components/FishPricePage';
import './App.css';

function App() {
  return (
    <>
      <StagewiseToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      />
      <Router future={{ v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fish-prices" element={<FishPricePage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App; 