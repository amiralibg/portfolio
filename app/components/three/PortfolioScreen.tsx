import { useState } from "react";

// This component will be rendered inside the 3D MacBook screen
export default function PortfolioScreen() {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      title: "Welcome",
      content: (
        <div>
          <h1
            style={{
              fontSize: "48px",
              margin: "0 0 20px 0",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Amirali BG
          </h1>
          <p style={{ fontSize: "20px", lineHeight: "1.6" }}>
            Full-stack Developer & UI/UX Designer
          </p>
          <p style={{ fontSize: "16px", opacity: 0.8, marginTop: "15px" }}>
            Building beautiful, performant web applications with modern
            technologies.
          </p>
        </div>
      ),
    },
    {
      title: "About",
      content: (
        <div>
          <h2
            style={{ fontSize: "36px", margin: "0 0 20px 0", color: "#64ffda" }}
          >
            About Me
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              marginBottom: "15px",
            }}
          >
            I'm a passionate developer with expertise in React, TypeScript, and
            modern web technologies. I love creating interactive experiences
            that combine beautiful design with robust functionality.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "30px",
            }}
          >
            {[
              "React",
              "TypeScript",
              "Three.js",
              "Node.js",
              "Python",
              "UI/UX",
            ].map((skill) => (
              <span
                key={skill}
                style={{
                  padding: "8px 16px",
                  background: "rgba(100, 255, 218, 0.1)",
                  border: "1px solid #64ffda",
                  borderRadius: "20px",
                  fontSize: "16px",
                  color: "#64ffda",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Projects",
      content: (
        <div>
          <h2
            style={{ fontSize: "36px", margin: "0 0 20px 0", color: "#ff6b6b" }}
          >
            Featured Projects
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  color: "#ff6b6b",
                  margin: "0 0 10px 0",
                }}
              >
                3D Portfolio Site
              </h3>
              <p style={{ fontSize: "16px", opacity: 0.8 }}>
                Interactive portfolio with Three.js integration and CSS3D
                rendering.
              </p>
            </div>
            <div
              style={{
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  color: "#ff6b6b",
                  margin: "0 0 10px 0",
                }}
              >
                E-Commerce Platform
              </h3>
              <p style={{ fontSize: "16px", opacity: 0.8 }}>
                Full-stack e-commerce solution with React and Node.js.
              </p>
            </div>
            <div
              style={{
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  color: "#ff6b6b",
                  margin: "0 0 10px 0",
                }}
              >
                Mobile App Design
              </h3>
              <p style={{ fontSize: "16px", opacity: 0.8 }}>
                UI/UX design for a productivity mobile application.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      content: (
        <div>
          <h2
            style={{ fontSize: "36px", margin: "0 0 20px 0", color: "#4ecdc4" }}
          >
            Get In Touch
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              marginBottom: "20px",
            }}
          >
            I'm always interested in new opportunities and exciting projects.
            Let's connect and build something amazing together!
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "24px" }}>📧</span>
              <span style={{ fontSize: "18px", color: "#4ecdc4" }}>
                contact@amiralibg.dev
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "24px" }}>💼</span>
              <span style={{ fontSize: "18px", color: "#4ecdc4" }}>
                LinkedIn Profile
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "24px" }}>🐙</span>
              <span style={{ fontSize: "18px", color: "#4ecdc4" }}>
                GitHub Portfolio
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
        color: "white",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
      className="portfolio-screen"
    >
      {/* Navigation */}
      <nav
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}
      >
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            style={{
              padding: "8px 16px",
              background:
                currentSection === index
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border:
                currentSection === index
                  ? "1px solid rgba(255, 255, 255, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {section.title}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div
        style={{
          padding: "60px 40px 40px 40px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          {sections[currentSection].content}
        </div>
      </div>

      {/* Section indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {sections.map((_, index) => (
          <div
            key={index}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background:
                currentSection === index ? "white" : "rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => setCurrentSection(index)}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
