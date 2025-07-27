import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import CreateTeam from "./pages/CreateTeam";
import MyTeam from "./pages/MyTeam";

import FutsalList from "./pages/FutsalList";
import EditFutsal from "./pages/EditFutsal";
import CreateFutsal from "./pages/CreateFutsal";
import MyFutsals from "./pages/MyFutsals";
import AllFutsals from "./pages/AllFutsals";

import InviteTeam from "./pages/InviteTeam";
import MatchHistory from "./pages/MatchHistory";
import MatchResults from "./pages/MatchResults"; // adjust the path if needed

import TimeSlotBooking from "./pages/TimeSlotBooking";
import ManageSlots from "./pages/ManageSlots";
import AutoSlotGenerator from "./pages/AutoSlotGenerator";
import ViewTimeSlots from "./pages/ViewTimeSlots";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/my-team" element={<MyTeam />} />

        <Route path="/edit-futsal/:id" element={<EditFutsal />} />
        <Route path="/futsals" element={<FutsalList />} />
        <Route path="/create-futsal" element={<CreateFutsal />} />
        <Route path="/my-futsal" element={<MyFutsals />} />
        <Route path="/all-futsals" element={<AllFutsals />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Login />} />

        <Route path="/invite-team" element={<InviteTeam />} />
        <Route path="/matches" element={<MatchHistory />} />
        <Route path="/match-results" element={<MatchResults />} />

        <Route path="/book-slot" element={<TimeSlotBooking />} />
        <Route path="/manage-slots" element={<ManageSlots />} />
        <Route path="/generate-slots" element={<AutoSlotGenerator />} />
        <Route path="/time-slots" element={<ViewTimeSlots />} />
      </Routes>
    </Router>
  );
}
