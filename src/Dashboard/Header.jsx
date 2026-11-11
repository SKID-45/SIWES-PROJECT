import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const check = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => check();
  }, []);

  const logout = async (event) => {
    event.preventDefault();
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <header className="header">
      <div className="header-brand">ICT Help Desk</div>

      <div className="header-menu">
        <div className="welcome">
          Welcome, {user?.displayName || user?.email}
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="profile-pic"
            />
          )}
        </div>
        <Link to="/" onClick={logout}>
          Logout
        </Link>
      </div>
    </header>
  );
}
export default Header;