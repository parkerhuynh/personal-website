import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import { AuthProvider } from "./components/AuthContext"
import Login from './components/Login';
import Signup from './components/Signup';
import Progress from './pages/progress/Progress';
import ForgotPassword from "./components/ForgotPassword"

const App = () => {
  return (
    <>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
        </Route>
      </Routes>
      </AuthProvider>
    </>
  );
};

export default App;