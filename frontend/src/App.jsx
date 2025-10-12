import React from 'react';
import { useAuth } from './content/AuthContext';
import AuthPage from './pages/AuthPage'; 
import Dashboard from './pages/Dashboard'; 

function App() {
  const { user } = useAuth(); // Lấy user từ Context

  return (
    <div className="App">
      {/* Nếu user tồn tại, hiển thị Dashboard. Ngược lại, hiển thị AuthPage. */}
      {user ? <Dashboard /> : <AuthPage />}
    </div>
  );
}

export default App;