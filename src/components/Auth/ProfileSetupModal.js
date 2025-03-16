import React, { useState } from 'react';
import './ProfileSetupModal.css';

const ProfileSetupModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    bio: '',
    interests: '',
    education: {
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('education.')) {
      const educationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        education: {
          ...prev.education,
          [educationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const interests = formData.interests
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
    
    onSubmit({
      ...formData,
      interests
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
          <p>Tell us more about yourself to personalize your experience</p>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          <div className="form-group">
            <label htmlFor="bio">Bio (Optional)</label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="interests">Interests (Optional)</label>
            <input
              type="text"
              id="interests"
              name="interests"
              placeholder="Enter interests separated by commas (e.g., Programming, Math, Science)"
              value={formData.interests}
              onChange={handleChange}
            />
          </div>

          <div className="education-section">
            <h3>Education (Optional)</h3>
            <div className="form-group">
              <label htmlFor="education.institution">Institution</label>
              <input
                type="text"
                id="education.institution"
                name="education.institution"
                placeholder="School or University name"
                value={formData.education.institution}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="education.degree">Degree</label>
              <input
                type="text"
                id="education.degree"
                name="education.degree"
                placeholder="Degree or Certification"
                value={formData.education.degree}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="education.field">Field of Study</label>
              <input
                type="text"
                id="education.field"
                name="education.field"
                placeholder="Major or Field of Study"
                value={formData.education.field}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="education.startYear">Start Year</label>
                <input
                  type="number"
                  id="education.startYear"
                  name="education.startYear"
                  placeholder="YYYY"
                  value={formData.education.startYear}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="form-group half">
                <label htmlFor="education.endYear">End Year (or expected)</label>
                <input
                  type="number"
                  id="education.endYear"
                  name="education.endYear"
                  placeholder="YYYY"
                  value={formData.education.endYear}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="skip-button" onClick={onClose}>
              Skip for Now
            </button>
            <button type="submit" className="save-button">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
