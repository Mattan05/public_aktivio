import { useState, useEffect, useRef } from 'react';
/* import { City } from 'country-state-city'; */

import Select from 'react-select'

function CreateEvent({setEventArr, setUserEvents, userId, allCities}) {

   /*  console.log("postmadeby"+ userId); */
    useEffect(()=>{
        getCategories();
    }, []);

/*     useEffect(()=>{
        getCities();
    }, []);
 */

    
    
    const formRef = useRef(null);
    const [responseMessage, setResponseMessage] = useState(null);
    const [messageCol, setMessageCol] = useState(false);
    const [allCategories, setCategories] = useState([]);
   /*  const [allCities, setCities] = useState([]);
 */
    async function handleSubmit(event) {

        event.preventDefault();

     /*    if(event.target.event_img.files[0].size>2000000) return alert("File is too big");
        console.log(event.target.event_img.files[0].name); */
        //HA EN SEPARAT ROUTE FÖR FIL OCH ETT EGET FORMULÄR FÖR FIL SOM SKICKAS I KOMIBANTION MED KNAPP FÖR ANDRA FÖRUMULÄRET.

        let body = JSON.stringify({
            title: event.target.title.value,
            event_date: event.target.event_date.value,
            location: event.target.location.value,
            description: event.target.description.value,
            /* event_img: event.target.event_img.value, */
            category_id:event.target.category_id.value
        });

        let response = await fetch('http://localhost/aktivio/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });

        const responseText = await response.json();
        /* console.log(responseText); */
        if (responseText.id) {
          /*   console.log("Fetch OK!");  */
            body=JSON.parse(body);
            body.id = responseText.id;
            if (event.target.event_img.files[0]) {
                await uploadFile(event.target.event_img.files[0], responseText.id, body);
            }
            
        } else {
            console.error("Failed to Fetch");
        }

        try {
            const data = responseText;
           /*  console.log('Parsed Data:', data); */
            if (data.success) {
                setResponseMessage(data.success);
                setMessageCol(true);

                if (!formRef.current) {
                    console.error("formRef.current is null");
                    return;
                }
                const formData = new FormData(formRef.current);
                
                formRef.current.reset();
                
                
                
            } else {
                console.log(data.error);
                setResponseMessage(data.error);
                setMessageCol(false);
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            setResponseMessage('An error occurred while processing the response');
            setMessageCol(false);
        }
    }

    async function uploadFile(file, eventId, body){
        const formData = new FormData();
        formData.append('event_img',file);
        formData.append('event_id',eventId);
        if(file.size>2000000) return alert("File is too big...");

        try{
            let response = await fetch('http://localhost/aktivio/events/upload',{//lägg till server route
                method:'POST',
                body: formData
            }); 

            const result = await response.json();
          /*   console.log(result); */
            if(result.success){
                console.log(result.success);
                
                body.event_img = result.event_img;
               /*  setEventArr(prev=>[...prev,body]);
                setUserEvents(prev=>[...prev,body]);  */
                
                setEventArr(prev => {
                    const updatedEvents = [...prev, body];
    
                    setUserEvents(prevUserEvents => [...prevUserEvents, body]);
    
                    return updatedEvents;
                });
            }else{
                console.log("Failed to upload file" + result.error);
            }           
        }catch(error){
            console.log("Error: " + error);
        }
    }
    
    async function getCategories(){
        try{
            let responseCategories = await fetch('http://localhost/aktivio/categories');
            const categories = await responseCategories.json();
            setCategories(categories);
        }catch(error){
            console.error('Failed to GET categories:', error);
        }
    }

/*     async function getCities(){
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
    } */

    return ( 
    <>
    <div className="wrapper-create">
        <h2 className='text-warning'>Skapa Event</h2>
        <form className="event-form" ref={formRef} onSubmit={handleSubmit}>
            <input type="text" name="title" placeholder="Titel" />
            <textarea id="description-input" name="description" cols="40" rows="5" placeholder="Beskrivning"></textarea>
            <input type="datetime-local" name="event_date" placeholder="Datum" />
            {/* <input type="text" name="location" placeholder="Plats" /> */}
           {/*  <select id="location-select2" name="location" placeholder="Plats">
                {allCities.map((city) => (
                    <option>
                        {city.value}
                    </option>
                ))}
            </select> */}
            <Select options={allCities} name="location" placeholder="Välj Plats"/>
        <select name="category_id" defaultValue={'DEFAULT'} className='text-light'>
            <option value="DEFAULT" disabled>Välj Kategori</option>
            {allCategories.map(c => (
                <option key={c.category_id} name="category_id" value={c.category_id}> {/* value med databas id syns i html klartext - ok / dåligt= */} {/* //SKA ID VARA NAMNET KSK. */}
                    {c.category_name}
                </option>
            ))}
        </select>
            <input type="file" name="event_img"/>
            <input className="bg-danger" type="submit" value="Skapa Evenemang" />
        </form>
        <div className="server-message" >
            <p style={{color: messageCol ? "green" : "red" }}>{responseMessage}</p>
        </div>
    </div>
    </> 
    );
}

export default CreateEvent;