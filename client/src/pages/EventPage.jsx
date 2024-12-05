function EventPage({eventPage}) {
    return ( 
    <>
        <div className="event-container text-white text-center">
            <div className="event-image">
                <img src={eventPage.event_img} alt="Event Image" />
                <hr />
                <h1>{eventPage.title}</h1>
                <p><i>{eventPage.event_date}</i></p>
                <p><strong>Plats: </strong>{eventPage.location}</p>
                <hr />
                <div className="wrapper p-3">
                    <div className="rounded-lg bg-secondary">
                        <h3>Beskrivning:</h3>
                        <p>{eventPage.description}</p>
                    </div>
                </div>
                
                
            </div>
        </div>
    </> 
);
}

export default EventPage;