import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import { AuthProvider } from "./components/AuthContext"
import Login from './components/Login';
import Signup from './components/Signup';
import Progress from './pages/personality/progress/Progress';
import ForgotPassword from "./components/ForgotPassword"
import Deadlines from './pages/personality/deadlines/Deadlines';
// import Scheduler from './pages/personality/scheduler/scheduler';

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
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="/scheduler" element={<Scheduler />} /> */}
          
        </Route>
      </Routes>
      </AuthProvider>
    </>
  );
};

export default App;