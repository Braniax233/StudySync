import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthForm.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the resetPassword function from AuthContext
      await resetPassword(email);
      
      // Show success message
      setSubmitted(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || authError || "Failed to send reset link. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-illustration">
        <div className="illustration-content">
          <img src="/assets/kid.jpg" alt="Student at computer" />
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <h1>Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a link to reset your password
          </p>

          {errors.form && (
            <div className="error-message form-error">
              {errors.form}
            </div>
          )}

          {submitted ? (
            <div className="success-message">
              <h3>Reset Link Sent!</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <p>Redirecting to login page in a few seconds...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleChange}
                    className={errors.email ? "input-error" : ""}
                    required
                  />
                  <span className="input-icon email-icon"></span>
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <button 
                type="submit" 
                className={`primary-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="account-prompt">
                Remember your password?{" "}
                <Link to="/login" className="signup-link">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
