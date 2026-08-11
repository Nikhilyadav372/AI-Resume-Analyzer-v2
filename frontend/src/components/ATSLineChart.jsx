import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";


function ATSLineChart({ data }) {


  const chartData = data.map((item, index) => ({
    name: `Resume ${index + 1}`,
    score: item.ats_score
  }));


  return (

    <div className="chart-container">

      <h2>
        ATS Score Trend
      </h2>


      <ResponsiveContainer width="100%" height={350}>

        <LineChart data={chartData}>

          <CartesianGrid strokeDasharray="3 3" />


          <XAxis 
            dataKey="name"
          />


          <YAxis 
            domain={[0,100]}
          />


          <Tooltip />


          <Line
            type="monotone"
            dataKey="score"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>


    </div>

  );

}


export default ATSLineChart;