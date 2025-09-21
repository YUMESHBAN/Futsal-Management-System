import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";

// Define interface for DashboardCard props
interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  color: string;
}

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_type = localStorage.getItem("user_type");
    const user_name = localStorage.getItem("username");

    if (!token) {
      navigate("/login");
    } else {
      setUsername(user_name || "");
      setUserType(user_type || "");
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {username}!
            </h2>
            <p className="text-green-100">
              {userType === "owner"
                ? "Manage your futsal venues and time slots efficiently."
                : "Discover futsal venues, manage your team, and join competitive matches."}
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Owner Dashboard */}
            {userType === "owner" ? (
              <>
                <DashboardCard
                  title="Create Futsal"
                  description="Add a new futsal venue to your portfolio"
                  icon="🏟️"
                  onClick={() => navigate("/create-futsal")}
                  color="from-blue-500 to-blue-600"
                />
                <DashboardCard
                  title="View My Futsals"
                  description="Manage your existing futsal venues"
                  icon="👀"
                  onClick={() => navigate("/my-futsal")}
                  color="from-green-500 to-green-600"
                />
                <DashboardCard
                  title="Generate Time Slots"
                  description="Create available time slots for bookings"
                  icon="⏰"
                  onClick={() => navigate("/generate-slots")}
                  color="from-orange-500 to-orange-600"
                />
                <DashboardCard
                  title="Manage Time Slots"
                  description="Edit or remove existing time slots"
                  icon="🛠️"
                  onClick={() => navigate("/manage-slots")}
                  color="from-indigo-500 to-indigo-600"
                />
                <DashboardCard
                  title="View All Time Slots"
                  description="See all available time slots across venues"
                  icon="📋"
                  onClick={() => navigate("/time-slots")}
                  color="from-cyan-500 to-cyan-600"
                />
                <DashboardCard
                  title="Enter Match Results"
                  description="Record results for completed matches"
                  icon="📊"
                  onClick={() => navigate("/match-results")}
                  color="from-pink-500 to-pink-600"
                />
                <DashboardCard
                  title="Finalize Competitive Matches"
                  description="Complete competitive match proceedings"
                  icon="🏆"
                  onClick={() => navigate("/finalize-matches")}
                  color="from-purple-500 to-purple-600"
                />
              </>
            ) : (
              /* Player Dashboard */
              <>
                <DashboardCard
                  title="View All Futsals"
                  description="Browse all available futsal venues"
                  icon="🔍"
                  onClick={() => navigate("/all-futsals")}
                  color="from-green-500 to-green-600"
                />
                <DashboardCard
                  title="Create My Team"
                  description="Form your own futsal team"
                  icon="👥"
                  onClick={() => navigate("/create-team")}
                  color="from-purple-500 to-purple-600"
                />
                <DashboardCard
                  title="View My Team"
                  description="Manage your team details and members"
                  icon="ℹ️"
                  onClick={() => navigate("/my-team")}
                  color="from-indigo-500 to-indigo-600"
                />
                <DashboardCard
                  title="Invite Team for Match"
                  description="Challenge another team to a match"
                  icon="📩"
                  onClick={() => navigate("/invite-team")}
                  color="from-yellow-500 to-yellow-600"
                />
                <DashboardCard
                  title="View My Matches"
                  description="See your upcoming and past matches"
                  icon="📅"
                  onClick={() => navigate("/matches")}
                  color="from-gray-600 to-gray-700"
                />
                <DashboardCard
                  title="View My Team Rating"
                  description="Check your team's competitive rating"
                  icon="⭐"
                  onClick={() => navigate("/my-competitive-status")}
                  color="from-green-600 to-green-700"
                />
                <DashboardCard
                  title="Competitive Invitations"
                  description="View and respond to match invitations"
                  icon="🏅"
                  onClick={() => navigate("/competitive-center")}
                  color="from-pink-500 to-pink-600"
                />
                <DashboardCard
                  title="Competitive Leaderboard"
                  description="See where your team ranks"
                  icon="📈"
                  onClick={() => navigate("/competitive-leaderboard")}
                  color="from-orange-500 to-orange-600"
                />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DashboardCard({
  title,
  description,
  icon,
  onClick,
  color,
}: DashboardCardProps) {
  return (
    <div
      className={`bg-gradient-to-r ${color} rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg`}
      onClick={onClick}
    >
      <div className="p-6 text-white">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-white/90 text-sm">{description}</p>
        <div className="mt-4 flex justify-end">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
