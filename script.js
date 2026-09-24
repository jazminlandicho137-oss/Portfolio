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

/* Mobile dashboard navigation */
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

navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

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

const observedSections = ["home", "about", "projects", "contact"]
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
        keywords: ["what are your strongest skills", "strongest skills", "what are you good at"],
        answer: "My strongest skills are critical thinking, breaking problems into clear steps, logical programming, data management, and collaboration. I strengthen these through class, math programs, leadership roles, documentation, and hands-on projects."
    },
    {
        keywords: ["what leadership experiences do you have", "leadership experiences", "leadership experience"],
        answer: "I currently serve as Vice President of Internal Affairs in the Computing Development and Engineering Society at LCC. I have also served as President and Vice President of Academics Club, SPG Vice President and Public Information Officer, Class Vice President, and Class Secretary."
    },
    {
        keywords: ["what are some of your experience in leadership", "some of your experience in leadership", "some experience in leadership", "leadership contribution"],
        answer: "In the i-Leap Program, I helped a team take part in a business operations simulation and earned recognition for the champion business simulation, best booth presentation, best prototype, outstanding presenter, outstanding performance, logistics excellence, overall facility layout, and the Above and Beyond Award.\n\nIn my organizations, I’ve also coordinated internal activities, represented my team, shared information clearly, and supported fellow students."
    },
    {
        keywords: ["how can i contact you", "how do i contact you", "contact you", "email you", "reach you"],
        answer: "You can email me at jazminlandicho137@gmail.com. You can also find my LinkedIn, GitHub, Instagram, Facebook, and contact-number links in the Contact section once those placeholder URLs are replaced."
    }
];

function getFayriAnswer(question) {
    const normalizedQuestion = question.toLowerCase().replace(/[’']/g, "");

    return fayriResponses.find((item) => {
        return item.keywords.some((keyword) => normalizedQuestion.includes(keyword));
    })?.answer || "I can answer questions about Jazmin’s strongest skills, leadership experience, and contact details. Try one of the suggested questions or choose “Strongest skills,” “Leadership,” or “Contact.”";
}

function scrollChatToBottom() {
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(message, sender) {
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
        addMessage(getFayriAnswer(cleanQuestion), "bot");
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

/* Footer year */
const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
