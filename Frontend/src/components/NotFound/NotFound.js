import React from 'react';

const NotFound = () => {
  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20%', color: '#555' }}>
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      {/* <h2>Page Not Found</h2> */}
      <h2>WORK IN PROGRESS</h2>
      <p style={{ marginTop: '1%' }}>Ashutosh Birje</p>
       <p style={{ marginTop: '10px', marginBottom: '10px', color: 'red' }}>
  Password has been changed temporarily.
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

export default NotFound;
