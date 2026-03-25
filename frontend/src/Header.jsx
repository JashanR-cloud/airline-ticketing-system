// Header component can be added to every page
// It is used to navigate different links

import './Header.css'

export function Header(){
    return (
        <div className='header'>
            {/* should link to the home page
                can change it to an img
            */}
            <div className='left-section'>
                <p>Airline Ticketing</p>
            </div>

            {/* should link to the login page
                or the account page if logged in
            */}    
            <div className='right-section'>
                <p>Login</p>
            </div>
        </div>
    )
}