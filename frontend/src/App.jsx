// Routes allow navigation between pages, see "React Router" in tutorial
import { Routes, Route } from 'react-router-dom'
import {Home} from './Home.jsx'
import {Login} from './Login.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='*' element={<h1>404 Not Found</h1>}/>
    </Routes>
  );
}

export default App;