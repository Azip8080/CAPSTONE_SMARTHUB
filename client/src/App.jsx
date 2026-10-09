import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub/KnowledgeHub";
import Events from "./pages/Events/Events";
import SDGHighlights from "./pages/SDGHighlights/SDGHighlights";
import Login from "./pages/Login";
import About from "./pages/About/About";
import Signup from "./pages/Signup";
import Footer from "./components/Footer/Footer";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <div className="content">
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/highlights" element={<SDGHighlights />} />
            <Route path="/events" element={<Events />} />
            <Route path="/" element={<Home />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;