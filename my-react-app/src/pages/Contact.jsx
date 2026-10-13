import { Link } from "react-router-dom";

function Contact() {
  return (
    <div className="page">
      <h1>Get In Touch</h1>
      <p>I'm always open to discussing projects, internships, collaborations,and opportunities.
      </p>

      <div className="contact-info">
        <h2>Contact Me</h2>
        <p>📧 Email:<a href="mailto:chippaswathi8@gmail.com">chippaswathi8@gmail.com</a></p>
        <p>💻 GitHub:<a href="https://github.com/Swathi-Chippa"target="_blank"rel="noreferrer">GitHub Profile</a></p>
        <p>🔗 LinkedIn:<a href="https://www.linkedin.com/"target="_blank"rel="noreferrer">LinkedIn Profile</a></p>
      </div>
      <Link to="/"><button>Back to Home</button></Link>
    </div>
  );
}

export default Contact;