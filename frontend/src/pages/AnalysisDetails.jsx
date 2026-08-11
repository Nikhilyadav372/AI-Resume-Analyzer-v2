import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";


function AnalysisDetails() {

    const { id } = useParams();

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);



    // ---------------- LOAD ANALYSIS ----------------

    const loadAnalysis = async () => {

        try {

            const token = localStorage.getItem("token");

            console.log("Analysis ID:", id);


            const response = await api.get(
                "/analysis-history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            console.log(
                "History Data:",
                response.data.history
            );


            const selectedAnalysis = response.data.history.find(
                (item) => Number(item.id) === Number(id)
            );


            console.log(
                "Selected Analysis:",
                selectedAnalysis
            );


            setAnalysis(selectedAnalysis);

            setLoading(false);


        } catch (error) {

            console.log(
                "Analysis Load Error:",
                error
            );

            setLoading(false);

        }

    };



    // ---------------- PAGE LOAD ----------------

    useEffect(() => {

        loadAnalysis();

    }, []);



    // ---------------- LOADING ----------------

    if (loading) {

        return (

            <div>

                <Navbar />

                <h2>
                    Loading Report...
                </h2>

            </div>

        );

    }



    // ---------------- NO DATA ----------------

    if (!analysis) {

        return (

            <div>

                <Navbar />

                <h2>
                    Unable to load analysis
                </h2>

            </div>

        );

    }



    // ---------------- UI ----------------

    return (

        <div>

            <Navbar />


            <div className="report-container">


                <h1>
                    📄 Resume Analysis Report
                </h1>



                <div className="report-card">


                    <h3>
                        Resume Name:
                    </h3>

                    <p>
                        {analysis.filename}
                    </p>



                    <div className="score-box">

                        <h2>
                            ⭐ ATS Score
                        </h2>


                        <h1>
                            {analysis.ats_score}/100
                        </h1>

                    </div>



                    <div className="report-section">

                        <h2>
                            ✅ Detected Skills
                        </h2>


                        <p>
                            {
                                analysis.detected_skills ||
                                "No skills detected"
                            }
                        </p>

                    </div>




                    <div className="report-section">

                        <h2>
                            ⚠ Missing Skills
                        </h2>


                        <p>
                            {
                                analysis.missing_skills ||
                                "No missing skills"
                            }
                        </p>

                    </div>




                    <div className="report-section">

                        <h2>
                            🤖 AI Feedback
                        </h2>


                        <p>
                            {analysis.ai_feedback}
                        </p>

                    </div>



                    <div className="report-section">

                        <h2>
                            📅 Uploaded Date
                        </h2>


                        <p>
                            {
                                new Date(
                                    analysis.created_at
                                ).toLocaleDateString()
                            }
                        </p>

                    </div>



                </div>


            </div>


        </div>

    );

}


export default AnalysisDetails;