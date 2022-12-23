import Navbar from './Navbar'
import signin_pic from './sigin.jpg';
import 'bootstrap/dist/css/bootstrap.css'; 
import {Row, Col, Container, Button} from "react-bootstrap"
import Card from 'react-bootstrap/Card';
import React, { useState } from 'react';
import {
  MDBCol,
  MDBListGroup,
  MDBListGroupItem,
  MDBRow,
  MDBTabs,
  MDBTabsContent,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsPane,
  MDBBadge
} from 'mdb-react-ui-kit';
import './group_list.css';
var url = "http://localhost:8080";

const Account = () => {
  /* Yiqun do not touch code from HERE */
  // authenticate user first
  const authURL = url + "/auth";
  // function to allow user in if signed in
  async function getAuth() {
    let res = await fetch(authURL, {method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    //make sure to serialize your JSON body
    body: JSON.stringify({
      cookies: sessionStorage.getItem('token'),
    })
  });
    let auth = await res.json();
    if (auth.data == false) {
      window.location.href = "/";
    }
  }
  getAuth();
  /*to HERE, got it!!!*/
 //google login button functions
 const [loginData, setLoginData] = useState(
    localStorage.getItem('loginData')
    ?JSON.parse(localStorage.getItem('loginData'))
    :null
   );
/// react styling code. 
  const [basicActive, setBasicActive] = useState('home');

  const handleBasicClick = (value) => {
    if (value === basicActive) return;

    setBasicActive(value);
  }
  return (
    <>
      <Navbar />

    <div className='max-w-[1240px] m-auto px-4 py-12'>
    <MDBRow>
      <div style={{  'border-top-right-radius': '10px',
  'border-top-left-radius': '10px',"margin-right":"12px","margin-left":"12px","background-color":"#f8f9fb"}} >
    <img style ={{"border-radius": "50%",width: "100px"}} referrerpolicy="no-referrer" src={localStorage.getItem('picture')==null?signin_pic:localStorage.getItem('picture').slice(1,-1)} />
          <div className='fw-bold'>{loginData.name}</div>
          <div className='text-muted'>{loginData.email}</div>
          </div>
      <MDBCol size={4}>
        <MDBListGroup light small>
          <MDBTabs>
          <MDBListGroupItem style={{"background-color":"#f8f9fb"}} className='list-group-item' action active={basicActive === 'home'} noBorders px-3>
  <MDBTabsItem >
    <MDBTabsLink style = {{"color":"black"}} onClick={() => handleBasicClick('home')}>Payment</MDBTabsLink>
  </MDBTabsItem>
</MDBListGroupItem>

<MDBListGroupItem style={{"background-color":"#f8f9fb"}} className='list-group-item' action active={basicActive === 'profile'} noBorders px-3>
  <MDBTabsItem>
    <MDBTabsLink style = {{"color":"black"}} onClick={() => handleBasicClick('profile')}>Order history</MDBTabsLink>
  </MDBTabsItem>
</MDBListGroupItem>

<MDBListGroupItem style={{"background-color":"#f8f9fb"}} className='list-group-item' action active={basicActive === 'messages'} noBorders px-3>
  <MDBTabsItem>
    <MDBTabsLink style = {{"color":"black"}} onClick={() => handleBasicClick('messages')}>Reservation history</MDBTabsLink>
  </MDBTabsItem>
</MDBListGroupItem>

<MDBListGroupItem style={{"background-color":"#f8f9fb"}} className='list-group-item' action active={basicActive === 'settings'} noBorders px-3>
  <MDBTabsItem>
    <MDBTabsLink style = {{"color":"black"}} onClick={() => handleBasicClick('settings')}>Coupons</MDBTabsLink>
  </MDBTabsItem>
</MDBListGroupItem>
          </MDBTabs>
        </MDBListGroup>
      </MDBCol>

      <MDBCol size={8}>
        <MDBTabsContent>
          <MDBTabsPane show={basicActive === 'home'}>
          Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
          </MDBTabsPane>
          <MDBTabsPane show={basicActive === 'profile'}>
            Ea eos asperiores deserunt reprehenderit voluptatem deleniti dolor iure eum consectetur commodi.
          </MDBTabsPane>
          <MDBTabsPane show={basicActive === 'messages'}>
            Et perspiciatis facilis labore natus at necessitatibus. Sequi earum qui illum reiciendis? Excepturi,
            dicta consequuntur, voluptas aspernatur, quis laboriosam exercitationem quasi officia tempore iste
            assumenda aliquam.
          </MDBTabsPane>
          <MDBTabsPane show={basicActive === 'settings'}>
            Praesentium asperiores nemo ratione quas atque excepturi odio aliquid libero, architecto aspernatur
            expedita, corrupti, rem odit quos exercitationem maxime at. Ex, eveniet rerum laborum accusamus
            delectus magnam maxime!
          </MDBTabsPane>
        </MDBTabsContent>
      </MDBCol>
    </MDBRow>
    </div>
    </>
  )
}

export default Account