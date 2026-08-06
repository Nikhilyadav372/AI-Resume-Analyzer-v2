import os
import json

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from google import genai

from database import get_connection

job_match_bp = Blueprint("job_match", __name__)


@job_match_bp.route("/job-match", methods=["POST"])
@jwt_required()
def job_match():

    connection = None
    cursor = None

    try:

        current_user = int(get_jwt_identity())

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required."
            }), 400

        job_description = data.get("job_description", "").strip()

        if job_description == "":
            return jsonify({
                "success": False,
                "message": "Job Description is required."
            }), 400

        connection = get_connection()

        if connection is None:
            return jsonify({
                "success": False,
                "message": "Database Connection Failed"
            }), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                ai_feedback,
                detected_skills,
                missing_skills
            FROM resume_analysis
            WHERE user_id=%s
            ORDER BY created_at DESC
            LIMIT 1
        """, (current_user,))

        resume = cursor.fetchone()

        if resume is None:
            return jsonify({
                "success": False,
                "message": "Please upload a resume first."
            }), 404

        prompt = f"""
You are an ATS Resume Matching Expert.

Compare the resume with the job description.

Resume Analysis:

{resume["ai_feedback"]}

Detected Skills:

{resume["detected_skills"]}

Missing Skills:

{resume["missing_skills"]}

Job Description:

{job_description}

Return ONLY valid JSON.

Format:

{{
  "match_score":85,
  "matched_skills":[
      "Python",
      "Flask"
  ],
  "missing_skills":[
      "Docker",
      "AWS"
  ],
  "suggestions":[
      "Learn Docker",
      "Add Cloud Experience",
      "Improve Resume Keywords"
  ]
}}
"""

        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )
        ai_response = response.text.strip()

        # Remove markdown if Gemini returns ```json ... ```
        if ai_response.startswith("```json"):
            ai_response = ai_response.replace("```json", "").replace("```", "").strip()

        elif ai_response.startswith("```"):
            ai_response = ai_response.replace("```", "").strip()

        try:
            result = json.loads(ai_response)

        except Exception:
            return jsonify({
                "success": False,
                "message": "Invalid AI response.",
                "ai_response": ai_response
            }), 500

        return jsonify({
            "success": True,
            "match_score": result.get("match_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "suggestions": result.get("suggestions", [])
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()