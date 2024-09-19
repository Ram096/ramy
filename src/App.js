import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Resume from './pages/Resume';
import Blog from './pages/blog'
import Footer from './components/Footer';
import UnderConstructionPage from './pages/404';

function App() {
  return (
    <Router>
      <Navbar />  {/* Navbar appears on all pages */}
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path = "/projects" element = {<Projects/>} /> 
      <Route path = "/blog" element = {<Blog/>} />
      <Route path = "/resume" element = {<Resume/>}/>
      <Route path = "/404:id" element = {<UnderConstructionPage/>}/>
      <Route path="*" element={<UnderConstructionPage />} /> {/* Catch-all route for undefined paths */}
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
