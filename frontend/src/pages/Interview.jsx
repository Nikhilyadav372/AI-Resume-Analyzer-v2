import "../styles/Interview.css";
import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "react-toastify";

function Interview() {

    const [questions, setQuestions] = useState("");
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
const [currentQuestion, setCurrentQuestion] = useState(0);
    const generateInterview = async () => {

        try {

            setLoading(true);

            

            const response = await api.post(
                "/generate-interview",
                {},
              
            );

            setQuestions(response.data.questions);
            setFeedback("");
            setAnswer("");

            toast.success("Interview Questions Generated");

        } catch (error) {

            console.log(error);

            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }

        } finally {

            setLoading(false);

        }

    };

    const evaluateAnswer = async () => {

        if (!questions) {

            toast.error("Generate interview questions first.");
            return;

        }

        if (!answer.trim()) {

            toast.error("Please enter your answer.");
            return;

        }

        try {

            const token = localStorage.getItem("token");

           const response = await api.post(

    "/evaluate-answer",

    {
        question: questions,
        answer: answer
    }

);

            setFeedback(response.data.feedback);

            toast.success("Answer Evaluated");

        }

        catch (error) {

            console.log(error);

            toast.error("Evaluation Failed");

        };

    };
        return (

        <div>

            <Navbar />

            <div className="interview-container">
<div
    style={{
        width: "100%",
        height: "12px",
        background: "#ddd",
        borderRadius: "10px",
        marginBottom: "20px",
        overflow: "hidden"
    }}
>
    <div
        style={{
            width: Array.isArray(questions)
                ? `${((currentQuestion + 1) / questions.length) * 100}%`
                : "0%",
            height: "100%",
            background: "#4CAF50",
            transition: "0.4s"
        }}
    ></div>
</div>  <h1>🎤 AI Mock Interview</h1>

                <p>
                    Generate personalized interview questions based on your latest resume.
                </p>

                <button
                    className="upload-btn"
                    onClick={generateInterview}
                    disabled={loading}
                >
                    {
                        loading
                            ? "Generating..."
                            : "Generate Interview Questions"
                    }
                </button>

                {

                    questions && (

                        <div className="report-section">

                            <h2>
    Question {currentQuestion + 1} / {
        Array.isArray(questions)
            ? questions.length
            : 1
    }
</h2>

                            <pre
                                style={{
                                    whiteSpace: "pre-wrap",
                                    fontFamily: "inherit"
                                }}
                            >
                               {
    Array.isArray(questions)
        ? questions[currentQuestion]?.question
        : questions
}
                            </pre>

                            <textarea
                                className="answer-box"
                                rows="8"
                                placeholder="Write your answer here..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            ></textarea>

                            <br /><br />

                            <button
                                className="upload-btn"
                                onClick={evaluateAnswer}
                            >
                                Evaluate Answer
                            </button>
{
    Array.isArray(questions) &&
    currentQuestion < questions.length - 1 && (

        <button
            className="upload-btn"
            style={{ marginLeft: "10px" }}
            onClick={() => {
                setCurrentQuestion(currentQuestion + 1);
                setAnswer("");
                setFeedback("");
            }}
        >
            Next Question →
        </button>

    )
}
                            {

                                feedback && (

                                    <div className="report-section">

                                        <h2>🤖 AI Evaluation</h2>

                                        <pre
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                fontFamily: "inherit"
                                            }}
                                        >
                                            {feedback}
                                        </pre>

                                    </div>

                                )

                            }

                        </div>

                    )

                }

            </div>

        </div>

    );

}

export default Interview;