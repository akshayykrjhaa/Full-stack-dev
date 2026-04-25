import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function MemberCard({ member }) {
  return (
    <article className="member-card">
      <div className="member-visual">
        <img
          src={`${API_BASE_URL}/uploads/${member.image}`}
          alt={member.name}
          className="member-image"
        />
        <span className="member-tag">Profile</span>
      </div>

      <div className="member-content">
        <h3>{member.name}</h3>
        <p className="member-role">{member.role}</p>

        <Link to={`/members/${member._id}`} className="button secondary-button">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default MemberCard;
