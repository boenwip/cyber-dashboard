/**
 * ai-guide.js — pseudosec. AI Guide
 * Prompt library: situation categories, tool filter, audience toggle
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

// audience: 'all' = shown to everyone; 'pro' = shown only in Security & IT mode
var PROMPTS = [

  // ── STAYING SAFE ──
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'Is this email a scam?',
    prompt: 'I received this email and I\'m not sure if it\'s legitimate. Can you analyse it for signs of phishing or fraud? Look at the sender, the links it mentions, the urgency, the language, and what it\'s asking me to do. Tell me what\'s suspicious and give me a clear next step:\n\n[Paste the email text here — do not include your personal details or passwords]'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'Is this text message a scam?',
    prompt: 'I received this text message and I don\'t know if it\'s real. Can you analyse it for signs of a scam? Explain the red flags, what the scammer is likely trying to do, and exactly what I should do next:\n\n[Paste the message text here]'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'I clicked a suspicious link — what do I do?',
    prompt: 'I just clicked a link in an email or message that I now think might be a scam or malicious. I\'m worried something might have happened. Can you give me a clear, step-by-step guide on what to do right now? Tell me what to check, what to change, and whether I need to contact anyone. Explain it simply — I\'m not very technical.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'I think my account has been hacked',
    prompt: 'I think my [email / social media / bank / other] account may have been compromised. I\'m not very technical — can you give me a simple, step-by-step guide on what to do right now? Tell me what to check first, what to change, who I might need to contact, and how to make sure it doesn\'t happen again.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'Someone called claiming to be from Microsoft/ATO/my bank',
    prompt: 'I just received a phone call from someone claiming to be from [Microsoft / the Australian Taxation Office / my bank / NBN / another organisation]. They said [describe what they said and what they asked for]. Is this likely a scam? What should I do, and what should I absolutely NOT do? Explain it simply.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'I got a threatening email demanding money',
    prompt: 'I received an email claiming to have [access to my computer / footage from my webcam / my passwords] and demanding I pay money or they\'ll [describe threat]. I\'m worried and don\'t know if it\'s real. Can you explain what this likely is, whether I should be concerned, and exactly what I should do? Please be direct.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'How do I tell if a website is safe?',
    prompt: 'I\'m not sure whether a website I\'m on is legitimate or safe to use. Can you explain — in plain English for a non-technical person — the signs that a website is trustworthy versus suspicious? What should I look for in the URL, the page design, and the content before I enter any information?'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'What makes a strong password?',
    prompt: 'Explain what makes a strong, secure password in plain English for someone who isn\'t technical. What should I avoid? What\'s the easiest way to manage lots of passwords without memorising them all? Give me practical, realistic advice I can actually follow. Under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'Explain multi-factor authentication simply',
    prompt: 'Explain what multi-factor authentication (MFA or 2FA) is, why it matters, and how to set it up — for someone who has never heard of it before. Use a simple analogy. What are my options and which is the most secure? Under 200 words.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'Is it safe to use public Wi-Fi?',
    prompt: 'I\'m at a café / airport / hotel and want to use the public Wi-Fi. Explain the risks to me in plain English — what can actually go wrong, who might be watching, and what I can do to be safer. What should I definitely avoid doing on public Wi-Fi?'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'all',
    title: 'Draft a staff security awareness tip',
    prompt: 'Write a short, friendly security awareness tip for staff about [topic — e.g. spotting phishing emails, using strong passwords, safe use of USBs]. It will be shared in our team newsletter or intranet. Keep it under 100 words. Include one clear action people can take.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'pro',
    title: 'Analyse this security alert or log entry',
    prompt: 'I\'m investigating the following security alert or log entry and need help interpreting it. What does it indicate? How serious is it? What should I investigate next, and what immediate actions should I take?\n\n[Paste the alert or log entry here]'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'pro',
    title: 'Draft a security incident communication',
    prompt: 'Draft a staff communication about a [type of incident — e.g. phishing campaign targeting staff, system outage, data breach notification]. Audience: all staff. Include: what happened (in general terms), what the risk is, what action staff should take right now, and who to contact with questions. Do not include specific technical details or client information.'
  },
  {
    cat: 'staying-safe', tools: 'all', audience: 'pro',
    title: 'Write a data breach customer notification',
    prompt: 'Help me draft a notification to affected customers/clients about a data breach. What happened: [brief description — keep vague, no specifics]. Data potentially affected: [types of data — e.g. names, email addresses]. Include: what happened, what data was involved, what we\'re doing, what they should do, and contact details for questions. Tone: transparent, calm, responsible. Comply with Australian Notifiable Data Breach scheme expectations.'
  },

  // ── EVERYDAY WORK ──
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Draft a professional follow-up email',
    prompt: 'Write a professional follow-up email to [name or role] about [topic]. Context: [one sentence of context]. Tone: polite but direct. Include a clear call to action. Keep it under 150 words.'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Decline a request politely',
    prompt: 'Write a polite, professional email declining [describe the request] from [sender]. Reason for declining: [brief reason]. Keep it brief and friendly. Leave the door open for future contact if appropriate.'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Respond to a complaint',
    prompt: 'Write a professional response to a complaint about [issue]. Acknowledge the concern without admitting fault. Explain what is being done to address it. Provide a clear next step. Tone: empathetic, solution-focused, and professional.'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Escalation email to management',
    prompt: 'Write a brief escalation email to [role] about [issue]. Include: what the issue is, why it matters, what has been tried already, and what decision or support is needed from them. Tone: urgent but calm and professional.'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Write a meeting agenda',
    prompt: 'Create a structured agenda for a [duration] meeting about [topic]. Attendees: [list roles or team]. Goal of the meeting: [one sentence]. Include time allocations for each agenda item.'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Turn rough notes into meeting minutes',
    prompt: 'Based on the following rough notes from a meeting, write clean, professional meeting minutes. Include: date, attendees, key decisions made, action items (with owners if noted), and next steps.\n\n[Paste your rough notes here]'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Project status update',
    prompt: 'Write a brief project status update for [project name] to share with [audience — e.g. leadership team, client]. Format: overall status (Red / Amber / Green), one paragraph summary, key accomplishments this period, current risks, and next steps.'
  },
  {
    cat: 'work', tools: 'all', audience: 'all',
    title: 'Create a step-by-step checklist',
    prompt: 'Create a clear, step-by-step checklist for [process — e.g. onboarding a new staff member, setting up a new device, preparing for an audit]. Each step should be a single, actionable task. Make it easy to follow for someone unfamiliar with the process.'
  },
  {
    cat: 'work', tools: 'zoom', audience: 'all',
    title: 'Summarise a meeting recording (Zoom)',
    prompt: 'After your Zoom meeting, open AI Companion from the meeting summary page and ask:\n\n"Summarise this meeting in dot points. List the key decisions made, any action items with who is responsible, and any unresolved questions. Keep it under one page."'
  },
  {
    cat: 'work', tools: 'copilot', audience: 'all',
    title: 'Draft a document in Word (Copilot)',
    prompt: 'In Microsoft Word with Copilot, use the Copilot draft pane and enter:\n\n"Write a first draft of [document type — e.g. an IT policy, a project proposal, a staff handbook section] about [topic]. Audience: [describe]. Tone: [formal/friendly]. Length: approximately [X] pages."'
  },
  {
    cat: 'work', tools: 'copilot', audience: 'all',
    title: 'Analyse data in Excel (Copilot)',
    prompt: 'In Microsoft Excel with Copilot, select your data and open Copilot, then ask:\n\n"Summarise the key trends in this data. What are the highest and lowest values? Are there any patterns I should be aware of? Format your response as a short summary with bullet points."\n\nReplace with your specific question about the data.'
  },
  {
    cat: 'work', tools: 'all', audience: 'pro',
    title: 'Write a business case for a security investment',
    prompt: 'Help me write a business case for [security tool, process, or initiative — e.g. implementing MFA, purchasing endpoint protection, running security awareness training]. Audience: [leadership / board / finance team]. Include: the problem it solves, the risk of not acting, the cost/benefit summary, and a recommended next step. Tone: clear and non-technical.'
  },
  {
    cat: 'work', tools: 'all', audience: 'pro',
    title: 'What questions should I ask a vendor about security?',
    prompt: 'I\'m evaluating a [type of software/service — e.g. cloud HR platform, SaaS tool, managed IT provider] for our organisation. Generate a list of security questions I should ask the vendor before signing a contract. Cover: data storage and location, breach history, access controls, compliance certifications, subprocessors, and incident response. We are an Australian organisation subject to the Privacy Act.'
  },

  // ── WRITING & COMMS ──
  {
    cat: 'comms', tools: 'all', audience: 'all',
    title: 'Summarise a long document',
    prompt: 'Summarise the following document. Give me:\n1. A 3-bullet-point overview\n2. A one-paragraph summary suitable for sharing with non-technical staff\n3. Any key actions or decisions the reader needs to know about\n\n[Paste the document text here]'
  },
  {
    cat: 'comms', tools: 'all', audience: 'all',
    title: 'Rewrite in plain English',
    prompt: 'Rewrite the following in plain English for someone with no technical or specialist background. Avoid jargon. Use short sentences. Keep it under 150 words:\n\n[Paste the text here]'
  },
  {
    cat: 'comms', tools: 'all', audience: 'all',
    title: 'Proofread and improve my writing',
    prompt: 'Please proofread the following text. Fix any grammar, spelling, or punctuation errors. Then rewrite it to improve clarity and flow — but keep my meaning and tone. Show me the corrected version and a brief note on what changed:\n\n[Paste your text here]'
  },
  {
    cat: 'comms', tools: 'all', audience: 'all',
    title: 'Write a staff announcement',
    prompt: 'Write a brief staff announcement about [topic — e.g. a system change, a new policy, an upcoming event]. Audience: all staff. Keep it under 150 words. Start with the key information, not background. Include one clear action if staff need to do something.'
  },
  {
    cat: 'comms', tools: 'all', audience: 'all',
    title: 'Policy one-pager for staff',
    prompt: 'Write a one-page summary of the following policy for staff. Use short paragraphs and bullet points. Write in plain English — no jargon. Include a "What this means for you" section at the end with practical takeaways:\n\n[Paste the policy or key points here]'
  },
  {
    cat: 'comms', tools: 'all', audience: 'all',
    title: 'Write a job advertisement',
    prompt: 'Write a job advertisement for a [job title] position at a [type of organisation] based in [location, e.g. Brisbane, Queensland]. Include: a brief role summary, key responsibilities (5–7 dot points), what we\'re looking for, and a short "about us" section. Tone: professional but welcoming. Avoid corporate jargon.'
  },
  {
    cat: 'comms', tools: 'canva', audience: 'all',
    title: 'Write a design brief for Canva (Canva)',
    prompt: 'In Canva, use Magic Write or the AI design assistant and describe your project:\n\n"I need to create a [type of design — e.g. social media post, flyer, presentation slide]. The topic is [topic]. The audience is [describe]. The tone should be [professional/bold/friendly/clean]. Key message: [one sentence]. Colours or brand style: [describe or say \'match our existing brand\']. Please suggest a layout and generate a first draft."'
  },
  {
    cat: 'comms', tools: 'all', audience: 'pro',
    title: 'Review a policy for gaps and compliance issues',
    prompt: 'Review the following policy and identify:\n1. Any gaps in coverage\n2. Anything that is unclear or ambiguous\n3. Anything that may not comply with Australian Privacy Act requirements or the Notifiable Data Breach scheme\n4. Recommendations to improve it\n\nProvide your response as a structured list:\n\n[Paste policy text here — anonymise before pasting]'
  },

  // ── UNDERSTANDING SOMETHING ──
  {
    cat: 'learn', tools: 'all', audience: 'all',
    title: 'Explain this to me simply',
    prompt: 'Explain [concept, term, or situation — e.g. ransomware, two-factor authentication, the cloud, a VPN, what just happened in the news] as if I\'m a complete beginner. Use a real-world analogy I can relate to. Tell me why it matters to me personally. Under 200 words.'
  },
  {
    cat: 'learn', tools: 'all', audience: 'all',
    title: 'Decode this technical message',
    prompt: 'I received this technical message / alert / error / notice and I don\'t understand what it means or what I should do. Explain it in plain English. Is it serious? What caused it? What (if anything) do I need to do right now?\n\n[Paste the message, alert, or error here]'
  },
  {
    cat: 'learn', tools: 'all', audience: 'all',
    title: 'Quiz me on a topic',
    prompt: 'Give me 5 multiple-choice questions to test my understanding of [topic]. After I answer each one, tell me whether I\'m right and explain why in one or two sentences. Start with the first question and wait for my answer before moving on.'
  },
  {
    cat: 'learn', tools: 'all', audience: 'all',
    title: 'Create a learning plan',
    prompt: 'Create a simple 4-week learning plan for someone who wants to learn [skill or topic] starting from scratch. One realistic goal or task per week. Include free or low-cost resources where possible. I have about [X hours] per week to spend on this.'
  },
  {
    cat: 'learn', tools: 'all', audience: 'all',
    title: 'What does this error message mean?',
    prompt: 'I got this error message on my [device / app / website] and I don\'t know what to do. Explain what it means in plain English, what likely caused it, and give me clear steps to fix it or who to contact:\n\n[Paste the error message here]'
  },
  {
    cat: 'learn', tools: 'all', audience: 'pro',
    title: 'Explain a CVE and its business impact',
    prompt: 'Explain the following CVE to me. I need to understand: what the vulnerability is, what systems or software are affected, how serious it is (and why), whether it\'s being actively exploited, and what action we should take. I\'ll be briefing non-technical leadership.\n\nCVE ID: [paste CVE ID]\nDescription: [paste the description if available]'
  },
  {
    cat: 'learn', tools: 'all', audience: 'pro',
    title: 'Summarise a threat report for leadership',
    prompt: 'I need to brief leadership on the key findings of the following threat report or advisory. Summarise it in plain English: what are the key threats, who is at risk, what should our organisation be doing about it? Keep it to one page maximum. No jargon.\n\n[Paste or describe the report/advisory here]'
  },

  // ── YOUR DAY-TO-DAY ──
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Help me prioritise my day',
    prompt: 'Here are my tasks for today. Help me prioritise them by urgency and importance. Tell me what to tackle first, what to schedule for later, and what could be delegated or dropped. Suggest a realistic order:\n\n[List your tasks here]'
  },
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Prepare for a difficult conversation',
    prompt: 'I need to have a difficult conversation with [role/relationship — e.g. my manager, a colleague, a supplier] about [topic]. Help me prepare. What are the key points I need to make? What might they say and how should I respond? How do I keep it calm and constructive? Give me practical talking points I can actually use.'
  },
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Write a complaint to a business',
    prompt: 'Help me write a clear, firm complaint letter or email to [business name or type] about [issue]. I want to explain the problem clearly, state what outcome I want, and be professional without being a pushover. Keep it under 250 words.'
  },
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Turn a rough idea into a plan',
    prompt: 'I have an idea but it\'s not fully formed. Help me turn it into a simple, practical plan. My idea: [describe in a few sentences]. Ask me any clarifying questions you need, then give me a step-by-step action plan with realistic timelines.'
  },
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Questions to ask at a job interview',
    prompt: 'I have an interview for a [job title] role at [type of organisation]. Help me come up with 5–8 smart, genuine questions to ask the interviewer. I want to understand the role, the team, and the culture — and come across as engaged and thoughtful. Not generic questions — ones that show I\'ve thought about this specific role.'
  },
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Write a performance self-assessment',
    prompt: 'Help me write a professional self-assessment for my performance review. I want to highlight my contributions, be honest about areas for growth, and set goals for the next period. Here are my notes:\n\n[Paste your notes here]\n\nTone: confident and professional, not boastful. Length: about 300–400 words.'
  },
  {
    cat: 'life', tools: 'all', audience: 'all',
    title: 'Help me negotiate something',
    prompt: 'I need to negotiate [salary / contract terms / a price / a deadline] with [person or organisation]. The current offer or situation is: [describe]. My goal is: [what you want]. Help me prepare — what\'s my opening position, what are my trade-offs, and what should I avoid saying? Give me specific language I can actually use.'
  },
];

var currentCat      = 'all';
var currentTool     = 'all';
var currentAudience = 'all'; // 'all' = everyone, 'pro' = show pro prompts too

function renderAudienceToggle() {
  var toggle = document.getElementById('audience-toggle');
  if (!toggle) return;
  toggle.querySelectorAll('.ag-audience-btn').forEach(function(btn) {
    btn.classList.toggle('ag-audience-btn--active', btn.dataset.audience === currentAudience);
  });
}

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

function setAudience(val) {
  currentAudience = val;
  renderAudienceToggle();
  renderPrompts();
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
    var catMatch      = currentCat === 'all'  || p.cat === currentCat;
    var toolMatch     = currentTool === 'all' || p.tools === 'all' || p.tools === currentTool;
    var audienceMatch = currentAudience === 'pro' || p.audience !== 'pro';
    return catMatch && toolMatch && audienceMatch;
  });
  if (!filtered.length) {
    grid.innerHTML = '<div class="ag-empty">No prompts match this combination. Try selecting "All tools" or a different category.</div>';
    return;
  }
  grid.innerHTML = filtered.map(function(p, i) {
    var id = 'prompt-' + i;
    var catLabel = CATS.find(function(c) { return c.id === p.cat; });
    var toolSuffix = p.tools !== 'all' ? (' · ' + p.tools.charAt(0).toUpperCase() + p.tools.slice(1)) : '';
    var proTag = p.audience === 'pro' ? '<span class="ag-prompt-pro">Security &amp; IT</span>' : '';
    return '<div class="ag-prompt-card">' +
      '<div class="ag-prompt-meta">' +
        '<span class="ag-prompt-cat">' + (catLabel ? catLabel.label : p.cat) + toolSuffix + '</span>' +
        proTag +
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
  renderAudienceToggle();
  renderToolFilter();
  renderCatFilter();
  renderToolBadge();
  renderPrompts();

  var toggle = document.getElementById('audience-toggle');
  if (toggle) {
    toggle.addEventListener('click', function(e) {
      var btn = e.target.closest('.ag-audience-btn');
      if (btn) setAudience(btn.dataset.audience);
    });
  }

  var grid = document.getElementById('prompt-grid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      var copyBtn = e.target.closest('[data-prompt-id]');
      if (copyBtn) copyPrompt(copyBtn.dataset.promptId, copyBtn);
    });
  }
});
