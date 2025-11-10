import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import PrivateRoute from './components/Common/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ItemsList from './pages/Items/ItemsList.jsx';
import CategoriesList from './pages/Categories/CategoriesList.jsx';
import SalesList from './pages/Sales/SalesList.jsx';
import UserList from './pages/Users/UserList.jsx';
import Reports from './pages/Reports.jsx';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/items" 
                element={
                  <PrivateRoute>
                    <ItemsList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/categories" 
                element={
                  <PrivateRoute adminOnly={true}>
                    <CategoriesList />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/unauthorized" element={<div>Unauthorized</div>} />
              
              <Route path="/sales" element={<SalesList />} />
              <Route 
                path="/users" 
                element={
                  <PrivateRoute adminOnly={true}>
                    <UserList />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;