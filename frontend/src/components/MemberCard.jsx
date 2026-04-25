import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function MemberCard({ member }) {
  return (
    <div className="member-card">
      <img
        src={`${API_BASE_URL}/uploads/${member.image}`}
        alt={member.name}
        className="member-image"
      />

      <h3>{member.name}</h3>
      <p>{member.role}</p>

      <Link to={`/members/${member._id}`} className="button secondary-button">
        View Details
      </Link>
    </div>
  );
}

export default MemberCard;
