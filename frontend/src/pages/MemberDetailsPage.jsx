import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

function MemberDetailsPage() {
  const { id } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/members/${id}`);
        setMember(response.data);
      } catch (requestError) {
        setError("Could not load member details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id]);

  return (
    <div className="page">
      <div className="card details-card">
        {loading && <p className="info-text">Loading member details...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && member && (
          <>
            <img
              src={`${API_BASE_URL}/uploads/${member.image}`}
              alt={member.name}
              className="details-image"
            />

            <h1>{member.name}</h1>
            <p className="detail-row">
              <strong>Role:</strong> {member.role}
            </p>
            <p className="detail-row">
              <strong>Email:</strong> {member.email}
            </p>

            <div className="button-group">
              <Link to="/members" className="button secondary-button">
                Back to Members
              </Link>

              <Link to="/" className="button">
                Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MemberDetailsPage;
