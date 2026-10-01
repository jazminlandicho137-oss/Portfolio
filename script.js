document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const navigationLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Pointer-reactive ambient background */
if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let pointerFrame = 0;
    let latestPointerEvent = null;

    const paintPointerGlow = () => {
        pointerFrame = 0;
        if (!latestPointerEvent) return;

        const horizontalOffset = (latestPointerEvent.clientX / window.innerWidth - 0.5) * 90;
        const verticalOffset = (latestPointerEvent.clientY / window.innerHeight - 0.5) * 70;
        document.documentElement.style.setProperty("--pointer-x", `${horizontalOffset}px`);
        document.documentElement.style.setProperty("--pointer-y", `${verticalOffset}px`);
    };

    window.addEventListener("pointermove", (event) => {
        latestPointerEvent = event;
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintPointerGlow);
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", () => {
        latestPointerEvent = null;
        document.documentElement.style.setProperty("--pointer-x", "0px");
        document.documentElement.style.setProperty("--pointer-y", "0px");
    });
}

/* Mobile navigation */
function setMenuState(isOpen) {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
}

function closeMenu() {
    setMenuState(false);
}

menuToggle?.addEventListener("click", () => {
    setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
    if (window.innerWidth > 880) closeMenu();
});

/* Light and dark mode */
function getThemeLabel(theme) {
    return theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

function setTheme(theme, shouldSave = true) {
    document.documentElement.dataset.theme = theme;
    themeToggle?.setAttribute("aria-label", getThemeLabel(theme));
    themeMeta?.setAttribute("content", theme === "dark" ? "#130d19" : "#7b3fa3");

    if (shouldSave) {
        try {
            localStorage.setItem("jfl-theme", theme);
        } catch (_) {
            // The selected theme still works when storage is unavailable.
        }
    }
}

setTheme(document.documentElement.dataset.theme || "light", false);

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
});

/* Header and active navigation state */
function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const observedSections = ["home", "skills", "projects", "about", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navigationLinks.forEach((link) => {
                const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
                link.classList.toggle("is-active", isCurrent);

                if (isCurrent) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    }, {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
    });

    observedSections.forEach((section) => sectionObserver.observe(section));
}

/* Gentle reveal animation */
const revealElements = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach((element) => revealObserver.observe(element));
}

/* Fayri chatbot */
const chatPanel = document.querySelector("[data-chatbot]");
const chatOpenButtons = document.querySelectorAll("[data-chat-open]");
const chatCloseButton = document.querySelector("[data-chat-close]");
const chatForm = document.querySelector("[data-chat-form]");
const chatInput = document.querySelector("[data-chat-input]");
const chatMessages = document.querySelector("[data-chat-messages]");
const chatPrompts = document.querySelectorAll("[data-question]");

const fayriResponses = [
    {
        keywords: ["what are your strongest skills", "strongest skills", "what are you good at", "best skills"],
        answer: "My strongest applied skills are PHP and MySQL for web applications, JavaScript, HTML, and CSS for interfaces, and Supabase for connected records. I used them in the Student Early Warning System, HR System, and Student Information System."
    },
    {
        keywords: ["see jazmin's projects", "see my projects", "what have you built", "show me projects", "projects"],
        answer: "I built three projects:\n\n1. Student Early Warning System - PHP/MySQL risk scoring from attendance and grades.\n2. HR System - PHP/MySQL employee, payroll, loan, and report administration.\n3. Student Information System - JavaScript and Supabase student records.",
        action: { label: "View projects", href: "#projects" }
    },
    {
        keywords: ["download resume", "download my resume", "resume", "cv"],
        answer: "You can download a one-page résumé with my project, education, activity, and leadership background.",
        action: { label: "Download PDF", href: "assets/Jazmin-Landicho-Resume.pdf", download: true }
    },
    {
        keywords: ["what leadership experiences do you have", "leadership experiences", "leadership experience"],
        answer: "I currently serve as Vice President of Internal Affairs in the Computing Development and Engineering Society at LCC. I have also served as President and Vice President of Academics Club, SPG Vice President and Public Information Officer, Class Vice President, and Class Secretary."
    },
    {
        keywords: ["what are some of your experience in leadership", "some of your experience in leadership", "some experience in leadership", "leadership contribution"],
        answer: "In the i-Leap Program, I worked with a team on a business operations simulation and earned recognition for Business Operations Simulation Champion, Best Booth Presentation and Prototype, and the Above and Beyond Award.\n\nThese experiences reflect teamwork, planning, presentation, initiative, and follow-through."
    },
    {
        keywords: ["how can i contact you", "how do i contact you", "contact you", "email you", "reach you"],
        answer: "You can email me at jazminlandicho137@gmail.com. My LinkedIn and GitHub profiles are also available in the Contact section, along with a downloadable résumé."
    },
    {
        keywords: ["sql", "mysql", "database", "supabase"],
        answer: "I use SQL through MySQL for student and employee records, including prepared statements, inserts, updates, and ordered queries. I also use Supabase to connect a browser-based student directory to cloud data."
    }
];

const fallbackResponse = {
    answer: "I can answer questions about Jazmin’s specific skills, projects, résumé, leadership experience, and contact details. Try “Strongest skills,” “See projects,” “Download résumé,” or “Contact.”"
};

function getFayriAnswer(question) {
    const normalizedQuestion = question.toLowerCase().replace(/[’']/g, "");

    return fayriResponses.find((item) => item.keywords.some((keyword) => normalizedQuestion.includes(keyword))) || fallbackResponse;
}

function scrollChatToBottom() {
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(message, sender, action) {
    if (!chatMessages) return;

    const messageWrapper = document.createElement("div");
    messageWrapper.className = `message ${sender}-message`;

    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "user" ? "You" : "F";

    const content = document.createElement("div");
    const text = document.createElement("p");
    const time = document.createElement("time");

    text.textContent = message;
    time.dateTime = new Date().toISOString();
    time.textContent = new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date());

    content.append(text, time);

    if (sender === "bot" && action) {
        const actionLink = document.createElement("a");
        actionLink.className = "chat-action";
        actionLink.href = action.href;
        actionLink.textContent = `${action.label} →`;

        if (action.download) {
            actionLink.download = "Jazmin-Landicho-Resume.pdf";
        } else if (!action.href.startsWith("#")) {
            actionLink.target = "_blank";
            actionLink.rel = "noopener";
        } else {
            actionLink.addEventListener("click", () => setChatState(false));
        }

        content.append(actionLink);
    }

    messageWrapper.append(avatar, content);
    chatMessages.append(messageWrapper);
    scrollChatToBottom();
}

function showTypingIndicator() {
    if (!chatMessages) return null;

    const typingMessage = document.createElement("div");
    typingMessage.className = "message bot-message typing-message";

    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.textContent = "F";

    const dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.innerHTML = "<i></i><i></i><i></i>";

    typingMessage.append(avatar, dots);
    chatMessages.append(typingMessage);
    scrollChatToBottom();
    return typingMessage;
}

function submitQuestion(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    addMessage(cleanQuestion, "user");
    const typingMessage = showTypingIndicator();

    window.setTimeout(() => {
        typingMessage?.remove();
        const response = getFayriAnswer(cleanQuestion);
        addMessage(response.answer, "bot", response.action);
    }, reducedMotion ? 0 : 450);
}

function setChatState(isOpen) {
    if (!chatPanel) return;

    chatPanel.classList.toggle("is-open", isOpen);
    chatPanel.setAttribute("aria-hidden", String(!isOpen));
    chatOpenButtons.forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));
    document.body.classList.toggle("chat-open", isOpen);

    if (isOpen) {
        closeMenu();
        window.setTimeout(scrollChatToBottom, 0);
        if (window.innerWidth > 650) window.setTimeout(() => chatInput?.focus(), 180);
    }
}

chatOpenButtons.forEach((button) => {
    button.addEventListener("click", () => setChatState(true));
});

chatCloseButton?.addEventListener("click", () => {
    setChatState(false);
    chatOpenButtons[0]?.focus();
});

chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!chatInput) return;

    submitQuestion(chatInput.value);
    chatInput.value = "";
    chatInput.focus();
});

chatPrompts.forEach((button) => {
    button.addEventListener("click", () => submitQuestion(button.dataset.question || ""));
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (chatPanel?.classList.contains("is-open")) {
        setChatState(false);
        chatOpenButtons[0]?.focus();
    } else if (navigation?.classList.contains("is-open")) {
        closeMenu();
        menuToggle?.focus();
    }
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();