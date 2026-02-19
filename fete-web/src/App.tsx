import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventPageNew from './pages/EventPageNew';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/e/:code" element={<EventPageNew />} />
      </Routes>
    </BrowserRouter>
  );
}
