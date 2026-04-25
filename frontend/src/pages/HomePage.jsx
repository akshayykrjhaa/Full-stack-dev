import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="page">
      <section className="card home-card hero-surface">
        <p className="eyebrow">Student Directory</p>
        <h1>Build your standout student squad.</h1>
        <p className="page-text">
          Create rich member profiles, track your lineup, and jump into details instantly.
        </p>

        <div className="button-group hero-actions">
          <Link to="/add-member" className="button">
            Add Member
          </Link>

          <Link to="/members" className="button secondary-button">
            View Members
          </Link>
        </div>

        <div className="feature-strip">
          <article className="feature-pill">
            <h3>Fast Setup</h3>
            <p>Add member data and photos in under a minute.</p>
          </article>

          <article className="feature-pill">
            <h3>Clean Profiles</h3>
            <p>Every card is visual, organized, and easy to scan.</p>
          </article>

          <article className="feature-pill">
            <h3>Team Ready</h3>
            <p>Open full details for collaboration and planning.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
