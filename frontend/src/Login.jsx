import { useState } from 'react';
import { Header } from './Header.jsx'
import './Login.css'

export function Login(){
    const [inputs, setInputs] = useState({});

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    // function runs when the form is submitted (temp code)
    // should check if the inputs match an existing user in database
     const handleSubmit = (event) => {
        event.preventDefault();
        const loginParameters = JSON.stringify(inputs, null, 2)
        alert(loginParameters)
    }

    return(
        <>
            <Header /> 

            <form className='login' onSumbit={handleSubmit}>
                {/* email credential for login */}
                <label> EMAIL
                <input
                    className='email-box'
                    type='email'
                    name='email'
                    value={inputs.email}
                    onChange={handleChange}
                />
                </label>

                {/* password credential for login */}
                <label> PASSWORD
                <input
                    className='password-box'
                    type='password'
                    name='password'
                    value={inputs.password}
                    onChange={handleChange}
                />
                </label>

                {/* login button */}
                <button type='submit' className='login-button'>LOGIN</button>
            </form>
        </>
    )
}