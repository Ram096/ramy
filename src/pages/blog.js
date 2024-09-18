import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blog.css';

const posts = [
  {
    id: 1,
    title: 'Hikes',
    description: 'The experience of visiting different mountains and more. A collection of experiences from my favorite trails, where I share not only the scenic beauty but also the personal reflections and life lessons gained from each journey in nature',
    detailedDescription: 'This is the full description of my first blog post where I explain more in detail.'
  },
  {
    id: 2,
    title: 'Website designs sketches and demos',
    description: 'A showcase of incomplete and different website designs. Exploring how concepts evolve into fully realized designs and see the practical applications of various design principles.',
    detailedDescription: 'In this post, I dive deep into JavaScript closures, a tricky but powerful concept...'
  },
  {
    id: 3,
    title: 'Books and lessons learned',
    description: 'reflections, theories, and philosophies on key takeaways from impactful books, sharing insights and lessons that have shaped my personal and professional journey.',
    detailedDescription: 'In this detailed post, I explain how I built my personal portfolio website using React...'
  }
];

function Blog() {
  return (
    <div className="blog-container">
    <div className="blog-background">
      <h1 className="blog-title">Blog</h1>
      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <h2 className="post-title">
              <Link to={`/404/${post.id}`} className="post-link">{post.title}</Link>
            </h2>
            <p className="post-description">{post.description}</p>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default Blog;
