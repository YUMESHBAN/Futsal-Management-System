import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home & Dashboard/Home";
import About from "./pages/Landing Page/About";
import Contact from "./pages/Landing Page/Contact";
import Register from "./pages/Landing Page/Register";
import Login from "./pages/Landing Page/Login";

import Dashboard from "./pages/Home & Dashboard/Dashboard";

import CreateTeam from "./pages/Friendly/CreateTeam";
import MyTeam from "./pages/Friendly/MyTeam";

import EditFutsal from "./pages/Futsal Owner/EditFutsal";
import CreateFutsal from "./pages/Futsal Owner/CreateFutsal";
import MyFutsals from "./pages/Futsal Owner/MyFutsals";
import AllFutsals from "./pages/Friendly/AllFutsals";

import InviteTeam from "./pages/Friendly/InviteTeam";
import MatchHistory from "./pages/Friendly/MatchHistory";
import PaymentSuccess  from "./pages/Friendly/PaymentSuccess";
import PaymentFailure   from "./pages/Friendly/PaymentFailure";


import MatchResults from "./pages/Match result/MatchResults";

import TimeSlotBooking from "./pages/Timeslots Management/TimeSlotBooking";
import ManageSlots from "./pages/Timeslots Management/ManageSlots";
import AutoSlotGenerator from "./pages/Futsal Owner/AutoSlotGenerator";
import ViewTimeSlots from "./pages/Timeslots Management/ViewTimeSlots";

import CompetitiveStatus from "./pages/Competitive/CompetitiveStatus";
import RecommendOpponent from "./pages/Friendly/RecommendOpponent";
import CompetitiveMatchCenter from "./pages/Competitive/CompetitiveMatchCenter";
import OwnerMatchFinalization from "./pages/Match result/OwnerMatchFinalization";
import CompetitiveLeaderboard from "./pages/Competitive/CompetitiveLeaderboard";

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
        <Route path="/create-futsal" element={<CreateFutsal />} />
        <Route path="/my-futsal" element={<MyFutsals />} />
        <Route path="/all-futsals" element={<AllFutsals />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Login />} />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/invite-team" element={<InviteTeam />} />
        <Route path="/matches" element={<MatchHistory />} />
        <Route path="/match-results" element={<MatchResults />} />
        <Route path="/book-slot" element={<TimeSlotBooking />} />
        <Route path="/manage-slots" element={<ManageSlots />} />
        <Route path="/generate-slots" element={<AutoSlotGenerator />} />
        <Route path="/time-slots" element={<ViewTimeSlots />} />

        <Route path="/my-competitive-status" element={<CompetitiveStatus />} />
        <Route path="/recommend-opponent" element={<RecommendOpponent />} />
        <Route
          path="/competitive-center"
          element={<CompetitiveMatchCenter />}
        />
        <Route path="/finalize-matches" element={<OwnerMatchFinalization />} />
        <Route
          path="/competitive-leaderboard"
          element={<CompetitiveLeaderboard />}
        />
      </Routes>
    </Router>
  );
}
