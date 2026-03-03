import { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // This connects to your running Backend
    fetch('http://localhost:8000/users') 
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>COSC 3380 Project Dashboard</h1>
      <h2>User List from Database:</h2>
      
      {users.length === 0 ? (
        <p>Loading... (If this takes too long, check if Backend is running!)</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;