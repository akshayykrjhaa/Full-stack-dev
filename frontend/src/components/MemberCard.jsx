import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function MemberCard({ member }) {
  const navigate = useNavigate();

  return (
    <div className="member-card">
      <img
        src={`${API_BASE_URL}/uploads/${member.image}`}
        alt={member.name}
        className="member-image"
      />

      <h3>{member.name}</h3>
      <p>{member.role}</p>

      <div className="button-group card-actions">
        <Link to={`/members/${member._id}`} className="button secondary-button">
          View Details
        </Link>

        <button
          type="button"
          className="button"
          onClick={() => navigate(`/members/${member._id}/edit`)}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default MemberCard;
