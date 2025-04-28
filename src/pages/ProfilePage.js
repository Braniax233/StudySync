import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/apiService';
import Navbar from '../components/Navigation/Navbar';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const defaultStats = useMemo(() => ({
    resourcesAccessed: 0,
    bookmarks: 0,
    studyHours: 0,
    completedCourses: 0
  }), []);
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    joinDate: '',
    bio: '',
    interests: [],
    education: [],
    achievements: [],
    stats: defaultStats
  });

  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        if (response.data) {
          // Format the data for display
          const formattedData = {
            ...response.data,
            stats: {
              ...defaultStats,
              ...(response.data.stats || {})
            },
            joinDate: new Date(response.data.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })
          };
          setUserData(formattedData);
          
          // If we have activity data in the response
          if (response.data.activity) {
            setActivityData(response.data.activity);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser, defaultStats]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditProfile = () => {
    navigate('/settings');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{userData.name?.charAt(0) || '?'}</span>
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h1>{userData.name || 'Anonymous User'}</h1>
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                <i className="edit-icon"></i>
                Edit Profile
              </button>
            </div>
            <p className="username">@{userData.username || 'username'}</p>
            <p className="join-date">Joined {userData.joinDate || 'recently'}</p>
          </div>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <i className="profile-tab-icon"></i>
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => handleTabChange('activity')}
          >
            <i className="activity-tab-icon"></i>
            Activity
          </button>
          <button 
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => handleTabChange('achievements')}
          >
            <i className="achievements-tab-icon"></i>
            Achievements
          </button>
        </div>
        
        <div className="profile-tab-content">
          {activeTab === 'profile' && (
            <div className="profile-details">
              <div className="profile-section">
                <h2>About Me</h2>
                <p className="bio">{userData.bio || 'No bio added yet.'}</p>
                
                <div className="interests">
                  <h3>Interests</h3>
                  <div className="interests-tags">
                    {userData.interests && userData.interests.length > 0 ? (
                      userData.interests.map((interest, index) => (
                        <span key={index} className="interest-tag">{interest}</span>
                      ))
                    ) : (
                      <p>No interests added yet.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h2>Education</h2>
                <div className="education-list">
                  {userData.education && userData.education.length > 0 ? (
                    userData.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <div className="education-icon"></div>
                        <div className="education-content">
                          <h3>{edu.institution}</h3>
                          <p className="degree">{edu.degree}</p>
                          <p className="field">{edu.field}</p>
                          <p className="year">{edu.startYear} - {edu.endYear || 'Present'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No education history added yet.</p>
                  )}
                </div>
              </div>
              
              <div className="profile-section">
                <h2>Stats</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon resources-icon"></div>
                    <div className="stat-value">{userData.stats?.resourcesAccessed || 0}</div>
                    <div className="stat-label">Resources Accessed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon bookmarks-icon"></div>
                    <div className="stat-value">{userData.stats?.bookmarks || 0}</div>
                    <div className="stat-label">Bookmarks</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon hours-icon"></div>
                    <div className="stat-value">{userData.stats?.studyHours || 0}</div>
                    <div className="stat-label">Study Hours</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon courses-icon"></div>
                    <div className="stat-value">{userData.stats?.completedCourses || 0}</div>
                    <div className="stat-label">Completed Courses</div>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h2>Recent Activity</h2>
                <p className="last-active">
                  Last active: {formatDate(userData.lastActive || userData.createdAt)}
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="activity-feed">
              {activityData && activityData.length > 0 ? (
                activityData.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon"></div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.description}</p>
                      <p className="activity-time">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent activity.</p>
              )}
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="achievements-grid">
              {userData.achievements && userData.achievements.length > 0 ? (
                userData.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon"></div>
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <span className="achievement-date">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p>No achievements yet. Keep learning to earn badges!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
