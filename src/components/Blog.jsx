import React, { useState } from 'react';
import './Blog.css';

const Blog = () => {
  const [activeTab, setActiveTab] = useState('adventures');
  const [selectedAdventure, setSelectedAdventure] = useState(null);

  const adventures = [
    {
      id: 'hiking',
      src: '/images/quandarypeak2.jpg',
      alt: 'Hiking in the mountains',
      caption: 'Hiking',
      description: 'Exploring the peaks and trails. The journey to the top is always worth the view.',
      gallery: ['/images/quandarypeak2.jpg'] // Add more image paths here later!
    },
    {
      id: 'skiing',
      src: '/images/loveland7.JPG',
      alt: 'Skiing down a snowy slope',
      caption: 'Skiing',
      description: 'Gliding through fresh powder.',
      gallery: ['/images/loveland7.JPG'] // Add more image paths here later!
    },
    {
      id: 'camping',
      src: '/images/kellydahl8.jpg',
      alt: 'Camping under the stars',
      caption: 'Camping',
      description: 'Nothing like a campfire under the stars.',
      gallery: ['/images/kellydahl8.jpg'] // Add more image paths here later!
    },
  ];

  const books = [
    { title: 'Open', author: 'Andre Agassi', thoughts: 'The book shows that being talented at something doesn’t guarantee fulfillment, especially if it isn’t chosen freely, but meaning can emerge when you take ownership of your path.', color: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
    { title: 'The Glass Castle', author: 'Jeannette Walls', thoughts: 'The Glass Castle shows how a person can grow up in instability and still develop resilience and independence', color: 'linear-gradient(135deg, #c33764 0%, #1d2671 100%)' },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', thoughts: 'this book shows that being a good programmer isn’t just about technical skill, but about thinking critically, adapting, and taking responsibility for your work', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { title: 'Animal Farm', author: 'George Owell', thoughts: 'Illustration of totalitarianism, corruption od ideals, the power of language, and betrayal of revolutionary goals', color: 'linear-gradient(135deg, #b29f94 0%, #603813 100%)' },
    { title: 'Atomic Habits', author: 'James Clear', thoughts: 'An incredibly practical framework for improving every day.', color: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' },
  ];



  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <h2 className="section-title">Beyond Code</h2>

        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'adventures' ? 'active' : ''}`}
              onClick={() => setActiveTab('adventures')}
            >
              Adventures
            </button>
            <button
              className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              Library
            </button>

          </div>

          <div className="tab-content">
            {activeTab === 'adventures' && (
              <div className="tab-pane fade-in-up">
                <div className="photo-gallery">
                  {adventures.map((adv, index) => (
                    <div key={index} className="photo-card" onClick={() => setSelectedAdventure(adv)}>
                      <img src={adv.src} alt={adv.alt} loading="lazy" />
                      <div className="photo-caption">{adv.caption}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <div className="tab-pane fade-in-up">
                <div className="books-grid">
                  {books.map((book, index) => (
                    <div key={index} className="book-card" style={{ background: book.color }}>
                      <div className="book-cover-content">
                        <h4>{book.title}</h4>
                        <span className="book-author">{book.author}</span>
                      </div>
                      <div className="book-hover-details">
                        <p>{book.thoughts}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {selectedAdventure && (
        <div className="adventure-modal-overlay fade-in" onClick={() => setSelectedAdventure(null)}>
          <div className="adventure-modal-content scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedAdventure(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="modal-header">
              <h3>{selectedAdventure.caption}</h3>
              <p>{selectedAdventure.description}</p>
            </div>
            <div className="modal-gallery">
              {selectedAdventure.gallery.map((imgSrc, i) => (
                <div key={i} className="modal-img-container">
                  <img src={imgSrc} alt={`${selectedAdventure.caption} ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;
