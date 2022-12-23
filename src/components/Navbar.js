import React from 'react'
import { FiSearch } from 'react-icons/fi'
import { useState } from 'react';
import GoogleLogin from 'react-google-login';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';

const Navbar = () => {
    //google login button functions
    const [loginData, setLoginData] = useState(
    localStorage.getItem('loginData')
    ?JSON.parse(localStorage.getItem('loginData'))
    :null
   );
    const url = "http://localhost:8080"
    const handleLogin = async (googleData) => {
        const res = await fetch(url + '/api/google-login', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            token: googleData.tokenId,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
         const data = await res.json();
         setLoginData(data);
         console.log(data)
         localStorage.setItem('loginData', JSON.stringify(data));
         localStorage.setItem('picture', JSON.stringify(data.picture));
         sessionStorage.setItem('token', googleData.tokenId);
         localStorage.setItem('loginID',JSON.stringify(data.id))
         // console.log(document.cookie);
         window.location.reload(false);
       };
       const handleLogout = () => {
        axios.get(url + "/logout").then((response) => {//get logout for cookie 
        // delete cookies front end :)
          //document.cookie=document.cookie+";max-age=0";
          //document.cookie=document.cookie+";max-age=0";
          console.log("clean cookie");
        });
       localStorage.removeItem('loginData');//remove localstorage data user name.
       localStorage.removeItem('loginID');
       localStorage.removeItem('picture');
       localStorage.removeItem('name');
       localStorage.removeItem('email');
       sessionStorage.removeItem('token');
       setLoginData(null);//empty the localstorage data
       window.location.reload(false);
     };
     const handleFailure = (response) => {
        console.log("Fail to login",response)
      }
    return (
        <>
            <div className="flex max-w-[1240px] mx-auto items-center p-4 justify-between"
            style = {{"border-bottom": "solid"}} >
                <div className="cursor-pointer" >
                    <h1 onClick={event =>  window.location.href='/'} className='font-bold text-3xl sm:text-4xl lg:text-4xl '>Eatify</h1>
                </div>
                <div className='flex'>
                {loginData  ?
                
                    <div className="login">
      <Button variant="dark" style={{ marginRight: '5px',padding:' 7px 20px' }} onClick={event =>  window.location.href='/account'}>Account</Button>
      <Button variant="dark" style={{ marginLeft: '5px',padding:' 7px 20px' }} onClick= {handleLogout}>LogOut</Button>
                    </div>
:
<div className="login">
<GoogleLogin
clientId={process.env.REACT_APP_GOOGLE_LOGIN_CLIENT_ID}
render={renderProps => (
  <Button variant="dark" style={{ marginRight: '5px',padding:' 7px 20px' }}onClick={renderProps.onClick} disabled={renderProps.disabled}>Login</Button>
)}

buttonText="Login"
onSuccess={handleLogin}
onFailure={handleFailure}
cookiePolicy={'single_host_origin'}/>
</div>
}

                </div>
            </div>
        </>
    )
}

export default Navbar