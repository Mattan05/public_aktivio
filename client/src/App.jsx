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
  
/*   const [sortOrder, setSortOrder] = useState("latest");
const [selectedCity, setSelectedCity] = useState(null);

 */

  useEffect(()=>{
    checkSessionStatus();
  }, []); //ta bort isAuth (update ska jag ha isAuth variabel i den eller [])

  useEffect(() => {
    window.location.replace('#home');
  }, []);
  
  useEffect(()=>{ //ska det vara async
    getEvents();  
  }, []);

  useEffect(()=>{
    getCities();
}, []);

useEffect(()=>{
  if (userId) {
  loadFavorites();
  }
}, [userId]);

async function getCities(){
  try{
      const cities = City.getCitiesOfCountry('SE');
      const data = cities.map(city => ({
          value: city.name,
          label: city.name
      }));
      
      setCities(data);
     
  }catch(error){
      console.error('Failed to GET cities:', error);
  }
}

  async function loadFavorites(){
    const res = await fetch(`http://localhost/aktivio/loadFavorites?userId=${userId}`);

    const favorites = await res.json();
    if(favorites){
      setFavorites(favorites.success);
    }
    /* BEHÖVS LITE FIX VID REMOVE OCH AD FÖR DET DUBBLERAS NU. PLUS VID  */
  }

  async function checkSessionStatus(){
    const res = await fetch('http://localhost/aktivio/auth');
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

  function handleSortChange(){
    return [];
  }

  function handleCityChange (){
    return [];
  }

  async function logOut(){
    const res = await fetch("http://localhost/aktivio/logout");
    const logoutData = await res.json();
    if(logoutData.success){
      setActiveUser(null);
      setUserId(null);
      setIsAuth(false);
    }
  }

  async function getEvents(){
    let data = await fetch('http://localhost/aktivio/events',{
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

  async function loadEventPage(event){
    let res = await fetch("http://localhost/aktivio/event/"+event.id);
    let eventData = await res.json();

    if(eventData.error){
        console.log(eventData.error);
    }
/*      console.log(eventData.data); */
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
          <h3 className="text-light text-center">Välkommen {activeUser}</h3>
          <div className="filter-nav p-2 text-light">
              <div className="text-center">
                <label>Sortera Tid:</label>
                <select className="custom-select rounded-pill" onChange={handleSortChange}>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>

              <div className="text-center">
                <label>Sortera Plats:</label>
                <Select options={allCities} name="location-filter" className="text-dark rounded-pill" placeholder="Alla Platser" onChange={handleCityChange}/>
                {/* <select className="custom-select rounded-pill">
                  <option value="all">All Locations</option>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                </select> */}
              </div>
          </div>
          {eventArr.map(event => (
            <Home key={event.id} setFavorites={setFavorites} userId={userId} isAuth={isAuth} event={event} setEventArr={setEventArr} setUserEvents={setUserEvents} setEventPage={setEventPage} loadEventPage={loadEventPage}/>
          ))}
        </div>

        <div className="views" id="login">
          <Login checkSessionStatus={checkSessionStatus}></Login>
        </div>

        <div className="views" id="profile">
          <Account userEvents={userEvents} isAuth={isAuth} setUserEvents={setUserEvents} setEventPage={setEventPage} setEventArr={setEventArr} logOut={logOut}></Account>
        </div>

        <div className="views" id="create">
          <CreateEvent allCities={allCities} userId={userId} setUserEvents={setUserEvents} setEventArr={setEventArr} getEvents={getEvents}></CreateEvent>
        </div>

        <div className="views" id="eventPage">
          <EventPage eventPage={eventPage}></EventPage>
        </div>

        <div className="views" id="favorites">
        <h1 className="text-center text-light">Dina Favoriter</h1>
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
              <Favorites isAuth={isAuth} userId={userId} key={favorite.id} favorite={favorite} loadEventPage={loadEventPage}></Favorites>
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