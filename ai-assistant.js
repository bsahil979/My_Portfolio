/**
 * ai-assistant.js
 * Interactive AI Copilot Knowledge Base & Chat Widget for Sahil Belchada's Portfolio.
 * Inspired by the campfire conversational assistant in the Instagram reel.
 */

(function () {
  // Elements
  const aiWidget = document.getElementById('aiWidget');
  const aiFloatingDockBtn = document.getElementById('aiFloatingDockBtn');
  const aiChatBody = document.getElementById('aiChatBody');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiUserInput = document.getElementById('aiUserInput');
  const minimizeAiBtn = document.getElementById('minimizeAiBtn');
  const minimizeIcon = document.getElementById('minimizeIcon');
  const ttsToggleBtn = document.getElementById('ttsToggleBtn');
  const ttsIcon = document.getElementById('ttsIcon');
  const openAiBtn = document.getElementById('openAiBtn');
  const heroAiChatTrigger = document.getElementById('heroAiChatTrigger');
  const contactAiChatTrigger = document.getElementById('contactAiChatTrigger');

  // State
  let isTtsEnabled = false;
  let isGenerating = false;

  // Knowledge Base in Sahil's authentic personal voice
  const KNOWLEDGE = {
    bio: `Hey! I'm **Sahil Belchada**, a B.Tech Computer Engineering student at **K.J. Somaiya College of Engineering, Mumbai** (graduating 2027). 

I'm passionate about building **AI-powered solutions**, **real-time event streaming systems (Kafka, Airflow)**, and **scalable microservices** in Python and Java. I love tackling architecture end-to-end—from ingestion pipelines and star-schema warehouses to LLM agents and interactive dashboards.`,

    marketmind: `**MarketMind AI** is my flagship project! I designed it as an end-to-end distributed market prediction and analytics platform:
• **Microservices Architecture:** I built a **Spring Boot (Java)** service for market ingestion and a **FastAPI (Python)** service for analytics, connected asynchronously via **Apache Kafka**.
• **Live Streaming Pipeline:** Ingests real-time prices every 30s from Yahoo Finance API with producer-consumer Kafka streaming and broker-failure fallback.
• **Automated ETL & Warehousing:** Orchestrated with **Apache Airflow DAGs**, populating a dimensional **Star-Schema PostgreSQL** warehouse optimized for time-series analytics.
• **Forecasting & Risk Models:** I implemented and benchmarked **Linear Regression, Prophet, and LSTM** models tracked with a model registry (RMSE, MAPE, R²), plus portfolio risk metrics (Beta, Sharpe Ratio, VaR).
• **Try it live:** Check out my deployment at [market-mind-ai-q1kl.vercel.app](https://market-mind-ai-q1kl.vercel.app/)!`,

    swdc: `During my **Flutter & Backend Developer Internship at SwDC** (Software Development Cell, K.J. Somaiya School of Engineering), I engineered **MoM Generator** (AI Meeting Minutes & Transcription):
• **RAG Chatbot Pipeline:** Built ChromaDB vector stores and LangChain agent routing in Python with fast-fallback logic to eliminate timeouts.
• **Offline Faster-Whisper:** Implemented a local speech-to-text fallback in Python that transcribes reliably with zero internet dependency.
• **LLM Summarization:** Integrated Gemini API and Groq for structured action item extraction and executive summaries.
• **Audio Diarization:** Programmed client-side native mono WAV chunk merging in **Flutter/Dart** to enable multi-speaker diarization.
• **Cloud & Security:** Built FastAPI backends with PostgreSQL, client disconnect monitors, JWT security, and Docker Compose.`,

    techstack: `Here's what I build with day-to-day:
• **Languages:** Python, Java, JavaScript, SQL, Dart
• **AI & LLMs:** Gemini API, Groq, RAG Pipelines, LangChain, ChromaDB Vector Stores, Prompt Engineering, LSTM, Prophet
• **Data Engineering & ETL:** Apache Kafka, Apache Airflow DAGs, Star Schema Modeling, ETL Pipelines, Time-Series Queries
• **Backend & APIs:** FastAPI, Spring Boot, Node.js, Express.js, WebSockets, REST APIs
• **Databases & Caching:** PostgreSQL, Redis, MongoDB Atlas, SQLite, Supabase
• **DevOps & Infrastructure:** Docker, Docker Compose, AWS (Cloud Technical Essentials), Google Cloud, Prometheus, Grafana, Git
• **Frontend & Mobile:** React 19 / Vite, Next.js, Flutter, Tailwind CSS`,

    haritkranti: `**HaritKranti** is a platform I built to empower farmers with fair trade and technical advisory:
• It's built with the MERN stack (MongoDB Atlas, Express, React, Node.js).
• I integrated a real-time translation API so farmers can navigate and read crop advisories in their local regional Indian languages.
• Secured with JWT and indexed schemas for fast search.
• Check it out live at [haritkranti-s-3m17.vercel.app](https://haritkranti-s-3m17.vercel.app/)!`,

    aurizen: `**Aurizen** is a social habit tracking mobile app I developed using **Flutter & Supabase**:
• Designed with an **offline-first architecture** using local **SQLite** and automatic bi-directional cloud sync with Supabase PostgreSQL.
• Implemented Row Level Security (RLS) policies and real-time WebSocket subscriptions.
• Integrated Firebase Cloud Messaging for social encouragements and habit reminders.`,

    financeApp: `I created the **AI Personal Finance Tracker** using **Next.js, Node.js, and MongoDB**:
• Built an automated CSV ETL pipeline that cleans, deduplicates, and categorizes raw bank statements.
• Integrated LLMs to summarize spending habits and generate actionable budget optimization tips.`,

    contact: `I'd love to connect! You can reach me directly through any of these channels:
• 📧 **Email:** [bsahil979@gmail.com](mailto:bsahil979@gmail.com)
• 📱 **Phone:** [+91 8828049078](tel:+918828049078)
• 💻 **GitHub:** [github.com/bsahil979](https://github.com/bsahil979)
• 📍 **Location:** Mumbai, India
I'm actively open to software engineering, data engineering, and AI roles!`,

    education: `I am currently pursuing my **B.Tech in Computer Engineering** at **K.J. Somaiya College of Engineering, Mumbai**, with expected graduation in **2027**. 

I also hold certifications in **AWS Cloud Technical Essentials**, **UX Design Fundamentals**, and **Graphic Design Fundamentals**.`,

    default: `Thanks for reaching out! As a software and data engineer, I love working on distributed systems, AI architectures, and full-stack platforms. Would you like to know more about my flagship project **MarketMind AI**, my **SwDC internship**, my **tech stack**, or how to **get in touch**?`
  };

  // Process query and return contextual answer in Sahil's voice
  function getAiResponse(userText) {
    const text = userText.toLowerCase().trim();

    if (text.includes('who') || text.includes('about') || text.includes('yourself') || text.includes('sahil') || text.includes('intro') || text.includes('background')) {
      return { answer: KNOWLEDGE.bio, chips: ['MarketMind AI', 'My Tech Stack', 'Contact Me'] };
    }
    if (text.includes('marketmind') || text.includes('market') || text.includes('stock') || text.includes('prediction') || text.includes('financial') || text.includes('flagship')) {
      return { answer: KNOWLEDGE.marketmind, chips: ['SwDC Internship', 'My Tech Stack', 'Contact Me'] };
    }
    if (text.includes('swdc') || text.includes('intern') || text.includes('mom') || text.includes('meeting') || text.includes('whisper') || text.includes('rag')) {
      return { answer: KNOWLEDGE.swdc, chips: ['MarketMind AI', 'My Tech Stack', 'Contact Me'] };
    }
    if (text.includes('stack') || text.includes('skill') || text.includes('technolog') || text.includes('python') || text.includes('java') || text.includes('kafka') || text.includes('tools')) {
      return { answer: KNOWLEDGE.techstack, chips: ['MarketMind AI', 'HaritKranti', 'Contact Me'] };
    }
    if (text.includes('harit') || text.includes('farmer') || text.includes('kranti') || text.includes('agriculture')) {
      return { answer: KNOWLEDGE.haritkranti, chips: ['MarketMind AI', 'Aurizen', 'Contact Me'] };
    }
    if (text.includes('aurizen') || text.includes('habit') || text.includes('flutter') || text.includes('supabase') || text.includes('mobile')) {
      return { answer: KNOWLEDGE.aurizen, chips: ['SwDC Internship', 'MarketMind AI', 'Contact Me'] };
    }
    if (text.includes('personal finance') || text.includes('csv') || text.includes('budget') || text.includes('finance')) {
      return { answer: KNOWLEDGE.financeApp, chips: ['MarketMind AI', 'My Tech Stack'] };
    }
    if (text.includes('contact') || text.includes('hire') || text.includes('email') || text.includes('phone') || text.includes('reach') || text.includes('interview') || text.includes('connect')) {
      return { answer: KNOWLEDGE.contact, chips: ['MarketMind AI', 'SwDC Internship'] };
    }
    if (text.includes('education') || text.includes('college') || text.includes('somaiya') || text.includes('degree') || text.includes('certif') || text.includes('graduat')) {
      return { answer: KNOWLEDGE.education, chips: ['MarketMind AI', 'My Tech Stack', 'Contact Me'] };
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('sup') || text.includes('greetings')) {
      return { 
        answer: `Hey there! Great to meet you. Thanks for pulling up a chair at my campfire. What would you like to explore first?`,
        chips: ['About Me', 'MarketMind AI', 'SwDC Internship', 'Contact Me']
      };
    }

    return { answer: KNOWLEDGE.default, chips: ['About Me', 'MarketMind AI', 'My Tech Stack', 'Contact Me'] };
  }

  // Convert simple markdown into safe HTML
  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  // Speak text with SpeechSynthesis
  function speakResponse(plainText) {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting for cleaner speech
    const cleanSpeech = plainText
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[*#•]/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // Render a chat message
  function appendMessage(sender, content, isHtml = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;

    const senderHeader = document.createElement('div');
    senderHeader.className = 'ai-message-sender';
    senderHeader.innerHTML = sender === 'user' 
      ? `<i class="fa-solid fa-user"></i> You` 
      : `<i class="fa-solid fa-fire"></i> Sahil Belchada`;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'ai-message-content';

    if (isHtml) {
      bodyEl.innerHTML = content;
    } else {
      bodyEl.textContent = content;
    }

    messageEl.appendChild(senderHeader);
    messageEl.appendChild(bodyEl);
    aiChatBody.appendChild(messageEl);


    // Scroll to bottom
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
    return bodyEl;
  }

  // Typewriter streaming effect for AI answers
  function typeWriterEffect(targetEl, fullHtml, rawText, followUpChips) {
    targetEl.innerHTML = '';
    let i = 0;
    isGenerating = true;

    // Fast streaming interval
    const speed = 12;
    const interval = setInterval(() => {
      if (i < fullHtml.length) {
        // If an HTML tag starts, fast-forward through it
        if (fullHtml[i] === '<') {
          const tagClose = fullHtml.indexOf('>', i);
          if (tagClose !== -1) {
            targetEl.innerHTML = fullHtml.slice(0, tagClose + 1);
            i = tagClose + 1;
          } else {
            targetEl.innerHTML = fullHtml.slice(0, i + 1);
            i++;
          }
        } else {
          targetEl.innerHTML = fullHtml.slice(0, i + 1);
          i++;
        }
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
      } else {
        clearInterval(interval);
        isGenerating = false;
        renderChips(followUpChips);
        speakResponse(rawText);
      }
    }, speed);
  }

  // Render follow-up prompt chips
  function renderChips(chips) {
    if (!chips || chips.length === 0) return;

    const oldChips = document.querySelector('.ai-quick-chips');
    if (oldChips) oldChips.remove();

    const chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'ai-quick-chips';

    chips.forEach(chipText => {
      const btn = document.createElement('button');
      btn.className = 'chip-btn';
      btn.textContent = chipText;
      btn.dataset.query = chipText;
      btn.addEventListener('click', () => handleUserInput(chipText));
      chipsWrapper.appendChild(btn);
    });

    aiChatBody.appendChild(chipsWrapper);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  // Handle User Input Submission
  function handleUserInput(text) {
    if (!text || isGenerating) return;

    // 1. User Bubble
    appendMessage('user', text);

    // 2. Clear input
    if (aiUserInput) aiUserInput.value = '';

    // 3. Remove previous chips
    const oldChips = document.querySelector('.ai-quick-chips');
    if (oldChips) oldChips.remove();

    // 4. Generate AI response
    setTimeout(() => {
      const { answer, chips } = getAiResponse(text);
      const formattedHtml = formatMarkdown(answer);
      const responseEl = appendMessage('ai', '', true);
      typeWriterEffect(responseEl, formattedHtml, answer, chips);
    }, 280);
  }

  // Toggle Visibility
  function openWidget() {
    if (aiWidget) aiWidget.classList.remove('minimized');
    if (aiFloatingDockBtn) aiFloatingDockBtn.classList.add('hidden');
    if (minimizeIcon) {
      minimizeIcon.classList.remove('fa-chevron-up');
      minimizeIcon.classList.add('fa-chevron-down');
    }
    setTimeout(() => {
      if (aiUserInput) aiUserInput.focus();
    }, 200);
  }

  function minimizeWidget() {
    if (aiWidget) aiWidget.classList.add('minimized');
    if (aiFloatingDockBtn) aiFloatingDockBtn.classList.remove('hidden');
    if (minimizeIcon) {
      minimizeIcon.classList.remove('fa-chevron-down');
      minimizeIcon.classList.add('fa-chevron-up');
    }
  }

  function toggleWidget() {
    if (aiWidget.classList.contains('minimized')) {
      openWidget();
    } else {
      minimizeWidget();
    }
  }

  // Event Listeners
  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = aiUserInput.value.trim();
      if (val) handleUserInput(val);
    });
  }

  // Initial chips click handlers
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (q) handleUserInput(q);
    });
  });

  // Project cards "Ask AI About This" buttons
  document.querySelectorAll('.ask-ai-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectName = btn.getAttribute('data-project');
      openWidget();
      handleUserInput(`Tell me all about ${projectName}`);
    });
  });

  if (openAiBtn) openAiBtn.addEventListener('click', openWidget);
  if (heroAiChatTrigger) heroAiChatTrigger.addEventListener('click', openWidget);
  if (contactAiChatTrigger) contactAiChatTrigger.addEventListener('click', openWidget);
  if (minimizeAiBtn) minimizeAiBtn.addEventListener('click', minimizeWidget);
  if (aiFloatingDockBtn) aiFloatingDockBtn.addEventListener('click', openWidget);

  // Text-To-Speech Toggle
  if (ttsToggleBtn) {
    ttsToggleBtn.addEventListener('click', () => {
      isTtsEnabled = !isTtsEnabled;
      ttsToggleBtn.classList.toggle('active', isTtsEnabled);
      if (ttsIcon) {
        ttsIcon.className = isTtsEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      }
      if (!isTtsEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    });
  }

  // Expose global trigger
  window.askSahilAi = function (query) {
    openWidget();
    handleUserInput(query);
  };
})();
