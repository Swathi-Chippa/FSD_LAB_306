import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">

      <p>👋 Hello, I'm</p>
      <h1>Swathi Chippa</h1>
      <h2>AI/ML Developer & Web Developer</h2>
      <p>B.E. CSE (AI/ML) student at CBIT Hyderabad ·Passionate about building intelligent, real-world AI solutions ·Graduating 2028</p>
      <div className="buttons">
        <Link to="/about"><button>View My Work</button></Link>
        <Link to="/contact"><button>Get In Touch</button></Link>
      </div>
      <div className="stats">
        <div><h2>99.49%</h2><p>Best Model Accuracy</p></div>
        <div><h2>2</h2><p>Internships</p></div>
        <div><h2>2+</h2><p>ML Projects</p></div>
        <div><h2>2028</h2><p>Graduating</p></div>
      </div>
    </div>
  );
}

export default Home;