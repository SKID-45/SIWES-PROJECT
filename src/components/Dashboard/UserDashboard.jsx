import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./UserDashboard.css";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [problem, setProblem] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const check = onAuthStateChanged(auth, (user) => {
      if (user) {
        getReports();
      } else {
        navigate("/");
      }
    });
    return () => check();
  // eslint-disable-next-line
  }, []);

  //GETS REPORTS
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

  //SUBMITS REPORTS
  async function submitReport() {
    if (problem.trim() === "" || department.trim() === "") {
      alert("PLEASE FILL IN THE REQUIRED FIELDS");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problem: problem,
          department: department,
        }),
      });
      const answer = await result.json();
      alert(answer.message);
      if (!result.ok) {
        return;
      }
      setProblem("");
      setDepartment("");
      getReports();
    } catch (error) {
      console.log(error);
      alert("COULD NOT SUBMIT REPORT");
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
          <div className="card">
            <h4>Total Reports</h4>
            <p>All your submitted reports</p>
            <div className="per">
              <span>{reports.length}</span>
            </div>
          </div>

          <div className="card">
            <h4>Pending</h4>
            <p>Reports waiting for ICT</p>
            <div className="per">
              <span>
                {reports.filter((report) => report.status === "Pending").length}
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
        </div>
      </section>

      <section className="report-section">
        <div className="report-box">
          <h1>SUBMIT ICT REPORT!</h1>
          <label>PROBLEM</label>
          <textarea
            id="problem"
            placeholder="Describe Your Problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          ></textarea>

          <label>DEPARTMENT</label>
          <input
            type="text"
            id="department"
            placeholder="Enter Your Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <button onClick={submitReport}>Submit Report</button>
        </div>
      </section>

      <section className="reports">
        <div className="reports-list">
          <h1>My Reports</h1>
          <table className="table">
            <thead>
              <tr>
                <th>PROBLEMS</th>
                <th>DEPT</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>{report.problem}</td>
                  <td>{report.department}</td>
                  <td>{new Date(report.submittedAt).toLocaleDateString()}</td>
                  <td>{report.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
export default UserDashboard;
