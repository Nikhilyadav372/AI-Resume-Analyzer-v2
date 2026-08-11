import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function DashboardCharts({ analyses }) {

  const data = analyses.map((item, index) => ({
    name: item.filename || `Resume ${index + 1}`,
    score: item.ats_score || 0,
  }));

  return (
    <div
      style={{
        marginTop: "30px",
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Resume ATS Score Analysis</h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis domain={[0, 100]} />

          <Tooltip />

          <Bar dataKey="score" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardCharts;