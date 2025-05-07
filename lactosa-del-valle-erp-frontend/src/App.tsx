import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Employees from './pages/Employees';

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
                <Link to="/employees" className="hover:underline">Employees</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/employees" element={<Employees />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

