import "../styles/AnalysisModal.css";

function AnalysisModal({ open, onClose, feedback }) {

  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="analysis-modal">

        <div className="modal-header">

          <h2>🤖 AI Resume Analysis</h2>

          <button onClick={onClose}>
            ✖
          </button>

        </div>

        <div className="modal-body">

          <pre>{feedback}</pre>

        </div>

      </div>

    </div>

  );

}

export default AnalysisModal;