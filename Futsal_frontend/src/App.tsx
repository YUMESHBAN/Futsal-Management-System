import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import FutsalList from "./pages/FutsalList";
import EditFutsal from "./pages/EditFutsal";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateFutsal from "./pages/CreateFutsal";
import MyFutsals from "./pages/MyFutsals";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/edit-futsal/:id" element={<EditFutsal />} />
        <Route path="/futsals" element={<FutsalList />} />
        <Route path="/create-futsal" element={<CreateFutsal />} />
        <Route path="/my-futsal" element={<MyFutsals />} />

        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
