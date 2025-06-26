import React, { useEffect, useState } from "react";
import api from "../api/axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("user/")
      .then((res) => setUser(res.data))
      .catch((err) => alert("Not logged in"));
  }, []);

  return (
    <div>{user ? <h2>Welcome, {user.username}</h2> : <p>Loading...</p>}</div>
  );
};

export default Dashboard;
