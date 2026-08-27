import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConsentList from './pages/ConsentList';
import ConsentDetail from './pages/ConsentDetail';
import ConsentForm from './pages/ConsentForm';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/consents"  element={<ProtectedRoute><ConsentList /></ProtectedRoute>} />
        <Route path="/consents/new"      element={<ProtectedRoute><ConsentForm /></ProtectedRoute>} />
        <Route path="/consents/:id"      element={<ProtectedRoute><ConsentDetail /></ProtectedRoute>} />
        <Route path="/consents/:id/edit" element={<ProtectedRoute><ConsentForm /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
