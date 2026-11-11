import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./AdminDashboard.css";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const confirmToast = (message, onConfirm) => {
  toast(
    (toastId) => (
      <span>
        {message}{" "}
        <button
          style={{ margin: "0 6px", padding: "4px 12px", cursor: "pointer" }}
          onClick={() => {
            toast.dismiss(toastId.id);
            onConfirm();
          }}
        >
          Yes
        </button>
        <button
          style={{ padding: "4px 12px", cursor: "pointer" }}
          onClick={() => toast.dismiss(toastId.id)}
        >
          No
        </button>
      </span>
    ),
    { duration: Infinity },
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const check = onAuthStateChanged(auth, (user) => {
      if (user) {
        getRole();
      } else {
        navigate("/");
      }
    });
    return check;
    // eslint-disable-next-line
  }, []);

  //GET USER ROLE
  const getRole = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRole = result.data.user.role;
      setRole(result.data.user.role);
      if (userRole === "user") {
        navigate("/dashboard");
        return;
      }
      if (userRole === "admin") {
        getReports();
      }
      if (userRole === "superadmin") {
        getUsers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //GETS REPORTS DETAILS
  const getReports = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.get(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(result.data);
    } catch (error) {
      console.log(error);
      toast.error("COULD NOT GET REPORTS");
    }
  };

  //RECORDS USERS DATA
  const getUsers = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.get(`${API_URL}/api/roles/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(result.data);
    } catch (error) {
      console.log(error);
      toast.error("COULD NOT GET USERS");
    }
  };

  //CHANGE ROLES OF USERS
  const changeRoles = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.put(
        `${API_URL}/api/roles/make-admin/${id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(result.data.message);
      getUsers();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "COULD NOT CHANGE ROLE");
    }
  };

  //DELETE REPORTS NOT NEEDED
  const deleteReport = async (id) => {
    confirmToast("Delete this report?", async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          return;
        }
        const token = await user.getIdToken();
        const result = await axios.delete(`${API_URL}/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(result.data.message);
        getReports();
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "COULD NOT DELETE REPORT");
      }
    });
  };
  //EDIT REPORT DETAILS
  const editReport = async (selectedReport, newStatus) => {
    if (newStatus === selectedReport.status) {
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.put(
        `${API_URL}/api/reports/${selectedReport._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(result.data.message);
      getReports();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "COULD NOT EDIT REPORT");
    }
  };

  const pendingReportCount = reports.filter(
    (report) => report.status === "Pending",
  ).length;
  const resolvedReportCount = reports.filter(
    (report) => report.status === "Resolved",
  ).length;

  return (
    <div>
      <Header />
      <section className="main">
        <div className="main-top">
          <h1>Dashboard</h1>
        </div>

        <div className="users">
          {role === "admin" && (
            <>
              <div className="card">
                <h4>Total Reports</h4>
                <p>All submitted reports</p>
                <div className="per">
                  <span>{reports.length}</span>
                </div>
              </div>

              <div className="card">
                <h4>Pending</h4>
                <p>Reports waiting for ICT</p>
                <div className="per">
                  <span>{pendingReportCount}</span>
                </div>
              </div>

              <div className="card">
                <h4>Resolved</h4>
                <p>Reports fixed by ICT</p>
                <div className="per">
                  <span>{resolvedReportCount}</span>
                </div>
              </div>
            </>
          )}

          {role === "superadmin" && (
            <div className="card">
              <h4>Total Users</h4>
              <p>Registered Users</p>
              <div className="per">
                <span>{users.length}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {role === "admin" && (
        <section className="reports">
          <div className="reports-list">
            <h1>LOGS OF REPORTS SUBMITTED</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>USERS</th>
                  <th>PROBLEMS</th>
                  <th>DEPTS</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>EDIT</th>
                  <th>DELETE</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.userId?.name}</td>
                    <td>{report.problem}</td>
                    <td>{report.department}</td>
                    <td>{new Date(report.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${report.status}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => editReport(report, "Pending")}>
                        Pending
                      </button>
                      <button onClick={() => editReport(report, "Resolved")}>
                        Resolved
                      </button>
                      <button onClick={() => editReport(report, "Unresolved")}>
                        Unresolved
                      </button>
                    </td>
                    <td>
                      <button onClick={() => deleteReport(report._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {role === "superadmin" && (
        <section className="reports">
          <div className="reports-list">
            <h1>USERS</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>USERS</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>EDIT</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.role === "user" && (
                        <button onClick={() => changeRoles(user._id)}>
                          ADMIN
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
export default AdminDashboard;