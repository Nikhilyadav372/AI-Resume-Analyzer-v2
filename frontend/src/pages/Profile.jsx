import "../styles/Profile.css";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";


function Profile(){

const [user,setUser] = useState(null);


useEffect(()=>{

    loadProfile();

},[]);



const loadProfile = async()=>{

    try{

        const token = localStorage.getItem("token");


        const response = await api.get("/profile",{

            headers:{
                Authorization:`Bearer ${token}`,
            },

        });


        setUser(response.data.user);


    }catch(error){

        console.log(error);

    }

};



return(

<div>

<Navbar/>


<div className="profile-container">


<div className="profile-card">


<div className="profile-avatar">
👤
</div>


<h1>
Profile
</h1>


{
user && (

<div className="profile-info">


<div>
<h3>Name</h3>
<p>{user.name}</p>
</div>


<div>
<h3>Email</h3>
<p>{user.email}</p>
</div>


<div>
<h3>User ID</h3>
<p>{user.id}</p>
</div>


</div>

)

}


</div>


</div>


</div>

)

}


export default Profile;