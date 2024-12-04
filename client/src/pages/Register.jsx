import { useState } from 'react';

function Register() {

    let [responseMessage, setResponseMessage] = useState(null);
    let [messageCol, setMessageCol] = useState(false);

    async function handleSubmit(event) {

        event.preventDefault();

        let body = JSON.stringify({
            username: event.target.username.value,
            email: event.target.email.value,
            password: event.target.password.value
        });
 
        let response = await fetch('http://localhost/aktivio/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });
        
        const responseText = await response.json(); //JSON // If the server responds with JSON VILKET DEN SKA GÖRA SEN PPÅ LOGIN MED SESSION
        if (response.ok) {
            console.log("Fetch OK! 29");
        } else {
            console.error("Failed to Fetch");
        }

        try {
            const data =responseText;
            /* console.log('Parsed Data:', data); */
            if (data.success) {
              /*   alert('Login successful'); */
                setResponseMessage(data.success);
                setMessageCol(true);
                window.location.replace('#login');
            } else {
                setResponseMessage(data.error);
                setMessageCol(false);
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            setResponseMessage('An error occurred while processing the response');
            setMessageCol(false);
        }
    }
    return( 
    <>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Användarnamn" autoComplete="off"/>
            <input type="email" name="email" placeholder="Email" autoComplete="off"/>
            <input type="password" name="password" placeholder="Lösenord" autoComplete="off"/>
            <input type="submit" value="Skapa konto" />
        </form>
        <div className="server-message" >
        
            <p style={{color: messageCol ? "green" : "red" }}>{responseMessage}</p>
        </div>
        
{/* GÖR REQUIRE PÅ FORMS LOGIN CREATE REGISTER */}
    </> 
    );
}

export default Register;