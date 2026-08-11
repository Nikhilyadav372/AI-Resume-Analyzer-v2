import "../styles/History.css";
import "../styles/Modal.css";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AnalysisModal from "../components/AnalysisModal";
import api from "../services/api";

function History() {
console.log("History Component Loaded");
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
const [selectedFeedback, setSelectedFeedback] = useState("");
const [search, setSearch] = useState("");
const [deleteId, setDeleteId] = useState(null);  
useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      const response = await api.get("/analysis-history");

        setHistory(response.data.history);


    } catch (error) {

      console.log(error);
      alert("Failed to load history");

    }

  };

  const viewAnalysis = async (id) => {

    try {

    
      const response = await api.get(`/analysis/${id}`, );
       

      setSelectedFeedback(response.data.analysis.ai_feedback);

setShowModal(true);

    } catch (error) {

      console.log(error);
toast.error("Unable to load analysis");

    }

  };

 const deleteAnalysis = (id) => {

  if (!id) return;

  setDeleteId(id);

};
const confirmDelete = async () => {

  try {

    const response = await api.delete(
      `/analysis/${deleteId}`,);
    

    toast.success(response.data.message);

    setDeleteId(null);

    loadHistory();

  } catch (error) {

    console.log(error);

    toast.error("Delete Failed");

  }

};
  const downloadReport = async (id) => {

    try {


      const response = await api.get(
        `/analysis/${id}/download`);
       
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = `Analysis_${id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.log(error);

      alert("Unable to download PDF");

    }

  };

  return (
    <div>

      <Navbar />

     <div className="history-container">

  <div className="history-header">
    <div className="search-box">

  <input
    type="text"
    placeholder="🔍 Search Resume..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

</div>

  <h2 className="history-title">
    📄 Analysis History
  </h2>

  <div className="history-count">
    Total Reports : {history.length}
  </div>

</div>

       <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Resume</th>
              <th>ATS Score</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

        <tbody>

  {history.length === 0 ? (

    <tr>
      <td colSpan="5">
        <div className="empty-history">
          📂 No Resume Analysis Found
        </div>
      </td>
    </tr>

  ) : (

  history
  .filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase())
  )
  .map((item) => (

      <tr key={item.id}>

        <td>{item.id}</td>

        <td>{item.filename}</td>

        <td>
          <span
            className={`ats-score ${
              item.ats_score >= 80
                ? "good"
                : item.ats_score >= 50
                ? "medium"
                : "low"
            }`}
          >
         ⭐ {item.ats_score}/100
          </span>
        </td>

       <td>
  {new Date(item.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

        <td>

          <button
            className="action-btn view-btn"
            onClick={() => viewAnalysis(item.id)}
          >
            View
          </button>

          <button
            className="action-btn delete-btn"
            onClick={() => deleteAnalysis(item.id)}
          >
            Delete
          </button>

          <button
            className="action-btn download-btn"
            onClick={() => downloadReport(item.id)}
          >
            Download
          </button>

        </td>

      </tr>

    ))

  )}

</tbody>

        </table>

      </div>
{
  deleteId && (

    <div className="modal-overlay">

      <div className="modal-box">

        <h2>
          🗑 Delete Analysis
        </h2>

        <p style={{ marginTop: "15px", marginBottom: "25px" }}>
          Are you sure you want to delete this resume analysis?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >

          <button
            className="delete-btn"
            onClick={confirmDelete}
          >
            Yes, Delete
          </button>

          <button
            className="view-btn"
            onClick={() => setDeleteId(null)}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  )
}
{showModal && (

<div className="modal-overlay">

  <div className="modal-box">

    <h2>AI Resume Analysis</h2>

    <pre>{selectedFeedback}</pre>

    <button
      onClick={() => setShowModal(false)}
    >
      Close
    </button>

  </div>

</div>

)}

    </div>
  );
}

export default History;