import Header from './components/Header';
import Footer from './components/Footer';
import Register from "./pages/Register";
import Home from './pages/Home';
import Login from './pages/Login';
import NavBar from './components/NavBar';
/* import Event from './components/Event'; */
import Account from './pages/Account';
import { useEffect, useState } from 'react';
import CreateEvent from './pages/CreateEvent';
import SignedInNavbar from './components/SignedInNavbar';
import EventPage from './pages/EventPage';
import { City } from 'country-state-city';
import Select from 'react-select';
import Favorites from './pages/Favoritess';
import Message from './pages/Message';

///////////////////////////7//
/* import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; */

function App() {
  const [eventArr, setEventArr] = useState([]);
  const [activeUser, setActiveUser] = useState(null); //session
  const [userId, setUserId] = useState(null);//session
  const [isAuth, setIsAuth] = useState(false);//session
  const [eventPage, setEventPage] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [allCities, setCities] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");

  const [selectedCity, setSelectedCity] = useState(null); // För att hålla reda på den valda staden

/*   const [likeCount, setlikeCount] = useState([]); */
  
/*   const [sortOrder, setSortOrder] = useState("latest");
const [selectedCity, setSelectedCity] = useState(null);

 */
/* console.log(eventArr); */
  useEffect(()=>{
    checkSessionStatus();
  }, []); //ta bort isAuth (update ska jag ha isAuth variabel i den eller [])

  useEffect(() => {
    window.location.replace('#home');
  }, []);
  
useEffect(()=>{ 
    getEvents();  
  }, [userEvents]);

/*   useEffect(()=>{ 
    getEvents();
  }, []);  */

  useEffect(()=>{
    getCities();
}, []);

useEffect(()=>{
  if (userId) {
  loadFavorites();
  }
}, [eventArr]);

useEffect(()=>{
  if (userId) {
  loadFavorites();
  }
}, [userId]); 


async function clearFilters(){
  setSelectedCity(null);

  await getEvents();
}

async function getCities(){
  try{
      const cities = City.getCitiesOfCountry('SE');
      const data = cities.map(city => ({
          key: city.name, /* ta bort kanske */
          value: city.name,
          label: city.name
      }));
      
      setCities(data);
  }catch(error){
      console.error('Failed to GET cities:', error);
  }
}

  async function loadFavorites(){
    try{
    const res = await fetch(`./loadFavorites?userId=${userId}`);

    const favorites = await res.json();
    if(favorites && favorites.success){
      setFavorites(favorites.success);
    }
    else{
      console.log("Problem setting favorites");
    }
  }catch (error) {
    console.error("Failed to load favorites:", error);
}
  }

  async function checkSessionStatus(){
    const res = await fetch('./auth');
    const sessionData = await res.json();
    /* console.log("SESSION", sessionData.user, sessionData.sessionId, sessionData.loggedIn) */
    if(sessionData.loggedIn === true){
    /*   console.log("Användaren är inloggad", sessionData.user, sessionData.sessionId, sessionData.loggedIn); */ /* lägg till sen */
      setActiveUser(sessionData.user);
      setUserId(sessionData.sessionId);
      setIsAuth(sessionData.loggedIn);
    }else{
      console.log('Användaren är inte inloggad');
    }
  }

  function handleSortChange(event) {
    const selectedSortOrder = event.target.value;
    /* console.log(selectedSortOrder); */
    setSortOrder(selectedSortOrder);
  }

  function handleCityChange(selectedOption) {
    if (selectedOption) {
      setSelectedCity(selectedOption.value); // Uppdatera den valda staden
    } else {
      setSelectedCity(null);
    }
  }
  

  async function logOut(){
    const res = await fetch("./logout");
    const logoutData = await res.json();
    if(logoutData.success){
      setActiveUser(null);
      setUserId(null);
      setIsAuth(false);
    }
  }

  async function getEvents(){
    let data = await fetch('./events',{
        method: 'GET'
    });
    const responseData = await data.json();
 /*    console.log(responseData); */
    if (data.ok) {
        /* console.log("Fetch OK!");  */
        setEventArr(responseData);
    } else {
        console.error("Failed to Fetch");
    }

  }

  async function loadEventPage(event) {
    console.log(event);

    let eventId = (typeof event === 'object' && event !== null && event.id) ? event.id : event;

    let res = await fetch("./event/" + eventId);
    let eventData = await res.json();

    if (eventData.error) {
        console.log(eventData.error);
    }

    setEventPage(eventData.data);
}


    return (
    <>
      <Header/>
      <main>
        <div className="views" id="register">
            <Register></Register>
        </div>
        
       {/*  <div className="views" id="favorites">
          {favorites.map(fav=>(
             <Favorites key={fav.event_id}s></Favorites>
          ))}
         
        </div> */}

        <div className="views" id="home">
          <h3 className="text-warning font-weight-bold text-center p-3">Välkommen {activeUser}</h3>
          <div className="filter-nav text-light">
              {/* <div className="text-center">
                <label>Sortera Tid:</label>
                <select className="custom-select rounded-pill" onChange={handleSortChange}>
                  <option value="latest">Senaste</option>
                  <option value="oldest">Äldsta</option>
                </select>
              </div> */}
              <div className="w-100 d-flex justify-content-center">
                
                <Select options={allCities} name="location-filter" className="w-50 text-dark rounded-pill" placeholder="Alla Platser" onChange={handleCityChange}/>
              </div>
             
            </div>
            <div className='mt-3 w-100 mb-4 d-flex justify-content-center'>
                <button onClick={clearFilters} className='btn btn-danger'>Rensa Filter</button>
            </div>  
            
          {eventArr.filter((event) => {
          if (!selectedCity) return true; // Om ingen stad är vald, visa alla events
          return event.location && event.location.toLowerCase() === selectedCity.toLowerCase(); // Filtrera på den valda staden
        })
        .length > 0 ? (
          eventArr.filter((event) => {
            if (!selectedCity) return true; // Om ingen stad är vald, visa alla events
            return event.location && event.location.toLowerCase() === selectedCity.toLowerCase(); // Filtrera på den valda staden
          })
          .map((event) => (
            <Home key={"key:" + event.id} setFavorites={setFavorites} userId={userId} isAuth={isAuth} event={event} setEventArr={setEventArr} setUserEvents={setUserEvents} setEventPage={setEventPage} loadEventPage={loadEventPage}/>
          ))
        ) : (
          <p className='text-danger text-center'>Inga evenemang matchar din sökning.</p>
        )}
      </div>

        <div className="views" id="message">
          <Message/>
        </div>

        <div className="views" id="login">
          <Login checkSessionStatus={checkSessionStatus}></Login>
        </div>

        <div className="views" id="profile">
          <Account userEvents={userEvents} isAuth={isAuth} setUserEvents={setUserEvents} setEventPage={setEventPage} setEventArr={setEventArr} logOut={logOut}></Account>
        </div>

        <div className="views" id="create">
          <CreateEvent isAuth= {isAuth} allCities={allCities} userId={userId} setUserEvents={setUserEvents} setEventArr={setEventArr} getEvents={getEvents}></CreateEvent>
        </div>

        <div className="views" id="eventPage">
          <EventPage eventPage={eventPage}></EventPage>
        </div>

        <div className="views" id="favorites">
          
        <h1 className="text-center text-light">Dina Favoriter</h1>
        
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
              <Favorites isAuth={isAuth} userId={userId} key={"fav_"+favorite.event_id} favorite={favorite} loadEventPage={loadEventPage}></Favorites>
          ))
        ) : (
            <p className="text-light text-center">Inga favoriter ännu!</p>
        )}
    
        </div>

      </main>
      {isAuth ?  (<SignedInNavbar/>) : (<NavBar/>)}
          
      <Footer/>
      
       {/*  #facebookgrupp vad händer i halmstad
        #koncentrera halmstad eller sortera städer
        # login email lösenord
        # titel, datum, beskrivning, plats,
        */}
    </> 
            );
}

export default App;