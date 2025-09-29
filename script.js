(() => {
'use strict';

const THEMES = {
  green: {
    primary: '#10b981',
    primaryRgb: '16, 185, 129',
    accent: '#34d399',
    name: 'green'
  },
  amber: {
    primary: '#f59e0b',
    primaryRgb: '245, 158, 11',
    accent: '#fbbf24',
    name: 'amber'
  },
  blue: {
    primary: '#3b82f6',
    primaryRgb: '59, 130, 246',
    accent: '#60a5fa',
    name: 'blue'
  },
  purple: {
    primary: '#8b5cf6',
    primaryRgb: '139, 92, 246',
    accent: '#a78bfa',
    name: 'purple'
  }
};

const THEME_ORDER = ['green', 'amber', 'blue', 'purple'];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Extract data from HTML
function extractUserData() {
  const data = {
    name: '',
    title: '',
    skills: [],
    projects: [],
    contact: {},
    bio: ''
  };

  // Extract name and title from header
  const nameEl = $('header .text-xl.font-bold');
  const titleEl = $('header .text-xs.text-gray-400');
  if (nameEl) data.name = nameEl.textContent.trim();
  if (titleEl) data.title = titleEl.textContent.trim();

  // Extract skills from technical expertise section
  const skillCards = $$('section .grid > div:has(h3)');
  skillCards.forEach(card => {
    const nameEl = card.querySelector('h3');
    const levelEl = card.querySelector('.text-xs.px-2.py-1');
    const percentEl = card.querySelector('[style*="width"]');
    
    if (nameEl) {
      const skill = {
        name: nameEl.textContent.trim(),
        level: levelEl ? levelEl.textContent.trim().toLowerCase() : 'intermediate',
        percentage: 50
      };
      
      if (percentEl) {
        const widthMatch = percentEl.style.width.match(/(\d+)%/);
        if (widthMatch) skill.percentage = parseInt(widthMatch[1]);
      }
      
      data.skills.push(skill);
    }
  });

  // Extract projects from cards
  const projectCards = $$('#projects .grid > div');
  projectCards.forEach(card => {
    const nameEl = card.querySelector('h3');
    const descEl = card.querySelector('p.text-gray-400');
    
    if (nameEl) {
      data.projects.push({
        name: nameEl.textContent.trim(),
        description: descEl ? descEl.textContent.trim() : '',
        featured: true
      });
    }
  });

  // Extract contact info
  const emailLink = $('a[href^="mailto:"]');
  const linkedinLink = $('a[href*="linkedin"]');
  
  if (emailLink) {
    data.contact.email = emailLink.href.replace('mailto:', '');
  }
  if (linkedinLink) {
    data.contact.linkedin = linkedinLink.href;
  }

  // Extract bio from terminal or create default
  data.bio = `Seasoned ${data.title.toLowerCase()}. Building reliable software and scalable systems.`;

  return data;
}

// Dynamic data
let userData = {};
let currentTheme = 'green';

function applyThemeColors(theme) {
  const themeConfig = THEMES[theme];
  if (!themeConfig) return;

  const root = document.documentElement;
  
  // Set CSS custom properties
  root.style.setProperty('--theme-primary', themeConfig.primary);
  root.style.setProperty('--theme-primary-rgb', themeConfig.primaryRgb);
  root.style.setProperty('--theme-accent', themeConfig.accent);
  
  // Update all emerald-400 classes to use the new theme color
  const elementsToUpdate = [
    // Terminal border and elements
    '#terminal .shadow-2xl',
    '.border-emerald-400',
    '.text-emerald-400',
    '.bg-emerald-400',
    '.hover\\:text-emerald-400',
    '.hover\\:border-emerald-400'
  ];

  // Apply theme to terminal container shadow
  const terminalContainer = $('#terminal .shadow-2xl');
  if (terminalContainer) {
    terminalContainer.style.boxShadow = `0 0 30px rgba(${themeConfig.primaryRgb}, 0.3)`;
  }

  // Update all elements with theme-dependent classes
  const themeElements = $$('.border-emerald-400, .text-emerald-400, .bg-emerald-400');
  themeElements.forEach(el => {
    // Update border color
    if (el.classList.contains('border-emerald-400')) {
      el.style.borderColor = themeConfig.primary;
    }
    // Update text color
    if (el.classList.contains('text-emerald-400')) {
      el.style.color = themeConfig.primary;
    }
    // Update background color
    if (el.classList.contains('bg-emerald-400')) {
      el.style.backgroundColor = themeConfig.primary;
    }
  });

  // Update progress bars
  const progressBars = $$('.bg-emerald-400');
  progressBars.forEach(bar => {
    if (bar.parentElement && bar.parentElement.classList.contains('bg-black/50')) {
      bar.style.backgroundColor = themeConfig.primary;
    }
  });

  // Update selection colors
  const style = document.createElement('style');
  style.textContent = `
    ::selection {
      background-color: rgba(${themeConfig.primaryRgb}, 0.2);
      color: ${themeConfig.accent};
    }
    
    .hover\\:text-emerald-400:hover {
      color: ${themeConfig.primary} !important;
    }
    
    .hover\\:border-emerald-400:hover {
      border-color: ${themeConfig.primary} !important;
    }
    
    .focus\\:border-emerald-400:focus {
      border-color: ${themeConfig.primary} !important;
    }
  `;
  
  // Remove old theme style if exists
  const oldStyle = document.querySelector('#theme-style');
  if (oldStyle) oldStyle.remove();
  
  style.id = 'theme-style';
  document.head.appendChild(style);
}

function setTheme(theme) {
  if (!THEMES[theme]) return;
  
  currentTheme = theme;
  document.body.dataset.theme = theme;
  
  applyThemeColors(theme);
  updateThemeLabels(theme);
}

function cycleTheme() {
  const currentIndex = THEME_ORDER.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
  const nextTheme = THEME_ORDER[nextIndex];
  setTheme(nextTheme);
}

function toggleKbd() {
  const k = document.getElementById('kbd');
  if (k) k.classList.toggle('hidden');
}

function toggleCRT() {
  const overlay = document.querySelector('[data-crt-overlay]');
  if (overlay) {
    overlay.classList.toggle('hidden');
  }
}

function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function attachNavScroll() {
  $$('header nav button').forEach(btn => {
    const label = (btn.textContent || '').trim().toLowerCase();
    if (label === 'terminal') btn.addEventListener('click', () => smoothScrollTo('#terminal'));
    if (label === 'projects') btn.addEventListener('click', () => smoothScrollTo('#projects'));
    if (label === 'contact') btn.addEventListener('click', () => smoothScrollTo('#contact'));
  });
}

function attachHeaderActions() {
  const themeBtn = $('header [aria-label="Cycle theme"]');
  const crtBtn = $('header [aria-label="Toggle CRT overlay"]');
  const kbdBtn = $('header [aria-label="Show keyboard shortcuts"]');
  
  if (themeBtn) themeBtn.addEventListener('click', cycleTheme);
  if (crtBtn) crtBtn.addEventListener('click', toggleCRT);
  if (kbdBtn) kbdBtn.addEventListener('click', toggleKbd);
}

function attachViewToggles() {
  const viewBar = $('#projects .mb-8 .flex.items-center.gap-6');
  if (!viewBar) return;

  const cardsBtn = Array.from(viewBar.querySelectorAll('button')).find(b => /cards/i.test(b.textContent || ''));
  const termBtn = Array.from(viewBar.querySelectorAll('button')).find(b => /terminal/i.test(b.textContent || ''));

  function setActive(btn, active) {
    if (!btn) return;
    if (active) {
      btn.classList.add('border-emerald-400', 'text-emerald-400', 'bg-black/20');
      btn.classList.remove('border-gray-700', 'text-gray-400');
      btn.style.borderColor = THEMES[currentTheme].primary;
      btn.style.color = THEMES[currentTheme].primary;
    } else {
      btn.classList.remove('border-emerald-400', 'text-emerald-400', 'bg-black/20');
      btn.classList.add('border-gray-700', 'text-gray-400');
      btn.style.borderColor = '';
      btn.style.color = '';
    }
  }

  if (cardsBtn && termBtn) {
    setActive(cardsBtn, true);
    setActive(termBtn, false);

    cardsBtn.addEventListener('click', () => {
      setActive(cardsBtn, true);
      setActive(termBtn, false);
      showCardsView();
    });

    termBtn.addEventListener('click', () => {
      setActive(cardsBtn, false);
      setActive(termBtn, true);
      showTerminalView();
    });
  }
}

function showCardsView() {
  const projectsSection = $('#projects');
  if (!projectsSection) return;

  // Hide terminal view if exists
  const terminalView = projectsSection.querySelector('[data-ls-view]');
  if (terminalView) terminalView.style.display = 'none';

  // Show cards view
  let cardsView = projectsSection.querySelector('.grid.lg\\:grid-cols-2');
  if (!cardsView) {
    cardsView = createCardsView();
    const insertPoint = projectsSection.querySelector('.mt-12') || projectsSection.lastElementChild;
    projectsSection.insertBefore(cardsView, insertPoint);
  } else {
    cardsView.style.display = '';
  }
}

function showTerminalView() {
  const projectsSection = $('#projects');
  if (!projectsSection) return;

  // Hide cards view
  const cardsView = projectsSection.querySelector('.grid.lg\\:grid-cols-2');
  if (cardsView) cardsView.style.display = 'none';

  // Show terminal view
  let terminalView = projectsSection.querySelector('[data-ls-view]');
  if (!terminalView) {
    terminalView = createTerminalView();
    const insertPoint = projectsSection.querySelector('.mt-12') || projectsSection.lastElementChild;
    projectsSection.insertBefore(terminalView, insertPoint);
  } else {
    terminalView.style.display = '';
  }
}

function createCardsView() {
  const grid = document.createElement('div');
  grid.className = 'grid lg:grid-cols-2 gap-8';
  
  userData.projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'bg-gradient-to-br from-[#0c0f0c] to-[#0a0d0a] rounded-xl border border-gray-800 overflow-hidden hover:border-emerald-400 transition-all duration-300 hover:shadow-xl group';
    
    card.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-gray-100 group-hover:text-white transition-colors">${escapeHtml(project.name)}</h3>
          <div class="flex gap-3"></div>
        </div>
        <p class="text-gray-400 mb-4 leading-relaxed">${escapeHtml(project.description)}</p>
      </div>
    `;
    
    // Apply theme to hover border
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = THEMES[currentTheme].primary;
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
    });
    
    grid.appendChild(card);
  });
  
  return grid;
}

function createTerminalView() {
  const terminal = document.createElement('div');
  terminal.setAttribute('data-ls-view', 'true');
  terminal.className = 'mt-12';
  
  terminal.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-branch w-4 h-4 text-emerald-400">
        <line x1="6" x2="6" y1="3" y2="15"></line>
        <circle cx="18" cy="6" r="3"></circle>
        <circle cx="6" cy="18" r="3"></circle>
        <path d="M18 9a9 9 0 0 1-9 9"></path>
      </svg>
      <span class="text-sm text-gray-500">git log --oneline --graph --decorate -n ${userData.projects.length}</span>
    </div>
    <div class="bg-[#0c0f0c] border border-gray-800 rounded-xl p-6">
      ${createGitLogEntries()}
    </div>
  `;
  
  // Apply current theme colors to new elements
  const themeElements = terminal.querySelectorAll('.text-emerald-400');
  themeElements.forEach(el => {
    el.style.color = THEMES[currentTheme].primary;
  });
  
  return terminal;
}

function createGitLogEntries() {
  return userData.projects.map((project, index) => {
    const hash = generateGitHash();
    const isFirst = index === 0;
    const connector = isFirst ? '●' : '│';
    const connectorClass = isFirst ? 'text-emerald-400' : 'text-gray-600';
    
    return `
      <div class="flex items-start gap-3 py-1 group">
        <span class="${connectorClass} mt-1">${connector}</span>
        <span class="text-emerald-400 font-mono text-sm">${hash}</span>
        <div class="flex-1 min-w-0">
          <span class="text-gray-200 font-semibold">${escapeHtml(project.name)}</span>
          <span class="text-gray-500 ml-2 text-sm">— ${escapeHtml(project.description)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function generateGitHash() {
  return Math.random().toString(16).substr(2, 7);
}

function attachTabToggles() {
  const bars = $$('#projects .mb-8 .flex.items-center.gap-6');
  const tabsBar = bars[1];
  if (!tabsBar) return;

  const featBtn = Array.from(tabsBar.querySelectorAll('button')).find(b => /featured/i.test(b.textContent || ''));
  const allBtn = Array.from(tabsBar.querySelectorAll('button')).find(b => /^all/i.test(b.textContent || ''));

  function activate(activeBtn, inactiveBtn) {
    if (activeBtn) {
      activeBtn.classList.add('border-emerald-400');
      activeBtn.classList.remove('border-transparent', 'text-gray-500');
      activeBtn.style.borderColor = THEMES[currentTheme].primary;
    }
    if (inactiveBtn) {
      inactiveBtn.classList.remove('border-emerald-400');
      inactiveBtn.classList.add('border-transparent', 'text-gray-500');
      inactiveBtn.style.borderColor = '';
    }
  }

  // Update button text with counts
  if (featBtn) {
    const featuredCount = userData.projects.filter(p => p.featured).length;
    featBtn.textContent = `featured (${featuredCount})`;
  }
  if (allBtn) {
    allBtn.textContent = `all (${userData.projects.length})`;
  }

  if (featBtn && allBtn) {
    activate(featBtn, allBtn);
    featBtn.addEventListener('click', () => activate(featBtn, allBtn));
    allBtn.addEventListener('click', () => activate(allBtn, featBtn));
  }
}

function attachKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (['INPUT', 'TEXTAREA'].includes(tag)) return;

    switch (e.key) {
      case '1': smoothScrollTo('#terminal'); break;
      case '2': smoothScrollTo('#projects'); break;
      case '3': smoothScrollTo('#contact'); break;
      case 'g': if (!e.shiftKey) window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'G': window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); break;
      case 'j': window.scrollBy({ top: 80, behavior: 'smooth' }); break;
      case 'k': window.scrollBy({ top: -80, behavior: 'smooth' }); break;
      case 't': cycleTheme(); break;
      case 'c': toggleCRT(); break;
      case '?': toggleKbd(); break;
      case 'Escape': {
        const k = document.getElementById('kbd');
        if (k && !k.classList.contains('hidden')) k.classList.add('hidden');
        break;
      }
    }
  });
}

function getTerminalName() {
  return userData.name.toLowerCase().replace(/\s+/g, '-') || 'user';
}

function updateThemeLabels(theme) {
  const header = $('#terminal .bg-gradient-to-r .text-sm.text-gray-400');
  if (header) {
    header.textContent = `${getTerminalName()} — zsh — ${theme}`;
  }

  const footerTheme = $('footer span:has(.text-emerald-400)');
  if (footerTheme) {
    const themeSpan = footerTheme.querySelector('.text-emerald-400');
    if (themeSpan) {
      themeSpan.textContent = theme;
      themeSpan.style.color = THEMES[currentTheme].primary;
    }
  }
}

function initTerminal() {
  const termSection = document.getElementById('terminal');
  if (!termSection) return;

  const history = termSection.querySelector('.space-y-1');
  const input = termSection.querySelector('.space-y-1 input[type="text"]');
  const scroller = termSection.querySelector('.overflow-y-auto');

  if (!history || !input || !scroller) return;

  const inputRow = input.closest('div');
  if (!inputRow) return;
  inputRow.classList.add('term-input-row');

  const name = getTerminalName();

  const tux = String.raw`
       .--.
      |o_o |
      |:_/ |
     //   \\ \\
    (|     | )
   /'\\_   _/\` \\
   \\___)=(___/
`;

  function insertBeforeInput(node) {
    history.insertBefore(node, inputRow);
    scroller.scrollTop = scroller.scrollHeight;
  }

  function out(line, pre = false) {
    const el = document.createElement(pre ? 'pre' : 'div');
    el.className = pre
      ? 'text-emerald-400 text-xs leading-tight my-2 whitespace-pre-wrap'
      : 'text-gray-300 ml-5 whitespace-pre-wrap';
    el.textContent = line;
    
    if (pre && el.classList.contains('text-emerald-400')) {
      el.style.color = THEMES[currentTheme].primary;
    }
    
    insertBeforeInput(el);
  }

  function echo(cmd) {
    const row = document.createElement('div');
    row.className = 'text-emerald-400 flex items-center gap-2';
    row.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-chevron-right w-3 h-3" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6"></path>
      </svg>
      $ ${escapeHtml(cmd)}
    `;
    row.style.color = THEMES[currentTheme].primary;
    insertBeforeInput(row);
  }

  function clearHistory() {
    const nodes = Array.from(history.children);
    nodes.forEach(n => { if (n !== inputRow) history.removeChild(n); });
    scroller.scrollTop = scroller.scrollHeight;
  }

  function run(cmd) {
    const c = cmd.trim().toLowerCase();
    if (!c) return;

    if (c === 'clear') { clearHistory(); return; }
    if (c === 'theme') { cycleTheme(); out('Theme cycled!'); out(''); return; }
    if (c === 'exit') { out('Connection closed.'); out(''); return; }

    const commands = {
      help: [
        'Available commands:',
        '  help       - show this help',
        '  whoami     - display user info',
        '  about      - show bio information',
        '  skills     - list technical skills',
        '  projects   - show project portfolio',
        '  contact    - display contact info',
        '  neofetch   - system information',
        '  theme      - cycle color themes',
        '  clear      - clear terminal',
        '  exit       - close terminal session',
        ''
      ],
      whoami: [userData.name || 'Unknown User'],
      about: [userData.bio, ''],
      skills: [
        'Technical Skills:',
        ...userData.skills.map(skill => `  ${skill.name.toLowerCase()} (${skill.level}) - ${skill.percentage}%`),
        ''
      ],
      projects: [
        'Projects:',
        ...userData.projects.map((project, i) => `  ${i + 1}. ${project.name} - ${project.description}`),
        ''
      ],
      contact: [
        'Contact Information:',
        `Email: ${userData.contact.email || 'Not provided'}`,
        `LinkedIn: ${userData.contact.linkedin || 'Not provided'}`,
        ''
      ],
      neofetch: [
        tux,
        `${name}@portfolio`,
        '──────────────────────────',
        'OS: Arch Linux x86_64',
        'Kernel: 6.8.9-zen',
        'Shell: zsh 5.9',
        `User: ${userData.name}`,
        `Title: ${userData.title}`,
        `Skills: ${userData.skills.length} languages/frameworks`,
        `Projects: ${userData.projects.length} repositories`,
        ''
      ]
    };

    const outLines = commands[c];
    if (outLines) {
      outLines.forEach(line => out(line, line === tux));
    } else {
      out(`Command not found: ${cmd}`);
      out('Type "help" for available commands.');
      out('');
    }
  }

  function focusInput() { 
    if (input) input.focus(); 
  }
  
  if (scroller) scroller.addEventListener('click', focusInput);
  setTimeout(focusInput, 0);

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        echo(val);
        setTimeout(() => { run(val); focusInput(); }, 120);
      }
    });
  }

  out(`Welcome to ${name}@portfolio`);
  out('Type "help" for available commands.');
  out('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Update skill progress bars dynamically
function updateSkillBars() {
  const skillCards = $$('section .grid > div:has(h3)');
  skillCards.forEach((card, index) => {
    if (userData.skills[index]) {
      const skill = userData.skills[index];
      const progressBar = card.querySelector('[style*="width"]');
      if (progressBar) {
        progressBar.style.width = `${skill.percentage}%`;
        progressBar.style.backgroundColor = THEMES[currentTheme].primary;
      }
    }
  });
}

// Update contact form to be dynamic
function updateContactForm() {
  const form = $('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Here you would normally send the data to a server
      console.log('Form submitted:', data);
      
      // Show success message
      const button = form.querySelector('button[type="submit"]');
      const originalText = button.innerHTML;
      button.innerHTML = '✓ Message Sent!';
      button.disabled = true;
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        form.reset();
      }, 3000);
    });
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  // Extract user data from HTML
  userData = extractUserData();
  
  // Set initial theme (this will apply colors)
  setTheme('green');

  // Setup CRT overlay
  const overlay = document.querySelector('div[aria-hidden="true"].pointer-events-none.fixed.inset-0');
  if (overlay) overlay.setAttribute('data-crt-overlay', 'true');

  // Attach all event listeners
  attachNavScroll();
  attachHeaderActions();
  attachViewToggles();
  attachTabToggles();
  attachKeyboardShortcuts();
  initTerminal();
  updateSkillBars();
  updateContactForm();

  // Make data globally available for debugging
  window.portfolioData = userData;
  
  console.log('Portfolio initialized with data:', userData);
  console.log('Current theme:', currentTheme);
});

// Expose functions for potential external use
window.portfolioAPI = {
  setTheme,
  cycleTheme,
  updateUserData: (newData) => {
    userData = { ...userData, ...newData };
    console.log('User data updated:', userData);
  },
  getUserData: () => userData,
  refreshSkills: updateSkillBars,
  getCurrentTheme: () => currentTheme,
  getAvailableThemes: () => Object.keys(THEMES)
};

})();