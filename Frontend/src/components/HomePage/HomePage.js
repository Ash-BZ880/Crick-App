import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Footer from "../Footer/Footer";
import "./HomePage.css"; // Import the external CSS file
import Notice from "../Notice/Notice";
import Advertise from "../Advertisement/Advertise";

const LandingPage = ({ Admin, setIsAdmin, setNewMatch }) => {
  const navigate = useNavigate();

  const handleButtonClick1 = () => {
    navigate("/score");
  };

  const handleButtonClick4 = () => {
    navigate("/help");
  };

    const handleButtonClick2 = () => {
    navigate("/Toss");
  };

  const handleButtonClick3 = () => {
    navigate("/LoginSignUp");
  };

  useEffect(() => {
    setNewMatch(false);
  }, [setNewMatch]);

   const [info, setInfo] = useState(null);
   const [photos, setPhotos] = useState([]);
    
    useEffect(() => {
        const fetchSetup = async () => {
          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_BASE_URL}/admin/setup`
            );
    
            if (!res.ok) throw new Error("API failed");
    
            const data = await res.json();
    
            if (data.success && data.data) {
              setInfo(data.data.info || {});
              setPhotos(data.data.photos || []);
            } else {
            }
          } catch (err) {
            console.error(err);
          } finally {
          }
        };
    
        fetchSetup();
      }, []);

  return (
    <div className="landing-container">
      {/* Fixed AppBar */}
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">{info?.names}</Typography>
        </Toolbar>
      </AppBar>

      {/* Scrollable Content */}
      <div className="main-content">
        <div className="centered-image">
<img src="/images/Photo4.png" alt="Cricket League" className="main-img" />        </div>

        <div className="button-container">
          <Button
            variant="contained"
            className="start-button"
            onClick={handleButtonClick1}
          >
            START
          </Button>

          <Button
            variant="contained"
            className="start-button"
            onClick={handleButtonClick2}
          >
            TOSS
          </Button>
          
          <Button
            variant="contained"
            className="start-button"
            onClick={handleButtonClick4}
          >
            HELP
          </Button>

          <Button
            variant="contained"
            className="start-button"
            onClick={handleButtonClick3}
          >
            ADMIN
          </Button>
        </div>


        
        
        {/* Circular Photos and Text */}
        <div className="profile-container">
          <h2 style={{ marginTop: '20px', marginBottom: '2px', color: '#3f51b5' }}>Team</h2>

          {photos.length > 0 ? (photos.map((profile, index) => (
            <div key={index}>
              <img
                src={profile.url}
                alt={profile.name}
                className="circular-photo"
              />
              <Typography variant="h6" className="profile-name">
                {profile.name?.replace(/\.[^/.]+$/, "")}
              </Typography>
            </div>
          ))) : (
                <p></p>
              )}
        </div>
        
        <Advertise/>

        <Notice />

      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
