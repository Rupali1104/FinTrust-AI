import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/NavBar";
import Home from "./pages/Home";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import Results from './pages/Results';
import { Footer } from "./components/layout/Footer";
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes without Navbar and Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Routes with Navbar and Footer */}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/services" element={
          <>
            <Navbar />
            <Services />
            <Footer />
          </>
        } />
        <Route path="/howitworks" element={
          <>
            <Navbar />
            <HowItWorks />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
