import React from 'react'
import Card from './components/Card'
import Category from './components/Category'
import Food from './components/Food'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet
} from "react-router-dom";
import Account from './components/Account';
import Home from './components/Home';
const App = () => {
  return (
    <>
            <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="Account" element={<Account />}>
        </Route>
      </Routes>
    </BrowserRouter>

    </>
  )
}

export default App