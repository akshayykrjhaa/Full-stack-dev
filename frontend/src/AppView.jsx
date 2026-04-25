import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AddMemberPage from "./pages/AddMemberPage";
import ViewMembersPage from "./pages/ViewMembersPage";
import MemberDetailsPage from "./pages/MemberDetailsPage";
import EditMemberPage from "./pages/EditMemberPage";

function AppView() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/add-member" element={<AddMemberPage />} />
      <Route path="/members" element={<ViewMembersPage />} />
      <Route path="/members/:id" element={<MemberDetailsPage />} />
      <Route path="/members/:id/edit" element={<EditMemberPage />} />
    </Routes>
  );
}

export default AppView;
