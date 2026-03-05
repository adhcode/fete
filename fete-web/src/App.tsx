import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventPageStoryFirst from './pages/EventPageStoryFirst';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NewEventPage from './pages/NewEventPage';
import NewTemplatePage from './pages/NewTemplatePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/e/:code" element={<EventPageStoryFirst />} />
        
        {/* Organizer Routes */}
        <Route path="/org/login" element={<LoginPage />} />
        <Route path="/org/signup" element={<SignupPage />} />
        <Route path="/org/dashboard" element={<DashboardPage />} />
        <Route path="/org/events/new" element={<NewEventPage />} />
        <Route path="/org/templates/new" element={<NewTemplatePage />} />
      </Routes>
    </BrowserRouter>
  );
}
