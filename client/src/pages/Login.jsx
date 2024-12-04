import { useState } from 'react';

function Login({checkSessionStatus}) {
    let [responseMessage, setResponseMessage] = useState(null);
    let [messageCol, setMessageCol] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        let body = JSON.stringify({
            email: event.target.email.value,
            password: event.target.password.value
        })
 
        let response = await fetch('http://localhost/aktivio/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });

        const responseText = await response.json(); // If the server responds with JSON VILKET DEN SKA GÖRA SEN PPÅ LOGIN MED SESSION

        if (response.ok) {
            /* console.log("Fetch OK!");  */
        } else {
            console.error("Failed to Fetch");
        }
        try {
            const data = responseText;
            console.log('Parsed Data:', data);
            if (data.success) {
                checkSessionStatus();
                setResponseMessage(data.success);
                setMessageCol(true);

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

    return ( 
    <>
        <h2>Logga in</h2>
        <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" autoComplete="off"/> {/* required */}
            <input type="password" name="password" placeholder="Lösenord" autoComplete="off"/>
            <input type="submit" value="Logga in" />
        </form>
        <div className="server-message" >
            <p style={{color: messageCol ? "green" : "red" }}>{responseMessage} </p>
        </div>
    </>
    );

}

export default Login;