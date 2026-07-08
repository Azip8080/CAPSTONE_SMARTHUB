import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub/KnowledgeHub";
import Events from "./pages/Events/Events";
import SDGHighlights from "./pages/SDGHighlights/SDGHighlights";
import Login from "./pages/Login"
import About from "./pages/About/About";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <BrowserRouter>
    <div className="app ">
      <Navbar />
      
      <div className="content">
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/highlights" element={<SDGHighlights />} />
        <Route path="/events" element={<Events />} />
        <Route path="/" element={<Home />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
       <Footer />
      </div>

    </div>
    </BrowserRouter>
  );
}

export default App;