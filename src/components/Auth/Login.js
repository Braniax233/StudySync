import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthForm.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
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

  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate password
    if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      console.log('Attempting login with:', { email: credentials.email });
      
      // Use the login function from AuthContext
      await login({
        email: credentials.email,
        password: credentials.password
      });
      
      // Navigate to dashboard on successful login
      navigate("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        form: error.response?.data?.message || authError || "Authentication failed. Please check your credentials."
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
          <h1>Sign in</h1>
          <p className="auth-subtitle">Sign in to unlock the power of StudySync</p>

          {errors.form && (
            <div className="error-message form-error">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={credentials.email}
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
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  required
                />
                <span className="input-icon lock-icon"></span>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={credentials.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`primary-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="account-prompt">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Create account
              </Link>
            </div>

            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </div>

            <button type="button" className="google-button">
              <img src="/assets/google.jpeg" alt="Google icon" className="small-google-icon" />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
