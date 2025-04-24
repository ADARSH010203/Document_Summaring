import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Upload from './pages/Upload';
import Audience from './pages/Audience';
import Preview from './pages/Preview';
import Export from './pages/Export';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
