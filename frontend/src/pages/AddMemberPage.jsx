import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

function AddMemberPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update text input values.
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Save the selected image file.
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name || !formData.role || !formData.email || !image) {
      setError("Please fill in all fields and choose an image.");
      return;
    }

    try {
      setIsSubmitting(true);

      const memberData = new FormData();
      memberData.append("name", formData.name);
      memberData.append("role", formData.role);
      memberData.append("email", formData.email);
      memberData.append("image", image);

      await axios.post(`${API_BASE_URL}/api/members`, memberData);

      navigate("/members");
    } catch (requestError) {
      setError("Could not save the member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="card form-card">
        <h1>Add Member</h1>
        <p className="page-text">Fill the form below to add a new team member.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Name
            <input
              type="text"
              name="name"
              placeholder="Enter member name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Role
            <input
              type="text"
              name="role"
              placeholder="Enter member role"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter member email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Image
            <input type="file" accept="image/*" onChange={handleImageChange} required />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Member"}
          </button>
        </form>

        <Link to="/" className="text-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AddMemberPage;
