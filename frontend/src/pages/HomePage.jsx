import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="page">
      <div className="card home-card">
        <p className="small-label">FULL STACK DEVELOPMENT PROJECT</p>
        <h1>Student Team Members Management</h1>
        <p className="page-text">
          Add your student team members, view the list, and open full member details.
        </p>

        <div className="button-group">
          <Link to="/add-member" className="button">
            Add Member
          </Link>

          <Link to="/members" className="button secondary-button">
            View Members
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
