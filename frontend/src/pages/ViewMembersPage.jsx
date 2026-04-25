import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import MemberCard from "../components/MemberCard";
import { API_BASE_URL } from "../config";

function ViewMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/members`);
        setMembers(response.data);
      } catch (requestError) {
        setError("Could not load members.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="page">
      <div className="content-box">
        <h1>View Members</h1>
        <p className="page-text">All saved student team members are shown below.</p>

        <div className="top-actions">
          <Link to="/" className="text-link">
            Back to Home
          </Link>

          <Link to="/add-member" className="button">
            Add Another Member
          </Link>
        </div>

        {loading && <p className="info-text">Loading members...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && members.length === 0 && (
          <p className="info-text">No members added yet.</p>
        )}

        <div className="members-grid">
          {members.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewMembersPage;
