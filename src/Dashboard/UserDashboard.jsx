import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./UserDashboard.css";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

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
  const getReports = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.get(`${API_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  //SUBMITS REPORTS
  const submitReport = async () => {
    if (problem.trim() === "" || department.trim() === "") {
      toast.error("PLEASE FILL IN THE REQUIRED FIELDS");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const result = await axios.post(
        `${API_URL}/api/reports`,
        {
          problem: problem,
          department: department,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(result.data.message);
      setProblem("");
      setDepartment("");
      getReports();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "COULD NOT SUBMIT REPORT");
    }
  };
  const pendingResults = reports.filter(
    (report) => report.status === "Pending",
  ).length;
  const resolvedResults = reports.filter(
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
              <span>{pendingResults}</span>
            </div>
          </div>

          <div className="card">
            <h4>Resolved</h4>
            <p>Reports fixed by ICT</p>
            <div className="per">
              <span>{resolvedResults}</span>
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
            maxLength={1000}
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          ></textarea>

          <label>DEPARTMENT</label>
          <input
            type="text"
            id="department"
            placeholder="Enter Your Department"
            maxLength={100}
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
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
                  <td>
                    <span className={`badge ${report.status}`}>
                      {report.status}
                    </span>
                  </td>
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
