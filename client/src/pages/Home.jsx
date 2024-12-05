import {useState, useEffect } from 'react';

function Home({event, setEventArr, setUserEvents, setEventPage, isAuth, userId, setFavorites, loadEventPage}) {

   /*  const [del, setDel] = useState(); */
    //AVSLUTADE IGÅR MÅNDAG: VILL ATT INNEHÅLLET PÅ HOME SKA BLI UPPDATERAT NÄR MAN SKAPAR POST.
    const [colorFavorite, setColorFavorite] = useState(false);

  /*   console.log("colorFavorite " + colorFavorite); */
  
    useEffect(() => {
        fetchFavoriteStatus();
    }, [userId, event.id]);
    
    useEffect(() => {
        window.location.replace('#home');
      }, []);

      async function fetchFavoriteStatus() {
        try {
            let res = await fetch(`http://localhost/aktivio/isFavorite?userId=${userId}&eventId=${event.id}`);
            let data = await res.json();
              
            if (data['success']) {
                setColorFavorite(true);
            }
        } catch (error) {
            console.error("Kunde inte hämta favoritstatus:", error);
        }
    }

        async function delFunc(ev){
           ev.stopPropagation();
           ev.preventDefault();
            let res = await fetch("http://localhost/aktivio/event/delete/"+event.id,{
                method: "DELETE"
        });
            let data = await res.json();

            if(data.error){
                console.log(data.error);
            }
            setEventArr(prev=>prev.filter(item=>item.id != event.id));
            setUserEvents(prev=>prev.filter(item=>item.id != event.id));  //funkar ej om jag lägger till !==
        }
/*
        async function loadEventPage(){
            let res = await fetch("http://localhost/aktivio/event/"+event.id);
            let eventData = await res.json();

            if(eventData.error){
                console.log(eventData.error);
            }
       
            setEventPage(eventData.data);
            
        } */

        async function addFavorite(ev){
            //lägg sedan till en counter för likes som det ska finnas ett attribut för i event tabellen. 
            ev.stopPropagation();
            ev.preventDefault();
            console.log(ev);
            /* if(colorFavorite){
              console.log("Redan gillad");
              return;
            } */

            let body = JSON.stringify({
                userId:userId,
                event_id:event.id
            });


            let serverRes = await fetch("http://localhost/aktivio/addFavorite",{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });

            let favRes = await serverRes.json()
          /*   console.log(favRes); */
       /*  console.log(favRes.success); */
            if(favRes.error){
                console.log("Error: " + favRes.error)
            }
            if(favRes.success){
              /*   setFavorites(favRes.success); */
         /*        setColorFavorite(true); */

         //GÖR OM SÅ ATT ISTÄLLET FÖR ONCLICK SKA FUNKTIONEN KALLAS PÅ EFTER STATE ÄNDRING!!!!! 

                /* setColorFavorite(prev=>{
                    let e = {...event};
                    console.log("hejid");
                    console.log("id:"+e.id);
                    console.log(prev);
                    if(!prev) setFavorites(prev=>[e,...prev]);
                    else setFavorites(prev=>prev.filter(ch=>ch.id!=e.id));
                    return !prev;
                  }); */
  /*         console.log("EVENT");
          console.log(event) */
                setFavorites(prev => [event, ...prev]);
                setColorFavorite(true);
                
                setEventArr((prevEvents) =>
                  prevEvents.map((item) =>
                    item.id === event.id
                      ? { ...item, like_count: Number(item.like_count) + 1 }  
                      : item
                  )
                );
                
     

            }
          /* console.log(colorFavorite); */
           
        }

        async function removeFavorite(ev){ //LÄGG REMOVEFAVORITE OCH ADDFAVORITE I APP FÖR ATT SEDAN KUNNA ANVÄNDA I FAVORITES.JSX OCKSÅ
            ev.stopPropagation();
            ev.preventDefault();
            console.log("remove");

            let body = JSON.stringify({
                userId:userId,
                event_id:event.id
            }); //KANSKE INTE BEHÖVS. GÖR BARA ATT NÄR MAN SKAPAR SKICKAS OCKSÅ GET-RESULT FÖR FAV_ID TILLBAKS SOM SEDAN LAGRAS NÅGONSTANS OCH KAN FÅ TAG PÅ AV EV ELLER NÅTT

            let serverRes = await fetch("http://localhost/aktivio/removeFavorite",{
                method:"DELETE",
                headers:{
                    'Content-Type': 'application/json'
                },
                body
            });

            let deleteRes = await serverRes.json();
           /*  console.log("gegfdg"+deleteRes); */
            if(deleteRes.error){
                console.log("Error:" + deleteRes.error);
                return;
            }
            setFavorites(prev => prev.filter(fav => fav.id !== event.id));
            setColorFavorite(false);

            setEventArr((prevEvents) =>
              prevEvents.map((item) =>
                item.id === event.id
                  ? { ...item, like_count: Number(item.like_count) - 1 }  
                  : item
              )
            );
        }  
        
        return (
            <>
              {event.type !== "ad" ? (
                <a href="#eventPage">
                  <div onClick={() => loadEventPage(event)} className="wrapper-cards p-2">
                    <div className="event-card" id={event.id}>
                      <div className="event_img">
                        <img
                          className=' '/* rounded-lg */
                          // style={event.event_img === 'no_image.jpg' ? { display: 'none' } : { display: 'block' }}
                          src={event.event_img}
                          alt={event.title}
                        />
                      </div>
                      <div className="card-info align-items-center text-center p-2">
                        <div className="text-warning">
                          <h4 className="">{event.title}</h4>
                          <p>{event.event_date}</p>
                        </div>

                        <div className="cardButtons">
                        {String(userId) === String(event.userId)|| String(userId) === String(48) && (
                          <button className="del-cardButton" onClick={delFunc}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                        {isAuth && (
                          <button
                            className="fav-cardButton"
                            onClick={colorFavorite ? removeFavorite : addFavorite}
                            style={{ color: colorFavorite ? 'red' : 'black' }}
                          >
                            <span className="material-symbols-outlined">favorite</span>
                            <strong>{event.like_count}</strong>
                          </button>
                        )}
                      </div>
                      </div>            
                    </div>
                  </div>
                </a>
              ) : (
                <a href={event.ad_link}>
                <div className="wrapper-cards" >
                  <div className="ad-card bg-warning">
                    <div className="card-info">
                      <h2>{event.title}</h2>
                      <p>{event.description}</p>
                      <button className="btn btn-danger">Klicka för att gå vidare!</button>
                    </div>
                  </div>
                </div>
                </a>
              )}
            </>
          );
        }
export default Home;