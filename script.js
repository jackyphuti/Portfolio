document.addEventListener('DOMContentLoaded', () => {

    // --- Video Intro Splash Screen Handler ---
    const videoIntro = document.getElementById('video-intro');
    const introVideo = videoIntro ? videoIntro.querySelector('.intro-video') : null;
    
    if (videoIntro && introVideo) {
        // Remove intro after video ends or after 5 seconds (whichever comes first)
        const removeIntro = () => {
            videoIntro.classList.add('fade-out');
            setTimeout(() => {
                videoIntro.style.display = 'none';
            }, 800); // Match transition duration
        };
        
        // Option 1: Remove after video ends
        introVideo.addEventListener('ended', removeIntro);
        
        // Option 2: Remove after 5 seconds (fallback)
        setTimeout(removeIntro, 5000);
        
        // Option 3: Allow skip on click
        videoIntro.addEventListener('click', removeIntro);
    }

    // --- Active Navigation Link on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.6 // 60% of the section must be visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`nav a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });


    // --- Fade-in Animation on Scroll ---
    const fadeInElements = document.querySelectorAll('.fade-in');

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeInElements.forEach(element => {
        fadeInObserver.observe(element);
    });

    // --- Project badges: stars + last updated from GitHub API ---
    const projectMetaRows = document.querySelectorAll('.project-meta[data-repo]');

    const formatUpdatedDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const loadRepoMeta = async (metaRow) => {
        const repo = metaRow.getAttribute('data-repo');
        const starEl = metaRow.querySelector('.repo-star-badge');
        const updatedEl = metaRow.querySelector('.repo-updated-badge');

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (!response.ok) {
                throw new Error('GitHub API request failed');
            }

            const data = await response.json();
            starEl.textContent = `Stars: ${data.stargazers_count}`;
            updatedEl.textContent = `Updated: ${formatUpdatedDate(data.updated_at)}`;
        } catch (error) {
            starEl.textContent = 'Stars: N/A';
            updatedEl.textContent = 'Updated: N/A';
        }
    };

    projectMetaRows.forEach(metaRow => {
        loadRepoMeta(metaRow);
    });

    // --- GitHub tech stack icons ---
    const githubStackGrid = document.getElementById('github-stack-grid');

    const techIconMap = {
        'C++': { label: 'C++', icon: 'cplusplus' },
        Python: { label: 'Python', icon: 'python' },
        JavaScript: { label: 'JavaScript', icon: 'javascript' },
        TypeScript: { label: 'TypeScript', icon: 'typescript' },
        HTML: { label: 'HTML5', icon: 'html5' },
        CSS: { label: 'CSS3', icon: 'css3' },
        'Jupyter Notebook': { label: 'Jupyter', icon: 'jupyter' },
        GDScript: { label: 'Godot', icon: 'godot' },
        Flask: { label: 'Flask', icon: 'flask' },
        SQLite: { label: 'SQLite', icon: 'sqlite' },
        Git: { label: 'Git', icon: 'git' },
        Node: { label: 'Node.js', icon: 'nodejs' }
    };

    const knownTechFallback = ['Flask', 'SQLite', 'Git', 'Node'];

    const createStackItem = (name) => {
        const mapped = techIconMap[name] || { label: name, icon: null };
        const item = document.createElement('article');
        item.className = 'stack-item';

        if (mapped.icon) {
            const icon = document.createElement('img');
            icon.className = 'stack-icon';
            icon.alt = `${mapped.label} icon`;
            icon.loading = 'lazy';
            icon.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${mapped.icon}/${mapped.icon}-original.svg`;
            item.appendChild(icon);
        } else {
            const fallback = document.createElement('div');
            fallback.className = 'stack-fallback';
            fallback.textContent = mapped.label.slice(0, 2).toUpperCase();
            item.appendChild(fallback);
        }

        const label = document.createElement('p');
        label.textContent = mapped.label;
        item.appendChild(label);

        return item;
    };

    const renderTechStack = async () => {
        if (!githubStackGrid) {
            return;
        }

        try {
            const response = await fetch('https://api.github.com/users/jackyphuti/repos?per_page=100');
            if (!response.ok) {
                throw new Error('Failed to fetch GitHub repos');
            }

            const repos = await response.json();
            const languageSet = new Set();

            repos.forEach((repo) => {
                if (repo.language) {
                    languageSet.add(repo.language);
                }

                if (Array.isArray(repo.topics)) {
                    repo.topics.forEach((topic) => {
                        if (!topic) {
                            return;
                        }

                        const normalized = topic
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, (ch) => ch.toUpperCase());
                        languageSet.add(normalized);
                    });
                }
            });

            knownTechFallback.forEach((tech) => languageSet.add(tech));

            githubStackGrid.innerHTML = '';
            Array.from(languageSet)
                .sort((a, b) => a.localeCompare(b))
                .forEach((tech) => {
                    githubStackGrid.appendChild(createStackItem(tech));
                });
        } catch (error) {
            githubStackGrid.innerHTML = '';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'stack-item loading';
            fallbackText.textContent = 'Could not load GitHub stack right now.';
            githubStackGrid.appendChild(fallbackText);
        }
    };

    renderTechStack();

    // --- Portfolio chatbot ---
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatPanel = document.getElementById('chatbot-panel');
    const chatClose = document.getElementById('chatbot-close');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const chatModeLabel = document.getElementById('chatbot-mode');

    const portfolioContext = {
        name: 'Jacky Mpoka',
        location: 'Pretoria, South Africa',
        email: 'jackympoka22@gmail.com',
        linkedin: 'https://www.linkedin.com/in/jacky-mpoka-860423354/',
        github: 'https://github.com/jackyphuti',
        cvUrl: 'cv.html',
        education: 'BSc Information Technology at the University of Pretoria (Data Science and Computer Science major).',
        careerGoals: 'Build impactful software products, grow into advanced software engineering and applied AI roles, and contribute to data-driven systems with social impact.',
        availability: 'Open to internships, junior software engineering roles, and collaboration opportunities.',
        skills: 'Python, C++, JavaScript/TypeScript, Flask, SQLite, Git, computer vision and object detection.',
        experience: 'Hands-on training from WeThinkCode and active learning through the FNB App Academy.'
    };

    // Runtime config: backendUrl defaults to local Express endpoint.
    const aiConfig = {
        backendUrl: '/api/chat',
        ...window.PORTFOLIO_AI_CONFIG
    };

    const appendMessage = (text, sender) => {
        const message = document.createElement('div');
        message.className = `chatbot-message ${sender}`;
        message.textContent = text;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const localBotReply = (question) => {
        const q = question.toLowerCase();

        if (q.includes('skill') || q.includes('tech') || q.includes('stack')) {
            return `Jacky works mainly with ${portfolioContext.skills}`;
        }
        if (q.includes('study') || q.includes('university') || q.includes('education')) {
            return portfolioContext.education;
        }
        if (q.includes('experience') || q.includes('bootcamp') || q.includes('academy')) {
            return portfolioContext.experience;
        }
        if (q.includes('project') || q.includes('best work') || q.includes('portfolio')) {
            return 'Top projects include Web-Server-Ray-Tracer, SpeedPoint-AI, Konnekt-My-City, Face-Eye-blink-unlock-demo, Terminal_Rogue_98, and Municipal-Fault-Reporter.';
        }
        if (q.includes('career') || q.includes('goal') || q.includes('future')) {
            return portfolioContext.careerGoals;
        }
        if (q.includes('available') || q.includes('availability') || q.includes('hire') || q.includes('open to')) {
            return portfolioContext.availability;
        }
        if (q.includes('cv') || q.includes('resume')) {
            return `You can download Jacky's CV here: ${portfolioContext.cvUrl}`;
        }
        if (q.includes('contact') || q.includes('email') || q.includes('reach')) {
            return `You can contact Jacky at ${portfolioContext.email} or via LinkedIn: ${portfolioContext.linkedin}`;
        }
        if (q.includes('location') || q.includes('where')) {
            return `Jacky is based in ${portfolioContext.location}.`;
        }

        return 'I can help with Jacky\'s skills, education, experience, projects, career goals, availability, CV, and contact details.';
    };

    let backendHealthOk = false;

    const hasDynamicAi = () => {
        if (aiConfig.backendUrl) {
            return backendHealthOk;
        }
        if (aiConfig.provider === 'openai' && aiConfig.apiKey) {
            return true;
        }
        if (aiConfig.provider === 'gemini' && aiConfig.apiKey) {
            return true;
        }
        return false;
    };

    const healthUrlFromChatUrl = (chatUrl) => {
        try {
            const parsed = new URL(chatUrl, window.location.origin);
            if (parsed.pathname.endsWith('/chat')) {
                parsed.pathname = parsed.pathname.replace(/\/chat$/, '/health');
            } else {
                parsed.pathname = '/api/health';
            }
            return parsed.toString();
        } catch (error) {
            return '/api/health';
        }
    };

    const checkBackendHealth = async () => {
        if (!aiConfig.backendUrl) {
            backendHealthOk = false;
            return false;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const healthUrl = healthUrlFromChatUrl(aiConfig.backendUrl);
            const response = await fetch(healthUrl, {
                method: 'GET',
                signal: controller.signal
            });
            backendHealthOk = response.ok;
            return backendHealthOk;
        } catch (error) {
            backendHealthOk = false;
            return false;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const setChatModeLabel = (modeText) => {
        if (chatModeLabel) {
            chatModeLabel.textContent = modeText;
        }
    };

    const getOpenAiReply = async (question) => {
        const model = aiConfig.model || 'gpt-4o-mini';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${aiConfig.apiKey}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.5,
                messages: [
                    {
                        role: 'system',
                        content: `You are Ask Jacky Bot for Jacky Mpoka's portfolio. Use this context: ${JSON.stringify(portfolioContext)}. Keep answers concise, helpful, and professional.`
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI request failed');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || 'Sorry, no response returned.';
    };

    const getGeminiReply = async (question) => {
        const model = aiConfig.model || 'gemini-1.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(aiConfig.apiKey)}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `You are Ask Jacky Bot for Jacky Mpoka's portfolio. Use this context: ${JSON.stringify(portfolioContext)}. Question: ${question}`
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Gemini request failed');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sorry, no response returned.';
    };

    const getBackendReply = async (question) => {
        const response = await fetch(aiConfig.backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                context: portfolioContext
            })
        });

        if (!response.ok) {
            throw new Error('Backend AI request failed');
        }

        const data = await response.json();
        return data.answer || 'Sorry, no response returned.';
    };

    const getDynamicReply = async (question) => {
        if (aiConfig.backendUrl) {
            return getBackendReply(question);
        }
        if (aiConfig.provider === 'openai' && aiConfig.apiKey) {
            return getOpenAiReply(question);
        }
        if (aiConfig.provider === 'gemini' && aiConfig.apiKey) {
            return getGeminiReply(question);
        }
        throw new Error('No AI provider configured');
    };

    const openChat = () => {
        chatPanel.classList.add('open');
        chatPanel.setAttribute('aria-hidden', 'false');
        if (chatMessages.children.length === 0) {
            appendMessage('Hi, I am Ask Jacky Bot. Ask me about skills, projects, career goals, availability, or how to download the CV.', 'bot');
        }
        chatInput.focus();
    };

    const closeChat = () => {
        chatPanel.classList.remove('open');
        chatPanel.setAttribute('aria-hidden', 'true');
    };

    chatToggle.addEventListener('click', openChat);
    chatClose.addEventListener('click', closeChat);

    if (aiConfig.backendUrl) {
        setChatModeLabel('Check...');
        checkBackendHealth().then((ok) => {
            setChatModeLabel(ok ? 'AI' : 'Local');
        });
    } else {
        setChatModeLabel(hasDynamicAi() ? 'AI' : 'Local');
    }

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = chatInput.value.trim();
        if (!question) {
            return;
        }

        appendMessage(question, 'user');
        appendMessage('Typing...', 'bot pending');
        chatInput.value = '';

        try {
            const response = hasDynamicAi()
                ? await getDynamicReply(question)
                : localBotReply(question);

            const pending = chatMessages.querySelector('.chatbot-message.pending');
            if (pending) {
                pending.remove();
            }
            appendMessage(response, 'bot');
        } catch (error) {
            const pending = chatMessages.querySelector('.chatbot-message.pending');
            if (pending) {
                pending.remove();
            }
            appendMessage('AI is currently unavailable. I switched to local answers. Ask me again.', 'bot');
            appendMessage(localBotReply(question), 'bot');
        }
    });

});