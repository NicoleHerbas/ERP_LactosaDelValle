import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import RRHH from './pages/RRHH';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lactosa del Valle ERP</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/rrhh" className="hover:underline">RRHH</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rrhh" element={<RRHH />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
