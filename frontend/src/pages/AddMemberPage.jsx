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
        <p className="eyebrow">Create Profile</p>
        <h1>Add Member</h1>
        <p className="page-text">Fill in each field to create a polished team profile.</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              name="name"
              placeholder="Enter member name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Role</span>
            <input
              type="text"
              name="role"
              placeholder="Enter member role"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter member email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} required />

            {image && <small className="file-hint">Selected: {image.name}</small>}
          </label>

          {error && <p className="error-text">{error}</p>}

          <div className="button-group form-actions">
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Member"}
            </button>

            <Link to="/members" className="button secondary-button">
              Cancel
            </Link>
          </div>
        </form>

        <Link to="/" className="text-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AddMemberPage;
