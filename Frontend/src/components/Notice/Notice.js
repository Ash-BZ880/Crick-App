import React from 'react';
import photo from '../Image/Photo1.jpeg'; 
import {Typography} from "@mui/material";
import "./Notice.css";

const Notice = () => {
  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#555' }}>

          <h2 style={{ marginTop: '20px', marginBottom: '25px', color: '#3f51b5' }}>Support</h2>

         <div className="profile-container2">
                        <div>
                          <img
                            src={photo}
                            alt="Full Stack Developer"
                            className="circular-photo1"
                          />
                          
                          <Typography variant="h6" className="profile-name1" style={{ textAlign: 'center' }}>
  Ashutosh Birje
</Typography>
                        </div>
                    </div>
      <p style={{ marginTop: '1%' }}>Crick-App</p>

       <h2 style={{ marginTop: '60px', marginBottom: '15px', color: '#3f51b5' }}>Notice</h2>
       <p style={{ marginTop: '10px', marginBottom: '10px', color: 'red' }}>
  Application is running on Test Mode
</p>
      <button
        onClick={goToHome}
        style={{
          backgroundColor: 'transparent',
          color: '#007bff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          marginTop: '10px'
        }}
      >
        Go Back Home
      </button>
     
    </div>
  );
};

export default Notice;
