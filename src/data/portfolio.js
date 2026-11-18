// Shared portfolio content rendered on the cockpit's main computer.

export const PROFILE = {
  name: 'Ramy Kassam',
  role: 'Software Engineer',
  company: 'Vertx Partners',
  location: 'Boulder, CO',
  phone: '(305) 333-6473',
  email: 'kassamramy27@outlook.com',
  github: 'github.com/Ram096',
  githubUrl: 'https://github.com/Ram096',
  resumeUrl: '/Ramy_Kassam_Resume.pdf',
  portrait: '/ramy-hero.jpg',
  landscape: '/ramy-hero-landscape.jpg'
};

export const ABOUT_PARAGRAPHS = [
  "I'm a software engineer currently working at Vertx Partners. In May of 2024 I graduated from the University of Colorado Boulder with my BS in Computer Science.",
  'From a young age, I have had a curiosity about how things worked. This naturally led me to become obsessed with technology and I fell in love with building things from the ground up. In middle school I started coding and exploring systems, which was my first real exposure to programming.',
  'Originally from Miami, Florida, I moved across the country to Boulder, Colorado to study Computer Science and Mathematics. During that time I managed night transit operations for a team of 35+ at CU Night Ride, taught STEM and coding at Lavner Education, and later joined Vertx Partners to build fast, scalable backend software and tooling.',
  'Beyond software, I spend my free time skiing in the Colorado Rockies, taking photos, hiking, working out and (unsurprisingly) playing video games. Open the PHOTO ALBUM tab to browse my Basin ski trip and outdoor adventure photos!'
];

export const JOBS = [
  {
    role: 'Software Developer',
    org: 'Vertx Partners',
    date: '10/2024 – Present',
    place: 'Boulder, CO',
    bullets: [
      'Cut average API response time by 66% (350ms → 120ms) via caching, connection pooling & database parallelism.',
      'Designed & shipped 20+ new tools and UI features (+20% customer satisfaction score).',
      'Built automated CI/CD pipelines removing ~20 hours of manual deployment work per week.'
    ]
  },
  {
    role: 'Manager',
    org: 'CU Night Ride (CU Boulder)',
    date: '04/2022 – 03/2024',
    place: 'Boulder, CO',
    bullets: [
      'Directed nightly student transit shift teams of 10+ within a 30–40 person campus operations staff.',
      'Trained, onboarded, and mentored new employees, establishing performance expectations and promoting a culture of accountability and teamwork.',
      'Served as a primary point of contact for staff and students, resolving concerns and communicating operational updates.',
      'Coordinated resources and staffing levels to accommodate fluctuating service demand and maintain consistent service coverage.',
      'Named Employee of the Semester for leadership and operational excellence.'
    ]
  },
  {
    role: 'IT Intern',
    org: 'Lavner Education',
    date: '06/2023 – 08/2023',
    place: 'Denver, CO',
    bullets: [
      'Led student technical programs in Python, C++, Scratch and STEM hardware.',
      'Maintained and troubleshot lab systems and software.',
      'Documented technical issues, troubleshooting procedures, and resolutions to improve IT support efficiency and knowledge sharing.',
      'Assisted with the setup, configuration, deployment, and maintenance of computers, laptops, peripherals, and other IT equipment.'
    ]
  }
];

export const PROJECTS = [
  {
    name: 'Market Analysis & Sales Forecasting',
    tag: 'Data Analytics & Machine Learning Project — CU Boulder',
    bullets: [
      'Engineered multi-variable feature pipelines incorporating wage-per-staff ratios, customer basket metrics, store location types, and advertising budget allocations.',
      'Applied dual z-score and IQR outlier detection alongside MinMax normalization and Variance Inflation Factor (VIF) filtering to eliminate multicollinearity and prevent model overfitting.',
      'Trained and evaluated multiple regression algorithms — Random Forest, XGBoost, Decision Trees, SVR, and Multivariate Linear Regression — using 5-fold cross-validation.',
      'Achieved top model performance with Random Forest (R² = 0.526, MSE = 0.0232), demonstrating that local competitor density and promotional spend are the primary determinants of gross profit ratio.'
    ]
  },
  {
    name: 'ParkPal — HCI & Transit Project',
    tag: 'Awarded "Most Useful Project" — CU Boulder Course Expo',
    bullets: [
      'Designed and prototyped a user-centered application for locating and managing parking, from concept through evaluated interactive prototypes in Figma.',
      'Ran usability testing with 50+ participants and iterated on the analyzed feedback.'
    ]
  },
  {
    name: 'Joulomb Inc — 3D Spacecraft Portfolio',
    tag: 'This website — React + Three.js',
    bullets: [
      'Procedurally modeled cockpit, live canvas HUD displays and an endless interstellar flight background — all rendered in real time in the browser.'
    ]
  }
];

export const SKILLS = [
  ['Languages', 'Python, Java, C++, JavaScript, SQL, HTML/CSS'],
  ['Frontend', 'React, Electron, Three.js, Figma'],
  ['Backend & Data', 'Django, REST APIs, MongoDB, SQL, Pandas'],
  ['DevOps & Tools', 'Docker, Git, CI/CD, Jupyter, VS Code'],
  ['Education', 'B.S. Computer Science, Math Minor — CU Boulder']
];

export const ADVENTURE_ALBUMS = [
  {
    id: 'basin',
    title: 'Loveland Basin Ski Area, CO',
    label: '⛷️ BASIN SKI TRIP',
    subtitle: 'Loveland Basin Summit & Continental Divide • 13,010 ft • Colorado Rockies',
    description: '"I\'ve always been fascinated with the underdog, the person who is not allowed to win, the person who is considered different or abnormal. Never liked winners that much" — Loveland Ski Area',
    photos: [
      { src: '/loveland1.JPG', caption: 'Loveland Basin — Summit Ridge Run' },
      { src: '/loveland2.JPG', caption: 'High Alpine Powder Day at the Basin' },
      { src: '/loveland3.jpg', caption: 'Continental Divide Vista — Basin Bowl' },
      { src: '/loveland4.JPG', caption: 'Chairlift Ascent to Basin Summit' },
      { src: '/loveland5.jpg', caption: 'Loveland Basin Ski Trails & Powder Glades' },
      { src: '/loveland6.JPG', caption: 'Above Timberline — Loveland Basin Ridge' },
      { src: '/loveland7.JPG', caption: 'Fresh Tracks in Clear Creek County' },
      { src: '/loveland8.JPG', caption: 'Bluebird Sky Across the Basin' },
      { src: '/loveland9.JPG', caption: 'Basin Mountain Peak Panorama' },
      { src: '/loveland10.JPG', caption: 'Apres-Ski & Golden Hour in Colorado' },
      { src: '/loveland11.jpg', caption: 'Carving the Basin Headwall Powder' },
      { src: '/loveland12.jpg', caption: 'Continental Divide Rocky Mountain Sunset' }
    ]
  },
  {
    id: 'camping',
    title: 'Camping & Backcountry',
    label: '⛺ BACKCOUNTRY CAMPING',
    subtitle: 'Alpine Trails • Starlit Campsites • Wilderness Expeditions',
    description: 'High altitude camping, backcountry treks and summit overlooks across the Rocky Mountains.',
    photos: [
      { src: '/blog-camping.jpg', caption: 'Night Camp Under the Stars' },
      { src: '/blog-hiking.jpg', caption: 'Backcountry Ridge Trail' },
      { src: '/mountain-1.jpg', caption: 'Colorado Alpine 14er Ridge' },
      { src: '/mountain-2.jpg', caption: 'Wilderness Summit Overlook' }
    ]
  }
];

export const SECTIONS = [
  { id: 'about', label: 'ABOUT', dest: 'ORION ARM // SOL' },
  { id: 'experience', label: 'EXPERIENCE', dest: 'CYGNUS X-1' },
  { id: 'projects', label: 'PROJECTS', dest: 'PILLARS OF CREATION' },
  { id: 'gallery', label: 'PHOTO ALBUM', dest: 'LOVELAND BASIN // CO' },
  { id: 'contact', label: 'CONTACT', dest: 'HOME BASE // EARTH' }
];
