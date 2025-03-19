import React, { useState } from 'react';
import '../styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Emily R.',
      rating: 5,
      text: '"StudySync transformed my learning experience! The resource locator helped me find exactly what I needed for my research paper."',
    },
    {
      id: 2,
      name: 'James P.',
      rating: 5,
      text: '"The interactive lessons are incredibly engaging. I\'ve improved my grades significantly since I started using StudySync."',
    },
    {
      id: 3,
      name: 'Sophia L.',
      rating: 5,
      text: '"I saw a huge improvement in my grades after using StudySync for just one semester. The YouTube recommendations are spot on!"',
    },
    {
      id: 4,
      name: 'Michael T.',
      rating: 5,
      text: '"As a teacher, I recommend StudySync to all my students. It\'s a comprehensive platform that adapts to different learning styles."',
    },
    {
      id: 5,
      name: 'Olivia K.',
      rating: 5,
      text: '"The bookmark feature helps me organize all my resources in one place. StudySync has streamlined my study routine completely."',
    }
  ];

  const handleCreateAccount = () => {
    navigate('/signup'); // Navigate to SignUp page
  };

  const handleLogin = () => {
    navigate('/login'); // Navigate to Login page
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial(prev => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial(prev => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container">
          <div className="nav-container">
            <div className="logo">
              <a href="#home" className="logo-link">
                <img src="/assets/logo.jpg" alt="logo" />
                <span className="logo-icon"></span> StudySync
              </a>
            </div>
            <nav className="main-nav">
              <ul>
                <li><a href="#home" className="active">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#" onClick={handleLogin}>Login</a></li>
                <li className="account-item">
                  <button className="create-account-btn" onClick={handleCreateAccount}>
                    Create Account
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="container">
          <h1>Ready to grab <br />your notes</h1>
          <div className="blue-underline"></div>
          <p className="hero-subtitle">
            StudySync provides you with all the tools you need. Syncs with resources for better organization.
          </p>
          <button className="cta-button" onClick={handleCreateAccount}>
            Start taking notes
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <h2>StudySync Features</h2>
          <p className="features-subtitle">
            Discover the ultimate study tool with StudySync, offering a resource locator and 
            tailored YouTube course recommendations to enhance your learning experience.
          </p>

          {/* YouTube Feature */}
          <div className="feature-item">
            <div className="feature-content-left">
              <h3>YouTube Course Recommendations</h3>
              <p>Receive personalized course suggestions from YouTube to complement your study routine.</p>
              <div className="feature-buttons">
                <button className="button primary-button" onClick={handleCreateAccount}>Try now</button>
                <button className="button text-button">Learn more</button>
              </div>
            </div>
            <div className="feature-image-right">
              <img src="/assets/recommendation.jpg" alt="YouTube recommendations" className="feature-img" />
            </div>
          </div>

          {/* Resource Locator Feature */}
          <div className="feature-item">
            <div className="feature-image-left">
              <img src="/assets/resource.jpg" alt="Resource locator" className="feature-img" />
            </div>
            <div className="feature-content-right">
              <h3>Resource Locator</h3>
              <p>Easily find and access a wide range of educational resources tailored to your study needs.</p>
              <div className="feature-buttons right-aligned">
                <button className="button text-button">Learn more</button>
                <button className="button primary-button" onClick={handleCreateAccount}>Try now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save Files Section */}
      <section className="save-files-section dark-section">
        <div className="container">
          <div className="dual-content">
            <div className="text-content">
              <h2>Easy to Save Files and Bookmark Work</h2>
              <p>Upload your notes and bookmark resources for easy access. Organize your study materials in one convenient location.</p>
              <button className="upload-button" onClick={handleCreateAccount}>Upload Your Notes</button>
            </div>
            <div className="image-content">
              <img src="/assets/rocket.jpg" alt="Rocket illustration" className="feature-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Share Notes Section */}
      <section className="share-notes-section dark-section">
        <div className="container">
          <div className="dual-content">
            <div className="image-content">
              <img src="/assets/note.jpg" alt="Notes illustration" className="feature-img" />
            </div>
            <div className="text-content">
              <h2>Share Your Notes and Help Others</h2>
              <p>Upload and share notes with students worldwide. Contribute to a global learning community and gain insights from peers.</p>
              <button className="view-share-button" onClick={handleCreateAccount}>View and Share Your Notes</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <h2>Hear from our awesome users!</h2>
          <div className="testimonials-container">
            <div className="testimonial-card active">
              <div className="user-info">
                <h4>{testimonials[activeTestimonial].name}</h4>
                <div className="stars">{testimonials[activeTestimonial].rating}</div>
                <p>{testimonials[activeTestimonial].text}</p>
              </div>
            </div>
            
            {/* Testimonial Navigation */}
            <div className="testimonial-navigation">
              <button className="nav-button prev" onClick={handlePrevTestimonial}>←</button>
              <div className="testimonial-indicators">
                {testimonials.map((_, index) => (
                  <span 
                    key={index} 
                    className={`indicator ${index === activeTestimonial ? 'active' : ''}`}
                    onClick={() => setActiveTestimonial(index)}
                  ></span>
                ))}
              </div>
              <button className="nav-button next" onClick={handleNextTestimonial}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to enhance your learning?</h2>
          <p>Join StudySync today and unlock your full potential with our comprehensive learning tools.</p>
          <button className="cta-button large" onClick={handleCreateAccount}>
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer is handled by App.js */}
    </div>
  );
};

export default LandingPage;
