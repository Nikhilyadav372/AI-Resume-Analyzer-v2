import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";


function SkillsPieChart({ skills }) {


  const data = skills.map((item) => ({
    name: item.skill,
    value: item.count
  }));


  return (

    <div className="chart-container">

      <h2>
        Skills Distribution
      </h2>


      <ResponsiveContainer width="100%" height={350}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >

            {
              data.map((entry, index) => (

                <Cell key={`cell-${index}`} />

              ))
            }

          </Pie>


          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>


    </div>

  );

}


export default SkillsPieChart;