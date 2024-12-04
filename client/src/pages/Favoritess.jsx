import { useEffect, useState } from 'react';
function Favorites({ favorite, userId, isAuth, loadEventPage }) {
   /*  useEffect(()=>{
        getFavoriteObjects();
      }, []);

      async function getFavoriteObjects(){

      } */
      return (
        <>
          {favorite.type !== "ad" ? (
            <a href="#eventPage">
              <div className="wrapper-cards p-2" onClick={() => loadEventPage(favorite)}> 
                <div className="event-card bg-secondary">
                  <div className="event_img">
                    <img

                      src={favorite.event_img}
                      alt={favorite.title}
                    />
                  </div>
                  <div className="card-info d-block align-items-center text-center p-2">
                    <h4 className="">{favorite.title}</h4>
                    <p>{favorite.event_date}</p>
                  </div>
      
                  <div className="cardButtons">
                    {String(userId) === String(favorite.userId)|| String(userId) === String(48) && (
                      <button className="del-cardButton" onClick={delFunc}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                    {/* {isAuth && (
                      <button
                        className="fav-cardButton"
                        onClick={colorFavorite ? removeFavorite : addFavorite}
                        style={{ color: colorFavorite ? 'red' : 'black' }}
                      >
                        <span className="material-symbols-outlined">favorite</span>
                        <p>{favorite.like_count}</p>
                      </button>
                    )} */}
                  </div>
                </div>
              </div>
            </a>
          ) : (
            <a href={favorite.ad_link}>
            <div className="wrapper-cards" >
              <div className="ad-card bg-warning">
                <div className="card-info">
                  <h2>{favorite.title}</h2>
                  <p>{favorite.description}</p>
                  <button className="btn">Klicka för att gå vidare!</button>
                </div>
              </div>
            </div>
            </a>
          )}
        </>
      );
    }

export default Favorites;