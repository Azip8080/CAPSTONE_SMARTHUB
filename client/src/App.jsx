import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub/KnowledgeHub";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;