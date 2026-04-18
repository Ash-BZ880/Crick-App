import React, { useEffect, useState } from "react";
import "./Advertise.css";

const Advertise = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/admin/advertise`
        );

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        if (data.success) {
          setPhotos(data.photos || []);
        }
      } catch (err) {
        console.error("Fetch Ads Error:", err);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="advertisement-container">
      <h2 style={{ marginTop: '10px', marginBottom: '25px', color: '#3f51b5' }}>Advertisement</h2>

      <div className="scroll-wrapper">
        <div className="scroll-track">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo.url}
              alt={photo.name || `ad-${index}`}
              className="scroll-image"
            />
          ))}

          {/* Infinite scroll duplicate */}
          {photos.map((photo, index) => (
            <img
              key={`dup-${index}`}
              src={photo.url}
              alt={photo.name || `ad-dup-${index}`}
              className="scroll-image"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Advertise;