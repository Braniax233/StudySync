import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/apiService';
import Navbar from '../components/Navigation/Navbar';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout } = useAuth();
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    interests: [],
    education: []
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    resourceRecommendations: true,
    studyReminders: false,
    newFeatures: true,
    weeklyDigest: true,
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    compactView: false,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    activityVisibility: 'friends',
    dataCollection: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        if (response.data) {
          // Set user data
          setUserData({
            name: response.data.name || '',
            username: response.data.username || '',
            email: response.data.email || '',
            bio: response.data.bio || '',
            interests: response.data.interests || [],
            education: response.data.education || []
          });

          // Set settings if they exist
          if (response.data.settings) {
            const { notifications, appearance, privacy } = response.data.settings;
            if (notifications) setNotificationSettings(notifications);
            if (appearance) setAppearanceSettings(appearance);
            if (privacy) setPrivacySettings(privacy);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);
  
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setError(null);
    setSuccessMessage('');
  };
  
  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };
  
  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.updatePassword({
        currentPassword,
        newPassword
      });
      setSuccessMessage('Password updated successfully');
      form.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    
    try {
      setSaving(true);
      // Save profile data
      const profileResponse = await profileAPI.updateProfile(userData);
      
      // Save settings
      const settingsResponse = await profileAPI.updateSettings({
        notifications: notificationSettings,
        appearance: appearanceSettings,
        privacy: privacySettings
      });
      
      if (profileResponse.data && settingsResponse.data) {
        setSuccessMessage('Settings saved successfully');
        // Update the auth context with new user data
        updateProfile(profileResponse.data);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setSaving(true);
        await profileAPI.deleteAccount();
        logout();
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete account');
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Navbar />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="settings-page">
      <Navbar />
      
      <div className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
        
        <div className="settings-container">
          <div className="settings-sidebar">
            <button 
              className={`sidebar-button ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => handleSectionChange('account')}
            >
              <i className="icon account-icon"></i>
              <span>Account</span>
            </button>
            <button 
              className={`sidebar-button ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => handleSectionChange('notifications')}
            >
              <i className="icon notifications-icon"></i>
              <span>Notifications</span>
            </button>
            <button 
              className={`sidebar-button ${activeSection === 'appearance' ? 'active' : ''}`}
              onClick={() => handleSectionChange('appearance')}
            >
              <i className="icon appearance-icon"></i>
              <span>Appearance</span>
            </button>
            <button 
              className={`sidebar-button ${activeSection === 'privacy' ? 'active' : ''}`}
              onClick={() => handleSectionChange('privacy')}
            >
              <i className="icon privacy-icon"></i>
              <span>Privacy</span>
            </button>
          </div>
          
          <div className="settings-main">
            {activeSection === 'account' && (
              <div className="settings-section">
                <h2>Account Settings</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleUserDataChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={userData.username}
                      onChange={handleUserDataChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleUserDataChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={userData.bio}
                      onChange={handleUserDataChange}
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Change Password</label>
                    <form onSubmit={handlePasswordChange} className="password-form">
                      <input
                        type="password"
                        name="currentPassword"
                        placeholder="Current Password"
                        required
                      />
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        required
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        required
                      />
                      <button type="submit" className="change-password-button" disabled={saving}>
                        {saving ? 'Changing...' : 'Change Password'}
                      </button>
                    </form>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-button" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
                
                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p>Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    className="delete-account-button" 
                    onClick={handleDeleteAccount}
                    disabled={saving}
                  >
                    {saving ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                      />
                      Email Notifications
                    </label>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="resourceRecommendations"
                        checked={notificationSettings.resourceRecommendations}
                        onChange={handleNotificationChange}
                      />
                      Resource Recommendations
                    </label>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="studyReminders"
                        checked={notificationSettings.studyReminders}
                        onChange={handleNotificationChange}
                      />
                      Study Reminders
                    </label>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="newFeatures"
                        checked={notificationSettings.newFeatures}
                        onChange={handleNotificationChange}
                      />
                      New Features Announcements
                    </label>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="weeklyDigest"
                        checked={notificationSettings.weeklyDigest}
                        onChange={handleNotificationChange}
                      />
                      Weekly Progress Digest
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-button" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h2>Appearance Settings</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="theme">Theme</label>
                    <select
                      id="theme"
                      name="theme"
                      value={appearanceSettings.theme}
                      onChange={handleAppearanceChange}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fontSize">Font Size</label>
                    <select
                      id="fontSize"
                      name="fontSize"
                      value={appearanceSettings.fontSize}
                      onChange={handleAppearanceChange}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="compactView"
                        checked={appearanceSettings.compactView}
                        onChange={handleAppearanceChange}
                      />
                      Compact View
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-button" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h2>Privacy Settings</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="profileVisibility">Profile Visibility</label>
                    <select
                      id="profileVisibility"
                      name="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={handlePrivacyChange}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="activityVisibility">Activity Visibility</label>
                    <select
                      id="activityVisibility"
                      name="activityVisibility"
                      value={privacySettings.activityVisibility}
                      onChange={handlePrivacyChange}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="dataCollection"
                        checked={privacySettings.dataCollection}
                        onChange={handlePrivacyChange}
                      />
                      Allow Data Collection for Personalization
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-button" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
