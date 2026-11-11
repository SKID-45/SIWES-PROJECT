import React, { useState } from "react";
import "./Login.css";
import user_icon from "../assets/person.png";
import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";
import eye_icon from "../assets/eye icon.webp";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL is:", API_URL);

const Login = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account"});
  const [page, setPage] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //SIGNUP FUNCTION
  const handleSignup = async () => {
    if (name === "" || email === "" || password === "") {
      toast.error("Please fill in The Required fields");
      return false;
    }
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(result.user, { displayName: name,
      });
      setName("");
      setEmail("");
      setPassword("");
      setPage("Login");
      toast.success("Account created successfully! Please log in.");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("NOT SUCCESSFUL: " + error.message);
      return false;
    }
  };

  //LOGIN FUNCTION
  const handleLogin = async () => {
    if (email === "" || password === "") {
      toast.error("Please fill in The Required fields");
      return;
    }
    try {
      const answer = await signInWithEmailAndPassword(auth, email, password);
      const token = await answer.user.getIdToken();
      const result = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = result.data.user.role;
      toast.success("Login successful!");
      if (role === "admin" || role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/invalid-credential") {
        toast.error("NOT SUCCESSFUL: wrong email or password");
      } else {
        toast.error(error.response?.data?.message || "NOT SUCCESSFUL: " + error.message);
      }
    }
  };

  //GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    try {
      const answer = await signInWithPopup(auth, googleProvider);
      const token = await answer.user.getIdToken();
      const result = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = result.data.user.role;
      toast.success("Google login successful!");
      if (role === "admin" || role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "GOOGLE SIGN-IN FAILED");
    }
  };

  
  return (
    <div className="login-page">
          <div className="login-left">
      <div className="welcome">
        <p className="welcome-small">Welcome to</p>
        <h1>ICT Help Desk</h1>
        <div className="welcome-line"></div>
        <p className="welcome-sub">
          Report problems. Track fixes. Get back to work.
        </p>
      </div>
    </div>

    <div className="login-right">
      <div className="Login-container">
        <div className="heading">
          <div className="text">{page}</div>
          <div className="line"></div>
        </div>

        <div className="inputs">
          {page === "Login" ? (
            <div></div>
          ) : (
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}

          <div className="input">
            <img src={email_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              <img className="eye-icon" src={eye_icon} alt="" />
            </span>
          </div>
        </div>

        <div className="Submit-container">
          <div className="google-button" onClick={handleGoogleLogin}>
            CONTINUE WITH GOOGLE
          </div>
          <div
            className={page === "Login" ? "submit gray" : "submit"}
            onClick={async () => {
              if (page === "Login") {
                setPage("Sign Up");
              } else {
                const successful = await handleSignup();
                if (successful) {
                  setPage("Login");
                }
              }
            }}
          >
            Sign-Up
          </div>

          <div
            className={page === "Sign Up" ? "submit gray" : "submit"}
            onClick={() => {
              if (page === "Sign Up") {
                setPage("Login");
              } else {
                handleLogin();
              }
            }}> 
            Login
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
export default Login;
