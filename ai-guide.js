/**
 * ai-guide.js — pseudosec. AI Guide
 * Prompt library: situation-based categories, tool filter
 */

var TOOLS = [
  { id: 'all',     label: 'All tools' },
  { id: 'claude',  label: 'Claude' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'copilot', label: 'Copilot' },
  { id: 'gemini',  label: 'Gemini' },
  { id: 'canva',   label: 'Canva' },
  { id: 'zoom',    label: 'Zoom' },
];

var TOOL_INFO = {
  claude:  { safe: '🟢 No training on your data by default on claude.ai. Enterprise plan for full isolation.' },
  chatgpt: { safe: '🟡 Free tier may train on your conversations — check settings. Team/Enterprise plans are isolated.' },
  copilot: { safe: '🟢 Safe for org-licensed Microsoft 365 users. Data stays within your tenant.' },
  gemini:  { safe: '🟡 Safe on Workspace Business+ plans. Personal Google accounts may use data for improvement.' },
  canva:   { safe: '🟡 Safe for public-facing design work. Do not upload images or text with client or personal data.' },
  zoom:    { safe: '🟢 Safe when AI Companion is enabled and configured by your org admin.' },
};

var CATS = [
  { id: 'all',          label: 'All' },
  { id: 'staying-safe', label: 'Staying Safe' },
  { id: 'work',         label: 'Everyday Work' },
  { id: 'comms',        label: 'Writing & Comms' },
  { id: 'learn',        label: 'Understanding Something' },
  { id: 'life',         label: 'Your Day-to-Day' },
];

var PROMPTS = [
  // ── STAYING SAFE ──
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Is this email a scam?',
    prompt: 'I received this email and I\'m not sure if it\'s legitimate. Can you analyse it for signs of phishing or fraud? Look at the sender, the links it mentions, the urgency, the language, and the request it\'s making. Tell me what\'s suspicious and what I should do:\n\n[Paste the email text here — do not include your personal details or passwords]'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Is this text message a scam?',
    prompt: 'I received this text message and I don\'t know if it\'s real. Can you analyse it for signs of a scam? Explain what the red flags are, what the scammer might be trying to do, and what I should do next:\n\n[Paste the message text here]'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Explain phishing to me simply',
    prompt: 'Explain what phishing is to someone who isn\'t technical at all. Use a real-world analogy. What does a phishing email or message look like? What are the most common tricks? And what should I do if I think I\'ve received one? Keep it under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'I think I\'ve been hacked — what do I do?',
    prompt: 'I think my account [or: my computer] may have been compromised. I\'m not very technical — can you give me a simple, step-by-step guide on what I should do right now to limit the damage? Tell me what to check, who to contact, and what to change. Be clear and don\'t assume I know much about IT.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Someone called claiming to be from Microsoft/ATO',
    prompt: 'I just received a phone call from someone claiming to be from [Microsoft / the Australian Taxation Office / my bank / NBN]. They said [describe what they said]. Is this likely to be a scam? What should I do, and what should I NOT do? Explain it simply.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'What makes a strong password?',
    prompt: 'Explain what makes a strong, secure password — in plain English for someone who isn\'t technical. What should I avoid? Should I use a password manager? Give me some practical, realistic advice I can actually follow. Keep it under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Explain multi-factor authentication simply',
    prompt: 'Explain what multi-factor authentication (MFA or 2FA) is, why it matters, and how to set it up — for someone who has never heard of it before. Use a simple analogy. What are my options and which is the most secure? Under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Is it safe to use public Wi-Fi?',
    prompt: 'I\'m at a café / airport / hotel and want to use the public Wi-Fi. Explain the risks to me in plain English — what can go wrong, who might be watching, and what I can do to stay safer? What should I definitely avoid doing on public Wi-Fi? Under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'How do I tell if a website is safe?',
    prompt: 'I\'m not sure whether a website I\'m on is legitimate or safe. Can you explain — in plain English for a non-technical person — the signs that a website is trustworthy versus suspicious? What should I look for in the URL, the design, and the content? Under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all',
    title: 'Draft a staff security awareness tip',
    prompt: 'Write a short, friendly security awareness tip for staff about [topic — e.g. spotting phishing emails, using strong passwords, safe use of USBs]. It will be shared in our team newsletter or intranet. Keep it under 100 words. Include one clear action people can take.'
  },

  // ── EVERYDAY WORK ──
  {
    cat: 'work', tools: 'all',
    title: 'Draft a professional follow-up email',
    prompt: 'Write a professional follow-up email to [name or role] about [topic]. Context: [one sentence of context]. Tone: polite but direct. Include a clear call to action. Keep it under 150 words.'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Decline a request politely',
    prompt: 'Write a polite, professional email declining [describe the request] from [sender]. Reason for declining: [brief reason]. Keep it brief and friendly. Leave the door open for future contact if appropriate.'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Respond to a complaint',
    prompt: 'Write a professional response to a complaint about [issue]. Acknowledge the concern without admitting fault. Explain what is being done to address it. Provide a clear next step. Tone: empathetic, solution-focused, and professional.'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Escalation email to management',
    prompt: 'Write a brief escalation email to [role] about [issue]. Include: what the issue is, why it matters, what has been tried already, and what decision or support is needed from them. Tone: urgent but calm and professional.'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Write a meeting agenda',
    prompt: 'Create a structured agenda for a [duration] meeting about [topic]. Attendees: [list roles or team]. Goal of the meeting: [one sentence]. Include time allocations for each agenda item.'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Turn rough notes into meeting minutes',
    prompt: 'Based on the following rough notes from a meeting, write clean, professional meeting minutes. Include: date, attendees, key decisions made, action items (with owners if noted), and next steps.\n\n[Paste your rough notes here]'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Project status update',
    prompt: 'Write a brief project status update for [project name] to share with [audience — e.g. leadership team, client]. Format: overall status (Red / Amber / Green), one paragraph summary, key accomplishments this period, current risks, and next steps.'
  },
  {
    cat: 'work', tools: 'all',
    title: 'Create a step-by-step checklist',
    prompt: 'Create a clear, step-by-step checklist for [process — e.g. onboarding a new staff member, setting up a new device, preparing for an audit]. Each step should be a single, actionable task. Make it easy to follow for someone unfamiliar with the process.'
  },
  {
    cat: 'work', tools: 'zoom',
    title: 'Summarise a meeting recording (Zoom)',
    prompt: 'After your Zoom meeting, open AI Companion from the meeting summary page and ask:\n\n"Summarise this meeting in dot points. List the key decisions made, any action items with who is responsible, and any unresolved questions. Keep it under one page."'
  },
  {
    cat: 'work', tools: 'copilot',
    title: 'Draft a document in Word (Copilot)',
    prompt: 'In Microsoft Word with Copilot, use the Copilot draft pane and enter:\n\n"Write a first draft of [document type — e.g. an IT policy, a project proposal, a staff handbook section] about [topic]. Audience: [describe]. Tone: [formal/friendly]. Length: approximately [X] pages."'
  },
  {
    cat: 'work', tools: 'copilot',
    title: 'Analyse data in Excel (Copilot)',
    prompt: 'In Microsoft Excel with Copilot, select your data and open Copilot, then ask:\n\n"Summarise the key trends in this data. What are the highest and lowest values? Are there any patterns I should be aware of? Format your response as a short summary with bullet points."\n\nReplace with your specific question about the data.'
  },

  // ── WRITING & COMMS ──
  {
    cat: 'comms', tools: 'all',
    title: 'Summarise a long document',
    prompt: 'Summarise the following document. Give me:\n1. A 3-bullet-point overview\n2. A one-paragraph summary suitable for sharing with non-technical staff\n3. Any key actions or decisions the reader needs to know about\n\n[Paste the document text here]'
  },
  {
    cat: 'comms', tools: 'all',
    title: 'Rewrite in plain English',
    prompt: 'Rewrite the following in plain English for someone with no technical or specialist background. Avoid jargon. Use short sentences. Keep it under 150 words:\n\n[Paste the text here]'
  },
  {
    cat: 'comms', tools: 'all',
    title: 'Proofread and improve my writing',
    prompt: 'Please proofread the following text. Fix any grammar, spelling, or punctuation errors. Then rewrite it to improve clarity and flow — but keep my meaning and tone. Show me both the corrected version and a note on what you changed:\n\n[Paste your text here]'
  },
  {
    cat: 'comms', tools: 'all',
    title: 'Write a staff announcement',
    prompt: 'Write a brief staff announcement about [topic — e.g. a system change, a new policy, an upcoming event]. Audience: all staff. Keep it under 150 words. Start with the key information, not background. Include one clear action if staff need to do something.'
  },
  {
    cat: 'comms', tools: 'all',
    title: 'Policy one-pager for staff',
    prompt: 'Write a one-page summary of the following policy for staff. Use short paragraphs and bullet points. Write in plain English — no jargon. Include a "What this means for you" section at the end with practical takeaways:\n\n[Paste the policy or key points here]'
  },
  {
    cat: 'comms', tools: 'all',
    title: 'Write a job advertisement',
    prompt: 'Write a job advertisement for a [job title] position at a [type of organisation] based in [location, e.g. Brisbane, Queensland]. Include: a brief role summary, key responsibilities (5–7 dot points), what we\'re looking for, and a short "about us" section. Tone: professional but welcoming. Avoid corporate jargon.'
  },
  {
    cat: 'comms', tools: 'all',
    title: 'Write a social media post',
    prompt: 'Write a [LinkedIn / Facebook / Instagram] post about [topic]. Tone: [professional/friendly/informative]. Target audience: [describe]. Length: [short/medium]. Include a call to action if relevant. No hashtag spam — one or two relevant hashtags at most.'
  },
  {
    cat: 'comms', tools: 'canva',
    title: 'Write a design brief for Canva (Canva)',
    prompt: 'In Canva, use Magic Write or the AI design assistant and describe your project:\n\n"I need to create a [type of design — e.g. social media post, flyer, presentation slide]. The topic is [topic]. The audience is [describe]. The tone should be [professional/bold/friendly/clean]. Key message: [one sentence]. Colours or brand style: [describe or say \'match our existing brand\']. Please suggest a layout and generate a first draft."'
  },

  // ── UNDERSTANDING SOMETHING ──
  {
    cat: 'learn', tools: 'all',
    title: 'Explain a concept to me simply',
    prompt: 'Explain [concept — e.g. ransomware, two-factor authentication, the cloud, a VPN] as if I\'m a complete beginner with no IT background. Use a real-world analogy I can relate to. Tell me why it matters to me. Keep it under 200 words.'
  },
  {
    cat: 'learn', tools: 'all',
    title: 'Decode a technical message',
    prompt: 'I received this technical message / alert / error and I don\'t understand it. Explain what it means in plain English. Tell me what might have caused it, whether it\'s serious, and what (if anything) I should do:\n\n[Paste the message or error here]'
  },
  {
    cat: 'learn', tools: 'all',
    title: 'Quiz me on a topic',
    prompt: 'Give me 5 multiple-choice questions to test my understanding of [topic]. After I answer each one, tell me whether I\'m right and explain why in one or two sentences. Start with the first question and wait for my answer before moving on.'
  },
  {
    cat: 'learn', tools: 'all',
    title: 'Create a learning plan',
    prompt: 'Create a simple 4-week learning plan for someone who wants to learn [skill or topic] starting from scratch. One realistic goal or task per week. Include free or low-cost resources where possible. I have about [X hours] per week to spend on this.'
  },
  {
    cat: 'learn', tools: 'all',
    title: 'Compare two things',
    prompt: 'Create a clear comparison of [thing A] versus [thing B] for someone who isn\'t technical. Use a table or structured format. Cover: what each one is, what it\'s used for, key differences, pros and cons, and which one is better in which situation.'
  },
  {
    cat: 'learn', tools: 'all',
    title: 'Explain a CVE to non-technical staff',
    prompt: 'Explain the following software vulnerability in plain English for non-technical staff. What is it? What does it affect? How serious is it? Do we need to do anything, and if so, what? Avoid technical jargon.\n\nCVE ID: [paste CVE ID]\nDescription: [paste the brief description]'
  },

  // ── YOUR DAY-TO-DAY ──
  {
    cat: 'life', tools: 'all',
    title: 'Help me prioritise my day',
    prompt: 'Here are my tasks for today. Help me prioritise them by urgency and importance. Tell me what to do first, what to schedule for later, and what could be delegated or dropped. Suggest a realistic order to work through them:\n\n[List your tasks here]'
  },
  {
    cat: 'life', tools: 'all',
    title: 'Prepare for a difficult conversation',
    prompt: 'I need to have a difficult conversation with [role/relationship — e.g. my manager, a colleague, a supplier] about [topic]. Help me prepare. What are the key points I should make? What might they say, and how should I respond? How do I keep it calm and constructive? Give me practical talking points.'
  },
  {
    cat: 'life', tools: 'all',
    title: 'Write a complaint to a business',
    prompt: 'Help me write a clear, firm complaint letter or email to [business name or type] about [issue]. I want to explain the problem clearly, state what outcome I want, and be professional without being a pushover. Keep it under 250 words.'
  },
  {
    cat: 'life', tools: 'all',
    title: 'Turn a rough idea into a plan',
    prompt: 'I have an idea but it\'s not fully formed yet. Help me turn it into a simple, practical plan. My idea: [describe in a few sentences]. Ask me any clarifying questions you need, then give me a step-by-step action plan with realistic timelines.'
  },
  {
    cat: 'life', tools: 'all',
    title: 'Write a performance self-assessment',
    prompt: 'Help me write a professional self-assessment for my performance review. I want to highlight my contributions, be honest about areas for growth, and set goals for the next period. Here are some notes on what I\'ve done and where I want to go:\n\n[Paste your notes here]\n\nTone: professional and confident, not boastful. Length: about 300–400 words.'
  },
  {
    cat: 'life', tools: 'all',
    title: 'Questions to ask at a job interview',
    prompt: 'I have an interview for a [job title] role at [type of organisation]. Help me come up with 5–8 smart, genuine questions to ask the interviewer. I want to understand the role, the team, and the culture — and come across as engaged and thoughtful. Not generic questions — questions that show I\'ve thought about this specific role.'
  },
  {
    cat: 'life', tools: 'all',
    title: 'Write an apology',
    prompt: 'Help me write a sincere apology to [person or role] for [situation]. I want to acknowledge what went wrong, take responsibility without making excuses, and focus on what I\'m doing to fix it or prevent it happening again. Tone: genuine and professional. Keep it under 150 words.'
  },
];

var currentCat  = 'all';
var currentTool = 'all';

function renderToolFilter() {
  var bar = document.getElementById('tool-filter-bar');
  if (!bar) return;
  bar.innerHTML = TOOLS.map(function(t) {
    var active = t.id === currentTool ? ' ag-tool-btn--active' : '';
    return '<button class="ag-tool-btn' + active + '" data-tool="' + t.id + '">' + t.label + '</button>';
  }).join('');
  bar.querySelectorAll('.ag-tool-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setTool(btn.dataset.tool); });
  });
}

function renderCatFilter() {
  var bar = document.getElementById('cat-filter-bar');
  if (!bar) return;
  bar.innerHTML = CATS.map(function(c) {
    var active = c.id === currentCat ? ' ag-cat-btn--active' : '';
    return '<button class="ag-cat-btn' + active + '" data-cat="' + c.id + '">' + c.label + '</button>';
  }).join('');
  bar.querySelectorAll('.ag-cat-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setCat(btn.dataset.cat); });
  });
}

function setTool(toolId) {
  currentTool = toolId;
  renderToolFilter();
  renderToolBadge();
  renderPrompts();
}

function setCat(catId) {
  currentCat = catId;
  renderCatFilter();
  renderPrompts();
}

function renderToolBadge() {
  var badge = document.getElementById('tool-safety-badge');
  if (!badge) return;
  if (currentTool === 'all' || !TOOL_INFO[currentTool]) {
    badge.hidden = true;
    return;
  }
  badge.hidden = false;
  badge.textContent = TOOL_INFO[currentTool].safe;
}

function renderPrompts() {
  var grid = document.getElementById('prompt-grid');
  if (!grid) return;
  var filtered = PROMPTS.filter(function(p) {
    var catMatch  = currentCat === 'all'  || p.cat === currentCat;
    var toolMatch = currentTool === 'all' || p.tools === 'all' || p.tools === currentTool;
    return catMatch && toolMatch;
  });
  if (!filtered.length) {
    grid.innerHTML = '<div class="ag-empty">No prompts match this combination. Try selecting "All tools" or a different category.</div>';
    return;
  }
  grid.innerHTML = filtered.map(function(p, i) {
    var id = 'prompt-' + i;
    var catLabel = CATS.find(function(c) { return c.id === p.cat; });
    var toolLabel = p.tools !== 'all' ? (' · ' + p.tools.charAt(0).toUpperCase() + p.tools.slice(1)) : '';
    return '<div class="ag-prompt-card">' +
      '<div class="ag-prompt-meta">' +
        '<span class="ag-prompt-cat">' + (catLabel ? catLabel.label : p.cat) + toolLabel + '</span>' +
      '</div>' +
      '<div class="ag-prompt-title">' + p.title.replace(/</g,'&lt;') + '</div>' +
      '<pre class="ag-prompt-text" id="' + id + '">' + p.prompt.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>' +
      '<button class="ag-copy-btn" data-prompt-id="' + id + '" aria-label="Copy prompt">Copy prompt</button>' +
    '</div>';
  }).join('');
}

function copyPrompt(id, btn) {
  var el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(function() {
    var orig = btn.textContent;
    btn.textContent = 'Copied ✓';
    btn.style.borderColor = 'var(--med)';
    btn.style.color = 'var(--med)';
    setTimeout(function() {
      btn.textContent = orig;
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);
  }).catch(function() {
    var range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    btn.textContent = 'Copied ✓';
    setTimeout(function() { btn.textContent = 'Copy prompt'; }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderToolFilter();
  renderCatFilter();
  renderToolBadge();
  renderPrompts();

  var grid = document.getElementById('prompt-grid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      var copyBtn = e.target.closest('[data-prompt-id]');
      if (copyBtn) copyPrompt(copyBtn.dataset.promptId, copyBtn);
    });
  }
});
