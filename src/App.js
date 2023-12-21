import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import { AuthProvider } from "./components/AuthContext"
import Login from './components/Login';
import Signup from './components/Signup';
import Progress from './pages/personality/progress/Progress';
import ForgotPassword from "./components/ForgotPassword"

import Deadlines from './pages/personality/deadlines/Deadlines';
import Papers from './pages/personality/papers/Papers';
import PaperInfo from './pages/personality/papers/PaperInfo';
import ListToDo from './pages/personality/list_todo/ListToDo';
import SpeakingPara from './pages/English/Speaking/paragraphs/Paragraphs'

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
          <Route path="/papers" element={<Papers />} />
          <Route path="paperinfo/:paper_id" element={<PaperInfo />} />
          <Route path="/list_todo" element={<ListToDo />} />
          <Route path="/speaking_para" element={<SpeakingPara />} />

        </Route>
      </Routes>
      </AuthProvider>
    </>
  );
};

export default App;