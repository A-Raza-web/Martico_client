import { useState, useCallback } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import logo from '../../assets/images/logo11.png';
import './AuthForm.css';

const AuthForm = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    remember: false
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const switchMode = useCallback((newMode) => {
    if (mode === newMode) return;

    setError(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      remember: false
    });
    setShowPassword(false);
    setMode(newMode);
  }, [mode]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckboxChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, name } = formData;

    try {
      if (mode === "signin") {
        const res = await axios.post("http://localhost:4000/api/auth/signin", {
          email,
          password,
        });

        console.log("Login Success:", res.data);
        const userId = res.data.user?._id || res.data._id;
        localStorage.setItem("token", res.data.token);
        if (userId) localStorage.setItem("userId", userId);
        localStorage.setItem("user", JSON.stringify({
            _id: userId,
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            profileImage: res.data.profileImage || res.data.image || '',
            createdAt: res.data.createdAt
        }));
        navigate('/');
       }else {
        const res = await axios.post("http://localhost:4000/api/auth/signup", {
          name,
          email,
          password,
        });
        console.log("Signup Success:", res.data);
        const userId = res.data.user?._id || res.data._id;
        localStorage.setItem("token", res.data.token);
        if (userId) localStorage.setItem("userId", userId);
        localStorage.setItem("user", JSON.stringify({
          _id: userId,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          profileImage: res.data.profileImage || res.data.image || '',
          createdAt: res.data.createdAt
        }));
        setSnackbar({ open: true, message: 'Account created successfully!', severity: 'success' });
        setTimeout(() => navigate('/'), 1500);
     }
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      localStorage.setItem("token", token);
      localStorage.setItem("userId", firebaseUser.uid);
      localStorage.setItem("user", JSON.stringify({
        name: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
        profileImage: firebaseUser.photoURL || "",
        createdAt: firebaseUser.metadata?.creationTime
          ? new Date(firebaseUser.metadata.creationTime).toISOString()
          : new Date().toISOString(),
        authProvider: "firebase",
        uid: firebaseUser.uid
      }));

      setSnackbar({ open: true, message: "Signed in with Google!", severity: "success" });
      navigate('/');
    } catch (err) {
      const message = err?.code === "auth/popup-closed-by-user"
        ? "Sign-in canceled."
        : err?.message || "Google sign-in failed";
      setError(message);
    }
  };

  return (
    <section className="auth-page">
      <div className="bg-sheet bg-sheet-1"></div>
      <div className="bg-sheet bg-sheet-2"></div>
      <div className="auth-container centered">
        <div className="auth-form-wrapper">
          <form onSubmit={handleSubmit} className="auth-card" noValidate>
            {/* Logo */}
            <div className="auth-logo">
              <Link to="/">
                <img src={logo} alt="Martico Logo" />
              </Link>
            </div>

            {/* Header */}
            <div className="auth-header">
              <h2>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{mode === 'signin' ? 'Sign in to access your account' : 'Join us to get started'}</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            {/* Success Snackbar */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%', fontSize: '1rem', fontWeight: 500 }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>

            {/* Dynamic Fields */}
            <div className="auth-fields">
              {/* First field */}
              <div className="field-group">
                <label>
                  {mode === 'signin' ? 'Email Address' : 'Full Name'}
                  <input
                    key={`${mode}-field1`}
                    type={mode === 'signin' ? 'email' : 'text'}
                    value={mode === 'signin' ? formData.email : formData.name}
                    onChange={mode === 'signin' ? handleInputChange('email') : handleInputChange('name')}
                    placeholder={mode === 'signin' ? 'Enter your email' : 'Enter your full name'}
                    required
                  />
                </label>
              </div>

              {/* Email for Signup */}
              {mode === 'signup' && (
                <div className="field-group">
                  <label>
                    Email Address
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      placeholder="Enter your email"
                      required
                    />
                  </label>
                </div>
              )}

              {/* Password */}
              <div className="field-group">
                <label>
                  Password
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                    </button>
                  </div>
                </label>
              </div>

              {/* Remember Me */}
              {mode === 'signin' && (
                <div className="auth-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.remember}
                      onChange={handleCheckboxChange('remember')}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot" className="forgot-link">Forgot password?</Link>
                </div>
              )}
            </div>

            <button className="auth-submit" type="submit">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Social Login */}
            <div className="social-login">
              <div className="divider"><span>or continue with</span></div>
              <div className="social-buttons horizontal">
                <button type="button" className="social-btn google" onClick={handleGoogleSignIn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="auth-footer">
              <p>
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button type="button" className="mode-toggle-link" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
              <div className="mode-indicator">
                <span className={mode === 'signin' ? 'active' : ''}>Sign In</span>
                <span className="separator">•</span>
                <span className={mode === 'signup' ? 'active' : ''}>Sign Up</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AuthForm;
