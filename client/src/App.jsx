import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub/KnowledgeHub";
import Events from "./pages/Events/Events";
import SDGHighlights from "./pages/SDGHighlights/SDGHighlights";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/highlights" element={<SDGHighlights />} />
        <Route path="/events" element={<Events />} />
        <Route path="/" element={<Home />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;