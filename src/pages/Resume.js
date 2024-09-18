import React from 'react';
import resume from '../assets/documents/RAMY_KASSAM_RESUME.pdf'

const resumeUrl = resume; 

const Resume = () => {
  return (
    <div style={{ padding: '20px'}}>
      <embed 
        src={resumeUrl} 
        type="application/pdf" 
        width="100%" 
        height="600px" 
        style={{ border: 'none' }}
        aria-label="Resume"
      />
      <div style={{ marginTop: '20px' }}>
        <a 
          href={resumeUrl} 
          download="Ramy_Kassam_Resume.pdf" 
          style={{ fontSize: '16px', textDecoration: 'none', color: '#007BFF' }}
        >
          Download Resume
        </a>
      </div>
    </div>
  );
};

export default Resume;