function RecentActivity({ analyses }) {

  return (

    <div className="activity-container">

      <h2>
        Recent Resume Analysis
      </h2>


      {
        analyses.length === 0 ? (

          <p>
            No resume uploaded yet.
          </p>

        ) : (

          analyses.map((item) => (

            <div 
              className="activity-card"
              key={item.id}
            >

              <div>

                <h3>
                  📄 {item.filename}
                </h3>

                <p>
                  ATS Score: {item.ats_score}
                </p>

              </div>


              <span>
                {new Date(item.created_at)
                .toLocaleDateString()}
              </span>


            </div>

          ))

        )
      }


    </div>

  );

}


export default RecentActivity;