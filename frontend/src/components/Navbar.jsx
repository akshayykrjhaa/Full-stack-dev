import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/members", label: "Members" },
  { to: "/add-member", label: "Add Member" },
];

function Navbar() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Student Team home">
          <span className="brand-mark">ST</span>
          <span className="brand-copy">
            <strong>Student Team</strong>
            <small>Management Studio</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/add-member" className="button nav-cta">
          New Profile
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
