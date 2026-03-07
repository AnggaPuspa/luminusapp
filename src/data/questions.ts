export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  question: string;
  options: QuestionOption[];
  correct: string;
}

export interface Topic {
  id: string;
  label: string;
  icon: string;
}

export const topics: Topic[] = [
  { id: 'android', label: 'Android', icon: '📱' },
  { id: 'frontend', label: 'Front-end', icon: '🖥️' },
  { id: 'backend', label: 'Back-end', icon: '🖧' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒' },
];

export const questions: Record<string, Question[]> = {
  android: [
    {
      question: "What is the primary programming language used for Android development?",
      options: [
        { label: "Java", value: "A" },
        { label: "Swift", value: "B" },
        { label: "C#", value: "C" },
        { label: "Python", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "Which component is NOT a part of the Android architecture?",
      options: [
        { label: "Activities", value: "A" },
        { label: "Services", value: "B" },
        { label: "Intents", value: "C" },
        { label: "Fragments", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of the AndroidManifest.xml file?",
      options: [
        { label: "To define the app's user interface", value: "A" },
        { label: "To declare the app's components and permissions", value: "B" },
        { label: "To store app data", value: "C" },
        { label: "To manage app resources", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which layout is best suited for a list of scrollable items?",
      options: [
        { label: "LinearLayout", value: "A" },
        { label: "RelativeLayout", value: "B" },
        { label: "FrameLayout", value: "C" },
        { label: "RecyclerView", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of the Gradle build system in Android development?",
      options: [
        { label: "To design the user interface", value: "A" },
        { label: "To manage app permissions", value: "B" },
        { label: "To automate the build process and manage dependencies", value: "C" },
        { label: "To test the application", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the function of the Activity lifecycle method onCreate()?",
      options: [
        { label: "To create the app's user interface", value: "A" },
        { label: "To initialize the activity", value: "B" },
        { label: "To handle user input", value: "C" },
        { label: "To destroy the activity", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is NOT a valid Android app component?",
      options: [
        { label: "Activity", value: "A" },
        { label: "Service", value: "B" },
        { label: "Broadcast Receiver", value: "C" },
        { label: "Fragment", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of the res folder in an Android project?",
      options: [
        { label: "To store Java source code", value: "A" },
        { label: "To store app resources like layouts and images", value: "B" },
        { label: "To store compiled code", value: "C" },
        { label: "To store app data", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is used to store small amounts of primitive data in key-value pairs?",
      options: [
        { label: "SQLite Database", value: "A" },
        { label: "Internal Storage", value: "B" },
        { label: "Shared Preferences", value: "C" },
        { label: "Content Provider", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of the Intent class in Android?",
      options: [
        { label: "To design the user interface", value: "A" },
        { label: "To manage app permissions", value: "B" },
        { label: "To communicate between components", value: "C" },
        { label: "To handle user input", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which of the following is NOT a valid Android resource type?",
      options: [
        { label: "drawable", value: "A" },
        { label: "layout", value: "B" },
        { label: "values", value: "C" },
        { label: "functions", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of the ViewGroup class in Android?",
      options: [
        { label: "To create custom views", value: "A" },
        { label: "To handle user input", value: "B" },
        { label: "To contain and arrange child views", value: "C" },
        { label: "To manage app resources", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which of the following is used to make network requests in modern Android development?",
      options: [
        { label: "HttpClient", value: "A" },
        { label: "Volley", value: "B" },
        { label: "Retrofit", value: "C" },
        { label: "AsyncTask", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of the ViewModel class in Android architecture components?",
      options: [
        { label: "To handle database operations", value: "A" },
        { label: "To manage UI-related data", value: "B" },
        { label: "To create the app's user interface", value: "C" },
        { label: "To handle network requests", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is NOT a benefit of using Kotlin for Android development?",
      options: [
        { label: "Null safety", value: "A" },
        { label: "Interoperability with Java", value: "B" },
        { label: "Concise syntax", value: "C" },
        { label: "Faster compilation times", value: "D" },
      ],
      correct: "D",
    },
  ],
  frontend: [
    {
      question: "What does HTML stand for?",
      options: [
        { label: "Hyper Text Markup Language", value: "A" },
        { label: "High Tech Modern Language", value: "B" },
        { label: "Hyper Transfer Markup Language", value: "C" },
        { label: "Home Tool Markup Language", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "Which of the following is used to style web pages?",
      options: [
        { label: "HTML", value: "A" },
        { label: "JavaScript", value: "B" },
        { label: "CSS", value: "C" },
        { label: "XML", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of JavaScript in web development?",
      options: [
        { label: "To structure content", value: "A" },
        { label: "To style content", value: "B" },
        { label: "To add interactivity and dynamic behavior", value: "C" },
        { label: "To create database schemas", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which of the following is NOT a JavaScript framework or library?",
      options: [
        { label: "React", value: "A" },
        { label: "Angular", value: "B" },
        { label: "Vue", value: "C" },
        { label: "Java", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What does CSS stand for?",
      options: [
        { label: "Computer Style Sheets", value: "A" },
        { label: "Creative Style Sheets", value: "B" },
        { label: "Cascading Style Sheets", value: "C" },
        { label: "Colorful Style Sheets", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which HTML tag is used to link an external JavaScript file?",
      options: [
        { label: "<script>", value: "A" },
        { label: "<js>", value: "B" },
        { label: "<javascript>", value: "C" },
        { label: "<link>", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "What is the purpose of the 'viewport' meta tag in HTML?",
      options: [
        { label: "To set the page background color", value: "A" },
        { label: "To define the character encoding", value: "B" },
        { label: "To control the page's dimensions on different devices", value: "C" },
        { label: "To specify the page title", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which of the following is a CSS preprocessor?",
      options: [
        { label: "LESS", value: "A" },
        { label: "SASS", value: "B" },
        { label: "Stylus", value: "C" },
        { label: "All of the above", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of the 'use strict' directive in JavaScript?",
      options: [
        { label: "To enable strict mode", value: "A" },
        { label: "To include external libraries", value: "B" },
        { label: "To define global variables", value: "C" },
        { label: "To create a new function", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "Which of the following is used for state management in React applications?",
      options: [
        { label: "Redux", value: "A" },
        { label: "MobX", value: "B" },
        { label: "Context API", value: "C" },
        { label: "All of the above", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of the 'async' and 'await' keywords in JavaScript?",
      options: [
        { label: "To define synchronous functions", value: "A" },
        { label: "To handle asynchronous operations", value: "B" },
        { label: "To create loops", value: "C" },
        { label: "To define event listeners", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is the purpose of the 'box-sizing' property in CSS?",
      options: [
        { label: "To set the color of borders", value: "A" },
        { label: "To control how the total width and height of an element is calculated", value: "B" },
        { label: "To create rounded corners", value: "C" },
        { label: "To add shadows to elements", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is NOT a valid way to declare a variable in JavaScript?",
      options: [
        { label: "var", value: "A" },
        { label: "let", value: "B" },
        { label: "const", value: "C" },
        { label: "variable", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of the 'srcset' attribute in the <img> tag?",
      options: [
        { label: "To specify multiple image sources for different screen sizes", value: "A" },
        { label: "To set the image alignment", value: "B" },
        { label: "To define the image caption", value: "C" },
        { label: "To add a border to the image", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "Which of the following is a tool for bundling JavaScript modules?",
      options: [
        { label: "Webpack", value: "A" },
        { label: "Babel", value: "B" },
        { label: "ESLint", value: "C" },
        { label: "Prettier", value: "D" },
      ],
      correct: "A",
    },
  ],
  backend: [
    {
      question: "What is the primary function of a backend in web development?",
      options: [
        { label: "To style web pages", value: "A" },
        { label: "To handle server-side logic and data management", value: "B" },
        { label: "To create user interfaces", value: "C" },
        { label: "To manage client-side interactions", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is NOT a common backend programming language?",
      options: [
        { label: "Python", value: "A" },
        { label: "Java", value: "B" },
        { label: "Ruby", value: "C" },
        { label: "HTML", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of an API in backend development?",
      options: [
        { label: "To create user interfaces", value: "A" },
        { label: "To define how software components should interact", value: "B" },
        { label: "To style web pages", value: "C" },
        { label: "To manage client-side storage", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is a popular backend framework for Node.js?",
      options: [
        { label: "React", value: "A" },
        { label: "Angular", value: "B" },
        { label: "Express", value: "C" },
        { label: "Vue", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of a database in backend development?",
      options: [
        { label: "To store and manage data", value: "A" },
        { label: "To create user interfaces", value: "B" },
        { label: "To handle client-side logic", value: "C" },
        { label: "To style web pages", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "Which HTTP method is typically used to retrieve data from a server?",
      options: [
        { label: "POST", value: "A" },
        { label: "GET", value: "B" },
        { label: "PUT", value: "C" },
        { label: "DELETE", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is the purpose of ORM (Object-Relational Mapping) in backend development?",
      options: [
        { label: "To create user interfaces", value: "A" },
        { label: "To manage server configurations", value: "B" },
        { label: "To convert data between incompatible type systems", value: "C" },
        { label: "To handle network protocols", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which of the following is NOT a type of database?",
      options: [
        { label: "Relational", value: "A" },
        { label: "NoSQL", value: "B" },
        { label: "Graph", value: "C" },
        { label: "Frontend", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of a web server in backend development?",
      options: [
        { label: "To create user interfaces", value: "A" },
        { label: "To handle HTTP requests and serve web content", value: "B" },
        { label: "To manage client-side storage", value: "C" },
        { label: "To style web pages", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is a popular version control system used in backend development?",
      options: [
        { label: "Git", value: "A" },
        { label: "SQL", value: "B" },
        { label: "HTTP", value: "C" },
        { label: "CSS", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "What is the purpose of middleware in backend development?",
      options: [
        { label: "To create user interfaces", value: "A" },
        { label: "To handle client-side logic", value: "B" },
        { label: "To process requests before they reach the main application logic", value: "C" },
        { label: "To style web pages", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "Which of the following is NOT a common authentication method in backend development?",
      options: [
        { label: "JWT (JSON Web Tokens)", value: "A" },
        { label: "OAuth", value: "B" },
        { label: "Session-based authentication", value: "C" },
        { label: "CSS authentication", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of a load balancer in backend architecture?",
      options: [
        { label: "To create user interfaces", value: "A" },
        { label: "To distribute network traffic across multiple servers", value: "B" },
        { label: "To manage client-side storage", value: "C" },
        { label: "To style web pages", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "Which of the following is a common way to handle asynchronous operations in backend JavaScript?",
      options: [
        { label: "Promises", value: "A" },
        { label: "Callbacks", value: "B" },
        { label: "Async/Await", value: "C" },
        { label: "All of the above", value: "D" },
      ],
      correct: "D",
    },
    {
      question: "What is the purpose of a message queue in backend architecture?",
      options: [
        { label: "To create user interfaces", value: "A" },
        { label: "To handle client-side logic", value: "B" },
        { label: "To facilitate communication between different parts of a distributed system", value: "C" },
        { label: "To style web pages", value: "D" },
      ],
      correct: "C",
    },
  ],
  cybersecurity: [
    {
      question: "What is the primary goal of cybersecurity?",
      options: [
        { label: "To create faster computer systems", value: "A" },
        { label: "To protect digital assets from unauthorized access and attacks", value: "B" },
        { label: "To develop new software applications", value: "C" },
        { label: "To increase internet speeds", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is a firewall in cybersecurity?",
      options: [
        { label: "A physical barrier to protect servers", value: "A" },
        { label: "A network security device that monitors traffic", value: "B" },
        { label: "A type of computer virus", value: "C" },
        { label: "A backup system for data", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What does 'phishing' refer to in cybersecurity?",
      options: [
        { label: "A method of encrypting data", value: "A" },
        { label: "A type of network protocol", value: "B" },
        { label: "An attempt to obtain sensitive information by disguising as a trustworthy entity", value: "C" },
        { label: "A technique for improving network speed", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is two-factor authentication (2FA)?",
      options: [
        { label: "A method of accessing accounts using two different devices", value: "A" },
        { label: "A security process requiring two different authentication factors", value: "B" },
        { label: "A type of encryption that uses two keys", value: "C" },
        { label: "A technique for creating strong passwords", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is a VPN in cybersecurity?",
      options: [
        { label: "Virtual Private Network", value: "A" },
        { label: "Very Powerful Network", value: "B" },
        { label: "Virus Protection Node", value: "C" },
        { label: "Visual Processing Network", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "What is the purpose of encryption in cybersecurity?",
      options: [
        { label: "To speed up data transmission", value: "A" },
        { label: "To compress data for storage", value: "B" },
        { label: "To convert data into a form that unauthorized parties can't easily understand", value: "C" },
        { label: "To create backup copies of data", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is a DDoS attack?",
      options: [
        { label: "A type of encryption method", value: "A" },
        { label: "A technique for improving network security", value: "B" },
        { label: "An attempt to make a network resource unavailable by overwhelming it with traffic", value: "C" },
        { label: "A method for recovering lost data", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the principle of least privilege in cybersecurity?",
      options: [
        { label: "Giving users the minimum levels of access necessary to perform their job functions", value: "A" },
        { label: "Providing all users with administrative access", value: "B" },
        { label: "Restricting internet access for all users", value: "C" },
        { label: "Allowing only managers to access the network", value: "D" },
      ],
      correct: "A",
    },
    {
      question: "What is a zero-day vulnerability?",
      options: [
        { label: "A security flaw that has existed for zero days", value: "A" },
        { label: "A type of malware that deletes all data", value: "B" },
        { label: "A software vulnerability unknown to the software creator and exploited by attackers", value: "C" },
        { label: "A security measure that provides complete protection", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of a security audit?",
      options: [
        { label: "To increase network speed", value: "A" },
        { label: "To evaluate an organization's security posture", value: "B" },
        { label: "To install new software", value: "C" },
        { label: "To train employees on using computers", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is social engineering in the context of cybersecurity?",
      options: [
        { label: "A method of designing secure social networks", value: "A" },
        { label: "A technique for improving team collaboration", value: "B" },
        { label: "The use of deception to manipulate individuals into divulging confidential information", value: "C" },
        { label: "A way of organizing cybersecurity teams", value: "D" },
      ],
      correct: "C",
    },
    {
      question: "What is the purpose of a penetration test in cybersecurity?",
      options: [
        { label: "To test the physical strength of server rooms", value: "A" },
        { label: "To evaluate the security of a system by simulating an attack", value: "B" },
        { label: "To increase the speed of data transmission", value: "C" },
        { label: "To train new cybersecurity professionals", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is the CIA triad in cybersecurity?",
      options: [
        { label: "Central Intelligence Agency", value: "A" },
        { label: "Confidentiality, Integrity, and Availability", value: "B" },
        { label: "Cybersecurity Intelligence Alliance", value: "C" },
        { label: "Critical Infrastructure Assessment", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is the purpose of a security information and event management (SIEM) system?",
      options: [
        { label: "To create secure passwords", value: "A" },
        { label: "To monitor and analyze security alerts in real-time", value: "B" },
        { label: "To encrypt all network traffic", value: "C" },
        { label: "To train employees on cybersecurity best practices", value: "D" },
      ],
      correct: "B",
    },
    {
      question: "What is the difference between symmetric and asymmetric encryption?",
      options: [
        { label: "Symmetric encryption is faster, asymmetric is more secure", value: "A" },
        { label: "Symmetric uses one key, asymmetric uses two keys", value: "B" },
        { label: "Symmetric is only for small data, asymmetric for large data", value: "C" },
        { label: "Symmetric is for encryption, asymmetric for decryption", value: "D" },
      ],
      correct: "B",
    },
  ],
};

export const CONSTANTS = {
  DELAY: 1000,
  STORAGE_KEY: 'courseRecommenderState',
  SCORE_THRESHOLDS: {
    ADVANCED: 80,
    INTERMEDIATE: 50,
  },
};
