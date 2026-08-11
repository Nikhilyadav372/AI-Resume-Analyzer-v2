import Loading from "../components/Loading";
import RecentActivity from "../components/RecentActivity";
import ATSLineChart from "../components/ATSLineChart";
import SkillsPieChart from "../components/SkillsPieChart";
import DashboardCharts from "../components/DashboardCharts";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import api from "../services/api";
import "../styles/Dashboard.css";


function Dashboard() {


  const [dashboardData, setDashboardData] = useState({

    total_resumes: 0,
    average_ats: 0,
    highest_ats: 0,
    latest_resume: null,

  });


  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);


  const fileInputRef = useRef(null);



  // ==========================
  // LOAD DASHBOARD
  // ==========================

  const loadDashboard = async () => {


    try {


      const response = await api.get("/dashboard");


      setDashboardData(response.data);



    } catch (error) {


      console.log(error);


      toast.error("Failed to load dashboard");


    }


  };




  // ==========================
  // PAGE LOAD
  // ==========================


  useEffect(() => {


    loadDashboard();


  }, []);





  // ==========================
  // UPLOAD RESUME
  // ==========================


  const uploadResume = async () => {



    if (!selectedFile) {


      toast.error("Please select a PDF file");

      return;


    }



    const formData = new FormData();


    formData.append(
      "resume",
      selectedFile
    );



    try {


      setLoading(true);



      const response = await api.post(

        "/upload-resume",

        formData,

        {
          headers: {

            "Content-Type":
              "multipart/form-data",

          },

        }

      );



      toast.success(
        response.data.message
      );



      setSelectedFile(null);


      await loadDashboard();



    } catch(error){



      console.log(error);



      if(error.response){

        toast.error(
          error.response.data.message
        );


      }
      else{


        toast.error(
          "Upload Failed"
        );


      }



    }
    finally{


      setLoading(false);


    }



  };





  if(loading){


    return <Loading />;


  }







  return (

    <div>


      <Navbar />



      <div className="upload-section">


        <h2 className="upload-title">

          📄 Upload Your Resume

        </h2>



        <p className="upload-text">

          Choose your PDF resume and let AI analyze it.

        </p>




        <button

          className="upload-btn"

          onClick={() =>
            fileInputRef.current.click()
          }

        >

          Choose Resume

        </button>





        <button

          className="upload-btn"

          onClick={uploadResume}

          disabled={loading}

        >


          {
            loading

            ? "⏳ Analyzing Resume..."

            : "🚀 Analyze Resume"

          }



        </button>




        <input

          type="file"

          accept=".pdf"

          ref={fileInputRef}

          style={{
            display:"none"
          }}


          onChange={(e)=>{


            if(
              e.target.files.length > 0
            ){

              setSelectedFile(
                e.target.files[0]
              );

            }


          }}


        />




        {

          selectedFile && (

            <p className="selected-file">

              ✅ {selectedFile.name}

            </p>

          )

        }



      </div>





      <div className="welcome-card">


        <h1>

          👋 Welcome Back

        </h1>



        <p>

          Upload your resume and get an AI-powered ATS analysis in seconds.

        </p>



      </div>






      <div className="dashboard">





        <DashboardCard

          title="Average ATS"

          value={dashboardData.average_ats}

          icon="📊"

        />



        <DashboardCard

          title="Highest ATS"

          value={dashboardData.highest_ats}

          icon="🏆"

        />



        <DashboardCard

          title="Total Resumes"

          value={dashboardData.total_resumes}

          icon="📄"

        />



        <DashboardCard

          title="Uploaded Resume"

          value={
            dashboardData.latest_resume
            ? "Yes"
            : "No"
          }

          icon="🤖"

        />




      </div>






      {
        dashboardData.total_resumes === 0 && (

          <div className="empty-state">


            <h2>
              📄 No Resume Found
            </h2>


            <p>
              Upload your first resume to get AI-powered ATS analysis.
            </p>


          </div>

        )
      }






      <DashboardCharts

        analyses={
          dashboardData.chart_data || []
        }

      />




      <ATSLineChart

        data={
          dashboardData.chart_data || []
        }

      />




      <SkillsPieChart

        skills={
          dashboardData.skills_chart || []
        }

      />




      <RecentActivity

        analyses={
          dashboardData.recent_analyses || []
        }

      />



    </div>

  );


}


export default Dashboard;