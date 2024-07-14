import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MstUsers from './screen/system/users/MstUsers'
import MstUsersDetail from './screen/system/users/MstUsersDetail';
import Header from './components/Header';

function App() {
  const [Light, SetLight] = useState(true);
  const ToggleLight = ()=>{
    SetLight(!Light)
  }
  return (
    <>
      <div className={`${Light ? '' : 'dark' } dark:bg-slate-950`} >
        <Header Light={Light} ToggleLight ={ToggleLight}/>
        <Routes>
          <Route path="/" element={<MstUsers />} />
          <Route path="/user/:id" element={<MstUsersDetail />} />
        </Routes>
      </div>
    </>
  );
}

export default App
