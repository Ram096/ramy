import React from 'react';

const UnderConstructionPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      textAlign: 'center', 
      backgroundColor: '#f0f0f0'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Under Construction</h1>
      <p style={{ fontSize: '1.5rem' }}>
        This page is currently under construction. We're working hard to get it ready!
      </p>
      <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
        Please check back later.
      </p>
    </div>
  );
};

export default UnderConstructionPage;