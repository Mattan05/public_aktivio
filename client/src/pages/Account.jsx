import { useEffect, useState } from "react";

function Account({isAuth, logOut, setUserEvents, setEventArr, userEvents}) {

/*     const [havePfp, setHavePfp] = useState(false); */
    const [user, setUser] = useState([]);
   /*  const [userEvents, setUserEvent] = useState([]); */

    let [responseMessage, setResponseMessage] = useState(null);
    let [messageCol, setMessageCol] = useState(false);

    const [showProfileUpdate, setShowProfileUpdate] = useState(false);
 /*    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showAccountSettings, setShowAccountSettings] = useState(false); */
    

    useEffect(() => {
        getUser();
      }, []);

      useEffect(() => {
        getUserEvents();
      }, [user]);

    async function getUser(){
            let res = await fetch("http://localhost/aktivio/user");
            let user = await res.json();

            if(user.error){
                console.log("Error at getUser" + eventData.error);
            }
         /*    if(user.pfp) setHavePfp(true); */
          /*   console.log(user.data + "19"); */
            setUser(user.data);
    }

    async function handleUpdateProfile(ev){
        ev.preventDefault();
        const username = ev.target.username.value;
        const email = ev.target.email.value;
        let updateData = {};
        if(username !== user.username){
            updateData.username = username;
        }
        if(email !== user.email){
            updateData.email = email;
        }
        if(email === user.email && username === user.username){
            setResponseMessage("Ange det/de fältet du vill ändra");
            setMessageCol(false);
        }
        updateData.id = user.id;
    try{
        let body = JSON.stringify(updateData);
        const response = await fetch("http://localhost/aktivio/updateProfile",{
            method:"PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });
        /* console.log("response "+ response); */
        let updateResponse = await response.json();
        /* console.log("updateResponse " + updateResponse); */
        if(updateResponse.error){
            setResponseMessage(updateResponse.error);
            setMessageCol(false);
        }else if(updateResponse.success){
        setResponseMessage(updateResponse.success);
        setMessageCol(true);
        getUser();
        }
    }catch(error){
        console.log("handleUpdateProfile "+error);
    }
    }

    async function updatePassword(ev){
        ev.preventDefault();
       try{
        let body = JSON.stringify({
            realPassword: user.password,
            currentPassword: ev.target.currentPassword.value,
            newPassword: ev.target.newPassword.value,
            confirmPassword: ev.target.confirmPassword.value,
            id: user.id
        });

        const responsePut = await fetch('http://localhost/aktivio/updatePassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });
        /* console.log(responsePut); */
        let serverRes = await responsePut.json(); 
        /* console.log("serverRes: " + serverRes); */
        if(serverRes.error){
            console.log("error:" + serverRes.error)
            setResponseMessage(serverRes.error);
            setMessageCol(false);
        }else if(serverRes.success){
            console.log("success " + serverRes.success);
            setResponseMessage(serverRes.success);
            setMessageCol(true);
        }
        
    }catch(error){
        console.log("Error" + error);
/*         setResponseMessage(error);
        setMessageCol(false); */
    }
    }

    function loadFile(ev){
        let image = document.getElementById("output");
        image.src = URL.createObjectURL(ev.target.files[0]);  //ska inte göra såhär sen utan med react state
      /*   console.log(image.src); */
    }

    async function getUserEvents(){
        let sessionId = user.id; //DEN ÄR ODEF
        /* console.log("IDIDID: " + sessionId) */
        const res = await fetch('http://localhost/aktivio/userEvents/'+sessionId);
            let userEvent = await res.json();

            if(userEvent.error){
                console.log("Error: " + userEvent.error);
                return;
            }
            console.log(userEvent);
            

            setUserEvents(userEvent);
            
            //IGÅR:skapar inlägg nu funkar inte det att deleteknappen poppar upp direkt. varför?
    }


  /*   function obj2Arr(object) {
        const array = [];
        for (let key in object) {
                array.push(object[key]);       
        }
        return array;
    } */
    

    async function delFunc(id){
  /*       ev.stopPropagation();
        ev.preventDefault();
 */
        
         let res = await fetch("http://localhost/aktivio/event/delete/"+id,{
             method: "DELETE"
     });
         let data = await res.json();
  
         if(data.error){
             console.log(data.error);
         }
         setEventArr(prev=>prev.filter(item=>item.id !== id));
        setUserEvents(prev=>prev.filter(item=>item.id!==id));
     }
//FÖR ATT LÄSA IN SINA EGNA EVENT
//1. Tar sitt id (user.id) och skickar in i en params route som sedan hämtar alla events WHERE userId = $id
//2. Sedan ska man loopa igenom den nere vid htmln med map, tänk på att det ska vara en array. ta inspo från Home.jsx och App.jsx
//med eventpage och events
    return ( 
    <>
        {isAuth ? 
        
<>
    
    <div className="account-wrapper">
            <section className="section-img">
            <div className="profile-pic">
                <img src={user.pfp} id="output" width="200" alt="Profile" />
                <label className="file-label" htmlFor="file">
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span>Byt Bild</span>
                </label>
                <input id="file" type="file" onChange={loadFile} />
            </div>      
            </section>
            <section className="user-info">
                <div className="user-details">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                {/* <div className="account-image">
                    <img
                        src={user.pfp}
                        alt="Account profile picture"
                    />
                </div> */}
            </section> {/* sen för fileupload */}
            <div className="server-message" >
                 <p style={{color: messageCol ? "green" : "red" }}>{responseMessage}</p>
             </div>
            {/* Update Profile Section */}
            <section className="update-profile">
                <details>
                <summary>Update Profile</summary>
                        <form onSubmit={handleUpdateProfile}>
                            <label htmlFor="username">Username:</label>
                            <input type="text" name="username" defaultValue={user.username} />

                            <label htmlFor="email">Email:</label>
                            <input type="email" name="email" defaultValue={user.email} />
                            <button type="submit">Update Profile</button>
                        </form>
                </details>
            </section>

            {/* Change Password Section */}
            
            <section className="change-password">
                <details>
                    <summary>Change Password</summary>
                        <form onSubmit={updatePassword}>
                            <label htmlFor="current-password">Current Password:</label>
                            <input type="password" name="currentPassword" />

                            <label htmlFor="new-password">New Password:</label>
                            <input type="password" name="newPassword" />

                            <label htmlFor="confirm-password">Confirm New Password:</label>
                            <input type="password" name="confirmPassword" />

                            <button type="submit">Change Password</button>
                        </form>
                  </details>
            </section>

            {/* Account Settings Links */}
            <section className="account-settings">
                <details>
                    <summary>Account Settings</summary>
                    <ul>
                        <li><a href="/notifications">Notification Settings</a></li>
                        <li><a href="/privacy">Privacy Settings</a></li>
                        <li><a href="/security">Security Settings</a></li>
                    </ul>
                </details>
            </section>

            <section>
                <div onClick={logOut} className="logout">
                    <p>Logga ut</p>
                    <span className="material-symbols-outlined">logout</span>
                </div>
            </section>  
    </div>
    <section>
        <div className="account-wrapper">
                <h1>Dina inlägg</h1>
                {userEvents.map(userEvent=>(
                    <div className ="event-card bg-secondary" key={userEvent.id}>
                    <div className="event_img">
                         <img src={userEvent.event_img} alt={userEvent.title}/>
                   </div>
                    <div>
                        <h2>{userEvent.title}</h2>
                        <p>Datum: {userEvent.event_date}</p>
                            <button className="del-cardButton" onClick={()=> delFunc(userEvent.id)}>
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                    </div>    
                </div>
                ))}
        </div>
        </section>
</>

    :

    <nav className="header-nav">
        <a href="#register"> Register</a>
        <a className="btn btn-warning" href="#login">Login</a>
    </nav>
    }
       
    </> 















    );   
}

export default Account;