/**
 * ai-assistant.js
 * SAHIL.OS // COPILOT v2.4
 * Autonomous Engineering Copilot for Sahil Belchada's Portfolio.
 * Provides instant technical intelligence on architecture, Kafka pipelines,
 * SwDC internship, forecasting models, and direct contact.
 */

(function () {
  'use strict';

  // Elements
  const copilotModal = document.getElementById('copilotModal');
  const copilotToggleBtns = document.querySelectorAll('.copilot-toggle-btn');
  const copilotCloseBtn = document.getElementById('copilotCloseBtn');
  const copilotHistory = document.getElementById('copilotHistory');
  const copilotForm = document.getElementById('copilotForm');
  const copilotInput = document.getElementById('copilotInput');
  const copilotChips = document.getElementById('copilotChips');
  const ttsBtn = document.getElementById('copilotTtsBtn');

  let isTtsEnabled = false;
  let isGenerating = false;

  // Engineering Knowledge Base
  const SYSTEM_KNOWLEDGE = {
    bio: `**Sahil Belchada** is a B.Tech Computer Engineering student at **K.J. Somaiya College of Engineering, Mumbai** (graduating 2027).\n\nSpecialized in **distributed microservices, real-time data pipelines (Kafka, Airflow)**, and **production AI/ML systems** in Python, Java, and TypeScript. Focuses on systems thinking: designing fault-tolerant architectures from event ingestion to vector RAG and high-throughput databases.`,

    marketmind: `**MarketMind AI** is Sahil's flagship distributed financial intelligence platform:\n\n• **Microservices Architecture:** Spring Boot (Java) price ingestion service + FastAPI (Python) analytics service connected via **Apache Kafka** event streaming.\n• **Real-Time Ingestion:** Ingests live asset prices every 30 seconds from Yahoo Finance with broker-failure fallback and raw JSON persistence.\n• **ETL & Dimensional Modeling:** Orchestrated by **Apache Airflow DAGs**, feeding a Star-Schema **PostgreSQL** warehouse optimized for time-series analytics.\n• **Forecasting & Risk Engine:** Implements Linear Regression, Prophet, and LSTM neural networks with a model registry tracking RMSE, MAPE, and R², plus risk metrics (Beta, Sharpe Ratio, VaR).\n• **Stack & Ops:** Redis query cache, WebSocket live price feeds, Prometheus & Grafana metrics, containerized with Docker Compose.\n• **Live Deployment:** [market-mind-ai-q1kl.vercel.app](https://market-mind-ai-q1kl.vercel.app/)`,

    swdc: `During his **Flutter & Backend Developer Internship at SwDC** (Software Development Cell, K.J. Somaiya School of Engineering), Sahil engineered the **MoM Generator** (Enterprise AI Meeting Minutes & Audio Transcription Platform):\n\n• **Vector RAG Chatbot:** ChromaDB vector store + LangChain agent in Python with fast-fallback routing logic to prevent network timeouts.\n• **Offline Speech Fallback:** Local Faster-Whisper pipeline in Python for 100% resilient speech-to-text with zero internet dependency.\n• **Dual LLM Pipeline:** Gemini API + Groq for rapid unstructured transcript summarization and structured action item extraction.\n• **Audio Diarization:** Client-side native mono WAV chunk merging in Flutter/Dart.\n• **Backend & Security:** FastAPI with PostgreSQL (psycopg2), client disconnection monitors, JWT/bcrypt authentication, Docker deployment.`,

    architecture: `Sahil's core architectural philosophy emphasizes **decoupled services and resilient state pipelines**:\n\n1. **Edge/Client:** React 19 / Next.js / Flutter with WebSocket duplex feeds.\n2. **Gateway:** Reverse proxy with JWT authentication and rate limiting.\n3. **Services:** Polyglot microservices (Spring Boot for raw throughput, FastAPI for asynchronous AI & analytics).\n4. **Event Streaming:** Apache Kafka for asynchronous decoupling with producer-consumer failover.\n5. **ETL & Storage:** Airflow DAGs normalizing data into Star Schema PostgreSQL + Redis in-memory cache.\n6. **Inference Tier:** Local Faster-Whisper & PyTorch with cloud LLM orchestration (Gemini, Groq) and ChromaDB vector indexing.`,

    stack: `**Technical Ecosystem:**\n\n• **Languages:** Python, Java, JavaScript, TypeScript, SQL, Dart\n• **AI & ML:** Gemini API, Groq, LangChain, ChromaDB Vector Stores, PyTorch, LSTM, Prophet, Faster-Whisper, Prompt Engineering\n• **Data & ETL:** Apache Kafka, Apache Airflow DAGs, Star Schema Modeling, Time-Series Queries, Data Normalization\n• **Backend:** FastAPI, Spring Boot, Node.js, Express.js, WebSockets, REST APIs\n• **Databases:** PostgreSQL (Star Schema), Redis, MongoDB Atlas, SQLite, Supabase\n• **Cloud & DevOps:** Docker, Docker Compose, AWS (Cloud Technical Essentials), Google Cloud, Prometheus, Grafana, Linux, Git / GitHub\n• **Frontend & Mobile:** React 19, Next.js, Tailwind CSS, Flutter, Vite`,

    haritkranti: `**HaritKranti** is a full-stack agricultural platform empowering farmers with fair direct trade and agronomy advisory:\n\n• **MERN Architecture:** Node.js & Express REST APIs, MongoDB Atlas with optimized compound indexing.\n• **Multilingual Localization:** Integrated real-time translation API enabling immediate UI switching into multiple Indian regional languages.\n• **Direct Marketplace:** Crop advisory feeds, disease guides, and JWT-authenticated trade channels.\n• **Live Deployment:** [haritkranti-s-3m17.vercel.app](https://haritkranti-s-3m17.vercel.app/)`,

    aurizen: `**Aurizen** is a mobile habit tracking application engineered with an **offline-first distributed architecture**:\n\n• Built in **Flutter & Dart** with local SQLite caching for zero-latency offline interaction.\n• **Supabase Cloud** (PostgreSQL, Row Level Security RLS, Realtime WebSockets).\n• Bidirectional sync engine with conflict resolution and Firebase Cloud Messaging (FCM).`,

    finance: `**AI Personal Finance App**:\n\n• Full-stack Next.js, Node.js, and MongoDB platform.\n• Automated bank statement CSV ETL pipeline for transaction deduplication & categorization.\n• LLM spending analysis copilot to generate actionable budget suggestions.`,

    contact: `**Contact & Communication Channels:**\n\n• **Email:** [bsahil979@gmail.com](mailto:bsahil979@gmail.com)\n• **Phone:** [+91 8828049078](tel:+918828049078)\n• **GitHub:** [github.com/bsahil979](https://github.com/bsahil979)\n• **Resume:** [Download Sahil's Resume](assets/Sahil_Belchada_Resume.pdf)\n• **Location:** Mumbai, India\n\nSahil is actively seeking Software Engineering, AI/ML, Cloud, and Backend roles.`,

    education: `**Academic Foundation:**\n\n• **Degree:** B.Tech in Computer Engineering\n• **Institution:** K.J. Somaiya College of Engineering, Mumbai\n• **Expected Graduation:** 2027\n• **Key Certifications:** AWS Cloud Technical Essentials (AWS 2026), UX Design Fundamentals (Coursera 2025), Fundamentals of Graphic Design (Coursera 2025).`,

    default: `Command recognized. I can provide technical breakdowns of Sahil's **MarketMind AI microservices**, **Kafka streaming pipelines**, **SwDC internship (MoM Generator)**, **system architecture**, **tech stack**, or **direct contact details**.\n\nType a question or select a command below.`
  };

  function getCopilotResponse(query) {
    const q = query.toLowerCase().trim();

    if (q.includes('marketmind') || q.includes('stock') || q.includes('finance') || q.includes('prediction') || q.includes('flagship')) {
      return { text: SYSTEM_KNOWLEDGE.marketmind, suggestions: ['System Architecture', 'SwDC Internship', 'Tech Stack'] };
    }
    if (q.includes('swdc') || q.includes('mom') || q.includes('meeting') || q.includes('whisper') || q.includes('intern')) {
      return { text: SYSTEM_KNOWLEDGE.swdc, suggestions: ['MarketMind AI', 'System Architecture', 'Contact Info'] };
    }
    if (q.includes('architecture') || q.includes('pipeline') || q.includes('kafka') || q.includes('airflow') || q.includes('design')) {
      return { text: SYSTEM_KNOWLEDGE.architecture, suggestions: ['MarketMind AI', 'Tech Stack', 'Contact Info'] };
    }
    if (q.includes('stack') || q.includes('skill') || q.includes('language') || q.includes('python') || q.includes('java') || q.includes('tools')) {
      return { text: SYSTEM_KNOWLEDGE.stack, suggestions: ['MarketMind AI', 'SwDC Internship', 'Contact Info'] };
    }
    if (q.includes('harit') || q.includes('kranti') || q.includes('farmer') || q.includes('agriculture')) {
      return { text: SYSTEM_KNOWLEDGE.haritkranti, suggestions: ['MarketMind AI', 'Tech Stack', 'Contact Info'] };
    }
    if (q.includes('aurizen') || q.includes('habit') || q.includes('flutter') || q.includes('sqlite')) {
      return { text: SYSTEM_KNOWLEDGE.aurizen, suggestions: ['SwDC Internship', 'Tech Stack', 'Contact Info'] };
    }
    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('interview')) {
      return { text: SYSTEM_KNOWLEDGE.contact, suggestions: ['MarketMind AI', 'Resume / CV', 'System Architecture'] };
    }
    if (q.includes('resume') || q.includes('cv')) {
      return { text: `You can view or download Sahil's verified resume here: [Sahil_Belchada_Resume.pdf](assets/Sahil_Belchada_Resume.pdf).`, suggestions: ['Tech Stack', 'Contact Info', 'MarketMind AI'] };
    }
    if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('somaiya')) {
      return { text: SYSTEM_KNOWLEDGE.education, suggestions: ['SwDC Internship', 'MarketMind AI', 'Contact Info'] };
    }
    if (q.includes('who') || q.includes('about') || q.includes('sahil') || q.includes('intro')) {
      return { text: SYSTEM_KNOWLEDGE.bio, suggestions: ['MarketMind AI', 'System Architecture', 'Tech Stack'] };
    }

    return { text: SYSTEM_KNOWLEDGE.default, suggestions: ['MarketMind AI', 'SwDC Internship', 'System Architecture', 'Tech Stack', 'Contact Info'] };
  }

  function formatMarkdown(text) {
    let out = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Links
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="copilot-link">$1 <i class="fa-solid fa-arrow-up-right-from-square"></i></a>');
    // Bullet points
    out = out.replace(/^• (.*)$/gm, '<li class="copilot-bullet">$1</li>');
    out = out.replace(/(<li.*<\/li>)/s, '<ul class="copilot-list">$1</ul>');
    // Line breaks
    out = out.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    return out;
  }

  function appendMessage(sender, rawText, isUser = false) {
    if (!copilotHistory) return;
    const msgEl = document.createElement('div');
    msgEl.className = `copilot-msg ${isUser ? 'user-msg' : 'sys-msg'}`;

    const metaEl = document.createElement('div');
    metaEl.className = 'copilot-msg-meta';
    metaEl.innerHTML = isUser
      ? `<span class="prompt-sym">&gt;</span> YOU <span class="copilot-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`
      : `<span class="copilot-badge">SAHIL.OS</span> SYSTEM <span class="copilot-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'copilot-msg-body';
    bodyEl.innerHTML = formatMarkdown(rawText);

    msgEl.appendChild(metaEl);
    msgEl.appendChild(bodyEl);
    copilotHistory.appendChild(msgEl);
    copilotHistory.scrollTop = copilotHistory.scrollHeight;

    // Optional Speech Synthesis
    if (!isUser && isTtsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanSpeech = rawText.replace(/[*#_\[\]\(\)]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 300));
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  function updateQuickChips(chips) {
    if (!copilotChips) return;
    copilotChips.innerHTML = '';
    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'copilot-chip-btn';
      btn.textContent = chip;
      btn.addEventListener('click', () => {
        handleUserQuery(chip);
      });
      copilotChips.appendChild(btn);
    });
  }

  function handleUserQuery(query) {
    if (!query || isGenerating) return;
    isGenerating = true;

    appendMessage('user', query, true);
    if (copilotInput) copilotInput.value = '';

    // Simulate rapid system calculation (160ms)
    setTimeout(() => {
      const res = getCopilotResponse(query);
      appendMessage('system', res.text, false);
      updateQuickChips(res.suggestions);
      isGenerating = false;
      if (copilotInput) copilotInput.focus();
    }, 160);
  }

  function openCopilot() {
    if (!copilotModal) return;
    copilotModal.classList.add('active');
    document.body.classList.add('modal-open');
    if (copilotInput) {
      setTimeout(() => copilotInput.focus(), 150);
    }
  }

  function closeCopilot() {
    if (!copilotModal) return;
    copilotModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function init() {
    // Toggle triggers
    copilotToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCopilot();
      });
    });

    if (copilotCloseBtn) {
      copilotCloseBtn.addEventListener('click', closeCopilot);
    }

    // Close on overlay backdrop click
    if (copilotModal) {
      copilotModal.addEventListener('click', (e) => {
        if (e.target === copilotModal) {
          closeCopilot();
        }
      });
    }

    // Form submit
    if (copilotForm) {
      copilotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = copilotInput ? copilotInput.value.trim() : '';
        if (val) handleUserQuery(val);
      });
    }

    // TTS Toggle
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        isTtsEnabled = !isTtsEnabled;
        ttsBtn.classList.toggle('active', isTtsEnabled);
        const icon = ttsBtn.querySelector('i');
        if (icon) {
          icon.className = isTtsEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
        if (!isTtsEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    // Keyboard Shortcuts: Cmd/Ctrl + K or Escape
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (copilotModal && copilotModal.classList.contains('active')) {
          closeCopilot();
        } else {
          openCopilot();
        }
      }
      if (e.key === 'Escape' && copilotModal && copilotModal.classList.contains('active')) {
        closeCopilot();
      }
    });

    // Initial Chips
    updateQuickChips([
      'MarketMind AI Architecture',
      'Kafka Data Pipelines',
      'SwDC Internship (MoM Generator)',
      'Tech Ecosystem',
      'Contact Sahil'
    ]);
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.openSahilCopilot = function (initialQuery) {
    openCopilot();
    if (initialQuery) {
      setTimeout(() => handleUserQuery(initialQuery), 250);
    }
  };
})();
