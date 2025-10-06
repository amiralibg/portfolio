import { useState } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import resumeData from "~/data/resume.json";

// This component will be rendered inside the 3D MacBook screen (530x450px)
export default function PortfolioScreen() {
  const [currentSection, setCurrentSection] = useState(0);
  // Pointer swipe tracking
  let startX = 0;
  let startY = 0;
  let isPointerDown = false;
  let didMove = false;

  const onPointerDown = (e: React.PointerEvent) => {
    isPointerDown = true;
    didMove = false;
    startX = e.clientX;
    startY = e.clientY;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // If vertical movement is more significant, cancel swipe detection so scrolling still works
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      isPointerDown = false;
      return;
    }

    if (Math.abs(dx) > 10) {
      didMove = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!didMove) {
      isPointerDown = false;
      return;
    }

    const dx = e.clientX - startX;
    const threshold = 60; // pixels required to consider a swipe

    if (dx < -threshold) {
      // swipe left -> next
      setCurrentSection((s) => Math.min(s + 1, sections.length - 1));
    } else if (dx > threshold) {
      // swipe right -> prev
      setCurrentSection((s) => Math.max(s - 1, 0));
    }

    isPointerDown = false;
    didMove = false;
  };

  const sections = [
    {
      title: "Welcome",
      content: (
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
          >
            {resumeData.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-base text-white/90"
          >
            {resumeData.title}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-xs text-white/70 leading-relaxed"
          >
            {resumeData.summary}
          </motion.p>
        </div>
      ),
    },
    {
      title: "Skills",
      content: (
        <div className="space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-teal-400"
          >
            Technical Skills
          </motion.h2>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(resumeData.skills).map(([category, items], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <h3 className="text-xs font-semibold text-teal-400 mb-2 capitalize">
                  {category.replace(/([A-Z])/g, " $1").trim()}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(items as string[]).map((skill, skillIdx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.2,
                        delay: idx * 0.1 + skillIdx * 0.03,
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-2 py-1 text-[10px] bg-teal-400/10 border border-teal-400/30 rounded-lg text-teal-400 cursor-default hover:bg-teal-400/20 hover:border-teal-400 transition-colors"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Experience",
      content: (
        <div className="space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-red-400"
          >
            Work Experience
          </motion.h2>
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {resumeData.experience.map((job, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.15 }}
                whileHover={{ x: 5 }}
                className="p-3 bg-red-400/5 border border-red-400/20 rounded-lg hover:bg-red-400/8 hover:border-red-400/40 transition-all"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-400">
                      {job.position}
                    </h3>
                    <p className="text-xs text-white/90">{job.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-red-400 font-medium">
                      {job.period}
                    </span>
                    <br />
                    <span className="text-[9px] bg-red-400/20 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {job.type}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-white/70 leading-relaxed mb-2">
                  {job.description}
                </p>
                <ul className="text-[9px] text-white/75 space-y-1 pl-3 list-disc">
                  {job.responsibilities.slice(0, 2).map((resp, rIdx) => (
                    <li key={rIdx}>{resp}</li>
                  ))}
                </ul>
                {job.technologies && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.technologies.slice(0, 6).map((tech) => (
                      <span
                        key={tech}
                        className="text-[8px] px-1.5 py-0.5 bg-red-400/15 border border-red-400/30 rounded text-red-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Projects",
      content: (
        <div className="space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-purple-400"
          >
            Freelance Projects
          </motion.h2>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {resumeData.freelanceProjects.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.12 }}
                whileHover={{ x: -5 }}
                className="p-3 bg-purple-400/5 border border-purple-400/20 rounded-lg hover:bg-purple-400/8 hover:border-purple-400/40 transition-all"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-purple-400 flex-1">
                    {project.title}
                  </h3>
                  <span className="text-[10px] text-purple-400 font-medium bg-purple-400/15 px-2 py-0.5 rounded-full shrink-0">
                    {project.year}
                  </span>
                </div>
                <p className="text-[10px] text-white/70 leading-relaxed mb-2">
                  {project.description}
                </p>
                {project.responsibilities && (
                  <ul className="text-[9px] text-white/70 space-y-1 pl-3 list-disc mb-2">
                    {project.responsibilities.slice(0, 2).map((resp, rIdx) => (
                      <li key={rIdx}>{resp}</li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 6).map((tech) => (
                    <span
                      key={tech}
                      className="text-[8px] px-1.5 py-0.5 bg-purple-400/15 border border-purple-400/30 rounded text-purple-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      content: (
        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-cyan-400"
          >
            Get In Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-white/80 leading-relaxed"
          >
            I'm always interested in new opportunities and exciting projects.
            Let's connect and build something amazing together!
          </motion.p>
          <div className="space-y-2.5">
            {[
              { icon: "📧", label: resumeData.contact.email, href: `mailto:${resumeData.contact.email}` },
              { icon: "💼", label: "LinkedIn Profile", href: resumeData.contact.linkedin },
              { icon: "🐙", label: "GitHub Portfolio", href: resumeData.contact.github },
              { icon: "📱", label: resumeData.contact.phone, href: `tel:${resumeData.contact.phone}` },
            ].map((contact, idx) => (
              <motion.a
                key={idx}
                href={contact.href}
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                whileHover={{ x: 10, scale: 1.02 }}
                className="flex items-center gap-3 p-2.5 bg-cyan-400/10 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/15 hover:border-cyan-400 transition-all no-underline"
              >
                <span className="text-lg">{contact.icon}</span>
                <span className="text-xs text-cyan-400">{contact.label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="w-full h-full bg-gradient-to-br from-gray-950 via-slate-900 to-blue-950 text-white font-sans relative overflow-hidden p-4"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Navigation */}
        <nav className="absolute top-5 right-5 flex gap-1.5 z-10">
          {sections.map((section, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSection(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-2.5 py-1 text-[10px] rounded-full transition-all ${
                currentSection === index
                  ? "bg-white/20 border border-white/30"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              {section.title}
            </motion.button>
          ))}
        </nav>

        {/* Content */}
        <div className="h-full flex flex-col justify-center pt-6 pb-8">
          <div className="max-w-[480px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {sections[currentSection].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Section indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {sections.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => setCurrentSection(index)}
              whileHover={{ scale: 1.2 }}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                currentSection === index ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </LazyMotion>
  );
}
