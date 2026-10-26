import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./AdminDashboard.css";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
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
    return () => check();
    // eslint-disable-next-line
  }, []);

  //GET USER ROLE
  async function getRole() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const answer = await result.json();
      if (!result.ok) {
        throw new Error(answer.message || "Could not get role");
      }
      setRole(answer.user.role);
      if (answer.user.role === "user") {
        navigate("/dashboard");
        return;
      }

      if (answer.user.role === "admin") {
        getReports();
      }
      if (answer.user.role === "superadmin") {
        getUsers();
      }
    } catch (error) {
      console.log(error);
    }
  }

  //GETS REPORTS DETAILS
  async function getReports() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch("http://localhost:5000/api/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const answer = await result.json();
      if (!result.ok) {
        throw new Error(answer.message || "Could not load reports");
      }
      setReports(answer);
    } catch (error) {
      console.log(error);
    }
  }

  //RECORDS USERS DATA
  async function getUsers() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch(`http://localhost:5000/api/roles/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const answer = await result.json();
      if (!result.ok) {
        throw new Error(answer.message || "Could not load users");
      }
      setUsers(answer);
    } catch (error) {
      console.log(error);
    }
  }

  //CHANGE ROLES OF USERS
  async function changeRoles(id) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch(
        `http://localhost:5000/api/roles/make-admin/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const answer = await result.json();
      alert(answer.message);
      if (!result.ok) {
        return;
      }
      getUsers();
    } catch (error) {
      console.log(error);
      alert("COULD NOT CHANGE ROLE");
    }
  }

  //DELETE REPORTS NOT NEEDED
  async function deleteReport(id) {
    if (!window.confirm("Delete this report?")) {
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const answer = await result.json();
      alert(answer.message);
      await getReports();
    } catch (error) {
      console.log(error);
      alert("COULD NOT DELETE REPORT");
    }
  }
  //EDIT REPORT DETAILS
  async function editReport(report) {
    const input = prompt(
      "Enter status: Pending, Resolved or Unresolved",
      report.status,
    );
    if (input === null) {
      return;
    }
    const allowed = ["Pending", "Resolved", "Unresolved"];
    const status = allowed.find(
      (s) => s.toLowerCase() === input.trim().toLowerCase(),
    );
    if (!status) {
      alert("Invalid status. Use Pending, Resolved or Unresolved");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch(
        `http://localhost:5000/api/reports/${report._id}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status,
          }),
        },
      );
      const answer = await result.json();
      alert(answer.message);
      await getReports();
    } catch (error) {
      console.log(error);
      alert("COULD NOT EDIT REPORT");
    }
  }

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
                  <span>
                    {
                      reports.filter((report) => report.status === "Pending")
                        .length
                    }
                  </span>
                </div>
              </div>

              <div className="card">
                <h4>Resolved</h4>
                <p>Reports fixed by ICT</p>
                <div className="per">
                  <span>
                    {
                      reports.filter((report) => report.status === "Resolved")
                        .length
                    }
                  </span>
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
                    <td>{report.status}</td>
                    <td>
                      <button onClick={() => editReport(report)}>Edit</button>
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
}
export default AdminDashboard;
