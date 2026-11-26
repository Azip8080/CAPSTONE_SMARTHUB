
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub/KnowledgeHub";
import Events from "./pages/Events/Events";
import SDGHighlights from "./pages/SDGHighlights/SDGHighlights";
import Login from "./pages/Login";
import About from "./pages/About/About";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import SubmitProject from "./pages/SubmitProject";
import SubmitEvent from "./pages/SubmitEvent";
import MySubmissions from "./pages/MySubmissions";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/highlights" element={<SDGHighlights />} />
            <Route path="/events" element={<Events />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/about" element={<About />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/submit-project" element={<SubmitProject />} />
            <Route path="/submit-event" element={<SubmitEvent />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
          </Routes>

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
