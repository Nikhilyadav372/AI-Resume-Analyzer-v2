import { useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/JobMatch.css";

function JobMatch() {

    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState(null);

    const analyzeJob = async () => {

        if (jobDescription.trim() === "") {
            toast.error("Please enter Job Description");
            return;
        }

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/job-match",
                {
                    job_description: jobDescription
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResult(response.data);

            toast.success("Job Match Completed");

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Job Match Failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <>

            <Navbar />

            <div className="jobmatch-container">

                <div className="jobmatch-card">

                    <h2>AI Job Match</h2>

                    <p>
                        Paste the Job Description below and compare
                        it with your latest uploaded resume.
                    </p>

                    <textarea

                        placeholder="Paste Job Description Here..."

                        value={jobDescription}

                        onChange={(e) =>
                            setJobDescription(e.target.value)
                        }

                        rows="12"

                    />

                    <button

                        className="analyze-btn"

                        onClick={analyzeJob}

                        disabled={loading}

                    >

                        {
                            loading
                                ? "Analyzing..."
                                : "Analyze Job Match"
                        }

                    </button>
                                        {

                        result && (

                            <div className="result-section">

                                <h3>Job Match Result</h3>

                                <div className="score-box">

                                    <h1>

                                        {result.match_score}%

                                    </h1>

                                    <p>Match Score</p>

                                </div>

                                <div className="skills-section">

                                    <div>

                                        <h4>Matched Skills</h4>

                                        <ul>

                                            {
                                                result.matched_skills?.map(
                                                    (skill, index) => (
                                                        <li key={index}>
                                                            ✅ {skill}
                                                        </li>
                                                    )
                                                )
                                            }

                                        </ul>

                                    </div>

                                    <div>

                                        <h4>Missing Skills</h4>

                                        <ul>

                                            {
                                                result.missing_skills?.map(
                                                    (skill, index) => (
                                                        <li key={index}>
                                                            ❌ {skill}
                                                        </li>
                                                    )
                                                )
                                            }

                                        </ul>

                                    </div>

                                </div>

                                <div className="suggestions">

                                    <h4>AI Suggestions</h4>

                                    <ul>

                                        {
                                            result.suggestions?.map(
                                                (item, index) => (
                                                    <li key={index}>
                                                        💡 {item}
                                                    </li>
                                                )
                                            )
                                        }

                                    </ul>

                                </div>

                            </div>

                        )

                    }

                </div>

            </div>

        </>

    );

}

export default JobMatch;