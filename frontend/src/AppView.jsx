import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AddMemberPage from "./pages/AddMemberPage";
import ViewMembersPage from "./pages/ViewMembersPage";
import MemberDetailsPage from "./pages/MemberDetailsPage";
import Navbar from "./components/Navbar";

function AppView() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-member" element={<AddMemberPage />} />
          <Route path="/members" element={<ViewMembersPage />} />
          <Route path="/members/:id" element={<MemberDetailsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default AppView;
