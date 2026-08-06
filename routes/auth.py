from collections import Counter
from io import BytesIO
from flask import send_file
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from werkzeug.utils import secure_filename
import uuid
from database import get_connection
from google import genai
import fitz
import os 
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)


auth = Blueprint("auth", __name__)
from dotenv import load_dotenv
load_dotenv()

print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY")[:15] + "...")

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
ALLOWED_EXTENSIONS = {"pdf"}
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

# ---------------- HEALTH API ----------------
@auth.route("/health", methods=["GET"])
def health():
    return {
        "status": "success",
        "message": "AI Resume Analyzer Backend is Running"
    }, 200


# ---------------- REGISTER API ----------------
@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid JSON data"
        }), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        # Check if email already exists
        query = "SELECT id FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "success": False,
                "message": "Email already registered"
            }), 409

        # Hash password
        hashed_password = generate_password_hash(password)

        # Insert new user
        query = """
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
        """

        cursor.execute(query, (full_name, email, hashed_password))
        connection.commit()

        return jsonify({
            "success": True,
            "message": "User Registered Successfully"
        }), 201

    except Exception as e:
        print("REGISTER ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()

# ---------------- LOGIN API ----------------
@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid JSON data"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and Password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        print("User:", user)
        if user is None:
            return jsonify({
                "success": False,
                "message": "Invalid Email or Password"
            }), 401
        print("Entered Password:", password)
        print("Stored Password:", user["password"] if user else "No User")
        print("Password Match:", check_password_hash(user["password"], password) if user else False)
        if not check_password_hash(user["password"], password):
            return jsonify({
                "success": False,
                "message": "Invalid Email or Password"
            }), 401

        access_token = create_access_token(identity=str(user["id"]))

        return jsonify({
            "success": True,
            "message": "Login Successful",
            "token": access_token
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()
# ---------------- PROFILE API ----------------
@auth.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    connection = None
    cursor = None

    try:
        current_user = get_jwt_identity()
        print("JWT Identity:", current_user)
        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)
        current_user = int(get_jwt_identity())
        query = """
        SELECT id, name, email
        FROM users
        WHERE id = %s
        """
       
       
        cursor.execute(query, (current_user,))
        user = cursor.fetchone()
        print("User From Database:", user)

        if user is None:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Profile Loaded Successfully",
            "user": user
        }), 200

    except Exception as e:
        print("PROFILE ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()
          
# ---------------- UPLOAD API ----------------
@auth.route("/upload-resume", methods=["POST"])
@jwt_required()
def upload_resume():

    print("========== UPLOAD API CALLED ==========")
    print("========== UPLOAD API CALLED ==========")
    print("FILES:", request.files)
    print("FORM:", request.form)
    print("CONTENT TYPE:", request.content_type)    
    connection = None
    cursor = None

    try:
        current_user = int(get_jwt_identity())

        file = request.files.get("resume")

        if file is None:
            return jsonify({
                "success": False,
                "message": "No resume file uploaded"
            }), 400

        if file.filename == "":
            return jsonify({
                "success": False,
                "message": "Please select a PDF file"
            }), 400
                # File Size Check (5 MB)
        if file.content_length and file.content_length > 5 * 1024 * 1024:
            return jsonify({
                "success": False,
                "message": "File size should be less than 5MB"
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "message": "Only PDF files are allowed"
            }), 400

        filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
        filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
)

        file.save(filepath)
        print("✅ File Saved:", filepath)

        doc = fitz.open(filepath)

        resume_text = ""

        for page in doc:
            resume_text += page.get_text()

        doc.close()
        print("✅ PDF Text Extracted")
        skills = [
            "Python",
            "Java",
            "C",
            "C++",
            "SQL",
            "MySQL",
            "Flask",
            "Django",
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Node.js",
            "Git",
            "GitHub",
            "Machine Learning",
            "AI",
            "Data Science"
        ]
        detected_skills = []

        for skill in skills:
            if skill.lower() in resume_text.lower():
                detected_skills.append(skill)


        # ==========================
        # ATS SCORE CALCULATION
        # ==========================

        total_skills = len(skills)

        found_skills = len(detected_skills)


        if total_skills > 0:

            score = int(
                (found_skills / total_skills) * 100
            )

        else:

            score = 0


        missing_skills = []

        for skill in skills:
            if skill not in detected_skills:
                missing_skills.append(skill)

        for skill in skills:
            if skill not in detected_skills:
                missing_skills.append(skill)

        prompt = f"""
You are an expert ATS Resume Reviewer.

Analyze the following resume and respond in this format:

1. Resume Summary
2. Strengths
3. Weaknesses
4. Missing Skills
5. ATS Score out of 100
6. Suggestions for Improvement

Resume:

{resume_text}
"""

        print("API KEY:", os.getenv("GEMINI_API_KEY")[:10] + "...")
        print("Using Model: gemini-3.1-flash-lite")
        print("Client Created Successfully")

        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )
        print("🚀 Calling Gemini API...")
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        ai_feedback = response.text
        print("✅ Gemini Response Received")
        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor()

        insert_query = """
        INSERT INTO resume_analysis
        (user_id, filename, ats_score, detected_skills, missing_skills, ai_feedback)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        print("Current User:", current_user)
        print("Filename:", filename)
        print("ATS Score:", score)
        print("Detected Skills:", ", ".join(detected_skills))
        print("Missing Skills:", ", ".join(missing_skills))
        print("AI Feedback:", ai_feedback[:100])
        print("💾 Saving Analysis to Database...")
        cursor.execute(
            insert_query,
            (
                current_user,
                filename,
                score,
                ", ".join(detected_skills),
                ", ".join(missing_skills),
                ai_feedback
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Resume Uploaded Successfully",
            "filename": filename,
            "detected_skills": detected_skills,
            "missing_skills": missing_skills,
            "ats_score": score,
            "ai_feedback": ai_feedback
        }), 200

    except Exception as e:
        print("UPLOAD ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error",
            "error": str(e)
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()
            
  
# ---------------- ANALYSIS HISTORY API ----------------
@auth.route("/analysis-history", methods=["GET"])
@jwt_required()
def analysis_history():

    connection = None
    cursor = None

    try:
        current_user = int(get_jwt_identity())

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            id,
            filename,
            ats_score,
            detected_skills,
            missing_skills,
            ai_feedback,
            created_at
        FROM resume_analysis
        WHERE user_id = %s
        ORDER BY created_at DESC
        """

        cursor.execute(query, (current_user,))
        history = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(history),
            "history": history
        }), 200

    except Exception as e:
        print("HISTORY ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()
@auth.route("/generate-interview", methods=["POST"])
@jwt_required()
def generate_interview():

    connection = None
    cursor = None

    try:

        current_user = int(get_jwt_identity())

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT filename, ai_feedback
        FROM resume_analysis
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 1
        """

        cursor.execute(query, (current_user,))
        resume = cursor.fetchone()

        if resume is None:

            return jsonify({
                "success": False,
                "message": "Please upload a resume first."
            }), 400

        prompt = f"""
You are an expert technical interviewer.

Based on the resume analysis below, generate exactly 10 interview questions.

Requirements:
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- Mix HR and Technical questions.
- Medium difficulty.

Format:

[
  {{
    "id": 1,
    "question": "Tell me about yourself."
  }},
  {{
    "id": 2,
    "question": "Explain your biggest project."
  }}
]

Resume Analysis:

{resume["ai_feedback"]}
"""

        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        import json

        questions_text = response.text.strip()

        questions_text = questions_text.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

        questions = json.loads(questions_text)

        insert_query = """
        INSERT INTO interview_history
        (user_id, questions)
        VALUES (%s, %s)
        """

        cursor.execute(
            insert_query,
            (
                current_user,
                questions_text
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "questions": questions
        }), 200
    

       
    except Exception as e:

        print("INTERVIEW ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()      


@auth.route("/evaluate-answer", methods=["POST"])
@jwt_required()
def evaluate_answer():

    try:

        data = request.get_json()

        question = data.get("question")
        answer = data.get("answer")

        if not question or not answer:

            return jsonify({
                "success": False,
                "message": "Question and Answer are required."
            }), 400

        prompt = f"""
You are a professional technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Answer:
{answer}

Give your response in exactly this format:

Score: X/10

Strengths:
- ...

Weaknesses:
- ...

Suggestions:
- ...
"""

        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        return jsonify({
            "success": True,
            "feedback": response.text
        }), 200

    except Exception as e:

        print("EVALUATE ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500                  


# ---------------- SINGLE ANALYSIS API ----------------
# ---------------- SINGLE ANALYSIS API ----------------
@auth.route("/analysis/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis(analysis_id):

    connection = None
    cursor = None

    try:
        current_user = int(get_jwt_identity())

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            id,
            filename,
            ats_score,
            detected_skills,
            missing_skills,
            ai_feedback,
            created_at
        FROM resume_analysis
        WHERE id = %s
        AND user_id = %s
        """

        cursor.execute(query, (analysis_id, current_user))
        analysis = cursor.fetchone()

        if analysis is None:
            return jsonify({
                "success": False,
                "message": "Analysis not found"
            }), 404

        return jsonify({
            "success": True,
            "analysis": analysis
        }), 200

    except Exception as e:
        print("GET ANALYSIS ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
         connection.close()
         # ---------------- DELETE ANALYSIS API ----------------
# ---------------- DELETE ANALYSIS API ----------------
@auth.route("/analysis/<int:analysis_id>", methods=["DELETE"])
@jwt_required()
def delete_analysis(analysis_id):

    connection = None
    cursor = None

    try:

        current_user = int(get_jwt_identity())

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor()

        delete_query = """
        DELETE FROM resume_analysis
        WHERE id = %s AND user_id = %s
        """

        cursor.execute(delete_query, (analysis_id, current_user))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Analysis Not Found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Analysis Deleted Successfully"
        }), 200

    except Exception as e:

        print("DELETE ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:

        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()            




        # ---------------- TOTAL RESUMES ----------------
       # ---------------- DASHBOARD API ----------------
@auth.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    connection = None
    cursor = None

    try:
        current_user = int(get_jwt_identity())

        print("JWT Identity:", get_jwt_identity())

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        # ---------------- TOTAL RESUMES ----------------
        total_query = """
        SELECT COUNT(*) AS total_resumes
        FROM resume_analysis
        WHERE user_id = %s
        """

        cursor.execute(total_query, (current_user,))
        total_resumes = cursor.fetchone()["total_resumes"]

        # ---------------- AVERAGE ATS ----------------
        average_query = """
        SELECT AVG(ats_score) AS average_ats
        FROM resume_analysis
        WHERE user_id = %s
        """

        cursor.execute(average_query, (current_user,))
        average_ats = cursor.fetchone()["average_ats"]

        if average_ats is None:
            average_ats = 0
        else:
            average_ats = round(float(average_ats), 2)

        # ---------------- HIGHEST ATS SCORE ----------------
        highest_query = """
        SELECT MAX(ats_score) AS highest_ats
        FROM resume_analysis
        WHERE user_id = %s
        """

        cursor.execute(highest_query, (current_user,))
        highest_ats = cursor.fetchone()["highest_ats"]

        if highest_ats is None:
            highest_ats = 0

        # ---------------- LATEST RESUME ----------------
        latest_query = """
        SELECT
            filename,
            ats_score,
            created_at
        FROM resume_analysis
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 1
        """

        cursor.execute(latest_query, (current_user,))
        latest_resume = cursor.fetchone()

        # ---------------- RECENT ANALYSES ----------------
        recent_query = """
        SELECT
            id,
            filename,
            ats_score,
            created_at
        FROM resume_analysis
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 5
        """
                # ---------------- CHART DATA ----------------
        chart_query = """
        SELECT
            filename,
            ats_score,
            created_at
        FROM resume_analysis
        WHERE user_id = %s
        ORDER BY created_at ASC
        """
        

        cursor.execute(chart_query, (current_user,))
        chart_data = cursor.fetchall()

        cursor.execute(recent_query, (current_user,))
        recent_analyses = cursor.fetchall()
                # ---------------- SKILLS DATA ----------------

        skills_query = """
        SELECT detected_skills
        FROM resume_analysis
        WHERE user_id = %s
        """

        cursor.execute(skills_query, (current_user,))
        skills_data = cursor.fetchall()


        skill_counter = Counter()


        for item in skills_data:

            if item["detected_skills"]:

                skills = item["detected_skills"].split(",")

                for skill in skills:
                    skill_counter[skill.strip()] += 1


        skills_chart = []


        for skill, count in skill_counter.items():

            skills_chart.append({
                "skill": skill,
                "count": count
            })

            return jsonify({
            "success": True,
            "total_resumes": total_resumes,
            "average_ats": average_ats,
            "highest_ats": highest_ats,
            "latest_resume": latest_resume,
            "recent_analyses": recent_analyses,
            "chart_data": chart_data,
            "skills_chart": skills_chart
        }), 200
    except Exception as e:
        import traceback

        print("\n========== DASHBOARD ERROR ==========")
        traceback.print_exc()
        print("=====================================\n")

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()
            # ---------------- DOWNLOAD PDF API ----------------
@auth.route("/analysis/<int:analysis_id>/download", methods=["GET"])
@jwt_required()
def download_analysis_pdf(analysis_id):

    connection = None
    cursor = None

    try:
        current_user = int(get_jwt_identity())

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            filename,
            ats_score,
            detected_skills,
            missing_skills,
            ai_feedback,
            created_at
        FROM resume_analysis
        WHERE id = %s
        AND user_id = %s
        """

        cursor.execute(query, (analysis_id, current_user))
        analysis = cursor.fetchone()

        if analysis is None:
            return jsonify({
                "success": False,
                "message": "Analysis not found"
            }), 404

        buffer = BytesIO()

        document = SimpleDocTemplate(buffer)
        styles = getSampleStyleSheet()

        story = []

        story.append(
            Paragraph(
                "<b>AI Resume Analysis Report</b>",
                styles["Heading1"]
            )
        )

        story.append(Paragraph("<br/>", styles["Normal"]))

        story.append(
            Paragraph(
                f"<b>Filename:</b> {analysis['filename']}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                f"<b>ATS Score:</b> {analysis['ats_score']}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                f"<b>Detected Skills:</b> {analysis['detected_skills']}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                f"<b>Missing Skills:</b> {analysis['missing_skills']}",
                styles["Normal"]
            )
        )

        story.append(Paragraph("<br/>", styles["Normal"]))

        story.append(
            Paragraph(
                "<b>AI Feedback</b>",
                styles["Heading2"]
            )
        )

        story.append(
            Paragraph(
                analysis["ai_feedback"],
                styles["Normal"]
            )
        )

        document.build(story)

        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name="AI_Resume_Analysis_Report.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        print("DOWNLOAD PDF ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()

        


@auth.route("/interview-questions", methods=["GET"])
@jwt_required()
def interview_questions():

    return jsonify({
        "success": True,
        "message": "Interview API Working"
    }), 200