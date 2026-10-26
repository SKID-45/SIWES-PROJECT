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
import { auth } from "../../firebase";

const Login = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const [page, setPage] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //SIGNUP FUNCTION
  const handleSignup = async () => {
    if (name === "" || email === "" || password === "") {
      alert("Please fill in The Required fields");
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
      alert("SUCCESSFUL");
      return true;
    } catch (error) {
      console.log(error);
      alert("NOT SUCCESSFUL: " + error.message);
      return false;
    }
  };

  //LOGIN FUNCTION
  const handleLogin = async () => {
    if (email === "" || password === "") {
      alert("Please fill in The Required fields");
      return;
    }
    try {
      const answer = await signInWithEmailAndPassword(auth, email, password);
      const token = await answer.user.getIdToken();
      const result = await fetch("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await result.json();
      if (!result.ok) {
        alert(response.message || "COULD NOT LOG IN");
        return;
      }
      const role = response.user.role;
      alert("SUCCESSFUL");
      if (role === "admin" || role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/invalid-credential") {
        alert("NOT SUCCESSFUL: wrong email or password");
      } else {
        alert("NOT SUCCESSFUL: " + error.message);
      }
    }
  };

  //GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    try {
      const answer = await signInWithPopup(auth, googleProvider);
      const token = await answer.user.getIdToken();
      const result = await fetch("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await result.json();
      if (!result.ok) {
        alert(response.message || "COULD NOT LOG IN");
        return;
      }
      const role = response.user.role;
      alert("SUCCESSFUL");
      if (role === "admin" || role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      alert("GOOGLE SIGN-IN FAILED");
    }
  };
  return (
    <div className="Login-page">
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
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="input">
            <img src={email_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            }}
          >
            Login
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
