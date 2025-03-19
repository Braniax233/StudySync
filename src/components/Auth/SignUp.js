import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthForm.css";

const SignUp = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Calculate password strength whenever password changes
  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate full name
    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }
    
    // Validate username
    if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate password
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (passwordStrength < 3) {
      newErrors.password = "Password is too weak. Add uppercase, numbers, or special characters.";
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
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
      // Register the user using the AuthContext
      await register({
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Navigate to dashboard on successful registration
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || authError || "Registration failed. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-illustration">
        <div className="illustration-content">
          <img src="/assets/kid.jpg" alt="Student at computer" className="small-image" />
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <h1>Create an account</h1>
          <p className="auth-subtitle">Join StudySync to unlock your learning potential</p>

          {errors.form && (
            <div className="error-message form-error">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-container">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "input-error" : ""}
                  required
                />
                <span className="input-icon user-icon"></span>
              </div>
              {errors.fullName && <div className="error-message">{errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "input-error" : ""}
                  required
                />
                <span className="input-icon user-icon"></span>
              </div>
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                  required
                />
                <span className="input-icon email-icon"></span>
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  required
                />
                <span className="input-icon lock-icon"></span>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    <div className={`strength-bar ${passwordStrength >= 1 ? "filled" : ""}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 2 ? "filled" : ""}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 3 ? "filled" : ""}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 4 ? "filled" : ""}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 5 ? "filled" : ""}`}></div>
                  </div>
                  <span className="strength-label">{getStrengthLabel()}</span>
                </div>
              )}
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                  required
                />
                <span className="input-icon lock-icon"></span>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={errors.agreeToTerms ? "input-error" : ""}
                />
                <label htmlFor="agreeToTerms">
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
            </div>

            <button 
              type="submit" 
              className={`primary-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="account-prompt">
              Already have an account?{" "}
              <Link to="/login" className="signup-link">Sign in</Link>
            </div>

            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </div>

            <button type="button" className="google-button">
              <img src="/assets/google.jpeg" alt="Google icon" className="small-google-icon" />
              Sign up with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
