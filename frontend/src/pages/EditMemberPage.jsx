import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

function EditMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/members/${id}`);

        setFormData({
          name: response.data.name,
          role: response.data.role,
          email: response.data.email,
        });
        setCurrentImage(response.data.image);
      } catch (requestError) {
        setError("Could not load member for editing.");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage || null);

    if (selectedImage) {
      setPreviewImage(URL.createObjectURL(selectedImage));
    } else {
      setPreviewImage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name || !formData.role || !formData.email) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const memberData = new FormData();
      memberData.append("name", formData.name);
      memberData.append("role", formData.role);
      memberData.append("email", formData.email);

      if (image) {
        memberData.append("image", image);
      }

      await axios.put(`${API_BASE_URL}/api/members/${id}`, memberData);
      navigate(`/members/${id}`);
    } catch (requestError) {
      setError("Could not update the member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="card form-card">
        <h1>Edit Member</h1>

        {loading && <p className="info-text">Loading member...</p>}
        {error && !loading && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            {currentImage && (
              <img
                src={previewImage || `${API_BASE_URL}/uploads/${currentImage}`}
                alt={formData.name}
                className="details-image"
              />
            )}

            <form onSubmit={handleSubmit} className="form">
              <label>
                Name
                <input
                  type="text"
                  name="name"
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Change Photo
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Member"}
              </button>
            </form>

            <div className="button-group">
              <Link to={`/members/${id}`} className="button secondary-button">
                Back to Details
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EditMemberPage;
