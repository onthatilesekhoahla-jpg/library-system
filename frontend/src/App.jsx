import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute roles={['admin', 'librarian']}><Books /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute roles={['admin', 'librarian']}><Transactions /></ProtectedRoute>} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
