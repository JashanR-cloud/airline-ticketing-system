import { useEffect, useState } from 'react';
import {Header} from './Header.jsx'
import './App.css'

function App() {
  // handles flight parameters
  // see "React Multiple Inputs" on tutorial 
  const [inputs, setInputs] = useState({})

  const handleSelections = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  // Generates options for number of passangers selection
  const passangerOptions = [];

  for(let i = 1; i <=9; i++) {
    passangerOptions.push(
      <option key={i} value={i}>
        {i} Passanger{i > 1 ? 's': ''}
      </option>
    );
  }

  // Handles form submission (temp code)
  // Should display available flights once
  // We connect to the database
  const handleSubmit = (event) => {
    event.preventDefault();
    const searchParameters = JSON.stringify(inputs, null, 2)
    alert(searchParameters)
  }

  // Template Code
  const [users, setUsers] = useState("")
  useEffect(() => {
    // This connects to your running Backend
    fetch('http://localhost:8000/users') 
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <Header />

      <p>FLIGHTS INFORMATION</p>
      <form className='flight-info' onSubmit={handleSubmit}>
        <div className = 'options'>

          {/*Destination Selection
            should display a valid list of destinations once
            we connect to the database
          */}
          <label className='destination'> Where to? 
          <input
            type='text'
            name='destination'
            value={inputs.destination}
            onChange={handleSelections}>
          </input>
          </label>

          {/*Departure and return dates */}  
          <label className='departure'> Departure Date
          <input
            type="date"
            name="departureDate"
            value={inputs.departureDate}
            onChange={handleSelections}>
          </input>
          </label>

          <label className='return'> Return Date
          <input
            type="date"
            name="returnDate"
            value={inputs.returnDate}
            onChange={handleSelections}>           
          </input>
          </label>

          {/*Passanger selection: see "React Select" on tutorial*/}
          <label className = 'num-of-passangers'> Number of Passangers
          <select  
            name='numPassangers'
            value={inputs.numPassangers} 
            onChange={handleSelections}>
              {passangerOptions}
          </select>
          </label>
          
          {/* Submit button */}
          <button type='submit'>Search</button>
        </div>
      </form>
    </div>
  );
}

export default App;