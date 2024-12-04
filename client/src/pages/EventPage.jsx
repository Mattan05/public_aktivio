function EventPage({eventPage}) {
    return ( 
    <>
        <div className="event-container text-white text-center">
            <div className="event-image">
                <img src={eventPage.event_img} alt="Event Image" />
                <p>{eventPage.title}</p>
                <p><i>{eventPage.event_date}</i></p>
                <p>{eventPage.location}</p>
                <h3>Beskrivning:</h3>
                <p>{eventPage.description}</p>
                
            </div>
        </div>
    </> 
);
}

export default EventPage;