/**
 * ai-guide.js — pseudosec. AI Guide
 * General-purpose prompt library (works in any AI chat tool):
 * situation categories + Everyone / Security & IT audience toggle.
 */

var CATS = [
  { id: 'all',          label: 'All' },
  { id: 'staying-safe', label: 'Staying Safe' },
  { id: 'work',         label: 'Everyday Work' },
  { id: 'comms',        label: 'Writing & Comms' },
  { id: 'learn',        label: 'Understanding Something' },
  { id: 'life',         label: 'Your Day-to-Day' },
];

// Shared lines, so safety wording is written (and fact-checked) once.
// Contacts verified September 2026: cyber.gov.au/report, scamwatch.gov.au,
// IDCARE 1800 595 160, Australian Cyber Security Hotline 1300 292 371 (1300 CYBER1).
var AU_HELP = 'If I need to report this or get help in Australia, tell me which of these fit: my bank (using the number on my card or its official app), ReportCyber (cyber.gov.au/report), Scamwatch (scamwatch.gov.au), IDCARE (1800 595 160) or the Australian Cyber Security Hotline (1300 292 371).';
var NO_NUMBERS = 'Don\'t give me phone numbers or links for any other organisation — tell me to find their official contact details myself.';
var NOT_SAFE = 'Don\'t tell me it\'s definitely safe: you can\'t verify who sent it or where links really go.';
var GROUNDED = 'Use only the information I give you. Where something is missing, write [NEEDS INPUT] instead of guessing.';
var SANITISE = 'Before pasting, remove names, account numbers and anything confidential.';

// audience: 'all' = shown to everyone; 'pro' = shown only in Security & IT mode
var PROMPTS = [

  // ── STAYING SAFE ──
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Is this email a scam?',
    prompt: 'I\'m in Australia and got the email below. I\'m not sure it\'s genuine.\n\n' +
      'Sender address: [the full email address, not just the display name]\n' +
      'Links go to: [hover over or long-press each link and copy the address it shows — don\'t click it]\n' +
      'Email text: [paste the email — remove your own name, account numbers and passwords]\n\n' +
      '1. Give me your verdict — Likely scam, Unclear, or Likely genuine — and the specific red flags you see.\n' +
      '2. Tell me exactly what to do next.\n\n' +
      NOT_SAFE + ' If it claims to be from a real organisation, tell me to contact them using details I find myself. ' + NO_NUMBERS + ' ' + AU_HELP
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Is this text message a scam?',
    prompt: 'I\'m in Australia and got this text message. I don\'t know if it\'s real.\n\n' +
      'From: [the number or sender name shown]\n' +
      'Message: [paste the text — don\'t tap any links in it]\n\n' +
      'Give me your verdict — Likely scam, Unclear, or Likely genuine — explain the red flags, what the sender is probably after, and exactly what I should do next. ' +
      NOT_SAFE + ' ' + NO_NUMBERS + ' ' + AU_HELP
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Someone called claiming to be from my bank, the ATO or a tech company',
    prompt: 'I just had a phone call from someone claiming to be from [my bank / the ATO / Microsoft / my telco / other]. They said: [what they said and what they asked for].\n' +
      'What I gave them, if anything: [nothing / personal details / a code sent to my phone / money / I installed software or let them access my computer]\n\n' +
      'Is this likely a scam? Tell me what to do right now, in order, based on what I gave them — and what I should absolutely NOT do. Keep it simple. ' +
      NO_NUMBERS + ' ' + AU_HELP
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'I clicked a suspicious link — what do I do?',
    prompt: 'I clicked a link in a [email / text / social media message] that I now think was a scam.\n' +
      'After clicking I: [closed it straight away / typed a password — say which account / entered card or bank details / downloaded or opened a file / not sure]\n' +
      'Device: [phone / laptop / work computer]\n\n' +
      'Give me a simple step-by-step plan for right now, based on what I did after clicking. Tell me what to check, what to change and who to tell (if it\'s a work device, include my IT team). I\'m not very technical. ' +
      AU_HELP
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'I think my account has been hacked',
    prompt: 'I think my [email / social media / bank / other] account has been hacked.\n' +
      'What I noticed: [e.g. password changed, messages I didn\'t send, login alert, missing money]\n' +
      'Can I still log in? [yes / no]\n' +
      'Did I use the same password anywhere else? [yes / no / not sure]\n\n' +
      'I\'m not very technical. Give me a simple, step-by-step plan: what to do first, how to lock the account down, what to check afterwards and how to stop it happening again. ' +
      AU_HELP
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'I got an email threatening me and demanding money',
    prompt: 'I got an email claiming [they have access to my computer / webcam footage of me / my passwords] and demanding [amount] or they\'ll [threat].\n' +
      'Does it show a real password of mine? [yes — an old one / yes — a current one / no]\n\n' +
      'Explain what this most likely is, how worried I should be, and exactly what to do. Be direct. ' + AU_HELP
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Is this website safe to use?',
    prompt: 'Web address: [paste the full address from the address bar]\n' +
      'What it\'s asking me to do: [e.g. log in, pay, enter my details, download something]\n' +
      'How I got there: [e.g. a link in a text, an ad, a search]\n\n' +
      'Check the address for warning signs such as look-alike spellings or odd domains, and tell me what else to check before I enter anything. Correct me if I\'m relying on myths — for example, a padlock only means the connection is encrypted, not that the site is honest. ' +
      NOT_SAFE
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Help me set up strong passwords',
    prompt: 'Explain how to make strong passwords, in plain English for someone who isn\'t technical. Base it on the Australian Cyber Security Centre\'s advice to use passphrases — four or more random words, at least 15 characters. Cover what to avoid, why reusing passwords is risky, and the easiest way to manage lots of them. Practical advice I\'ll actually follow, under 200 words.'
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Explain multi-factor authentication and passkeys',
    prompt: 'Explain multi-factor authentication (MFA) and passkeys to someone who has never heard of them. Use a simple analogy. Compare the common options — text message codes, authenticator apps, passkeys and security keys — from least to most secure, and tell me which accounts to protect first. Under 200 words.'
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Is public Wi-Fi safe to use?',
    prompt: 'I want to use public Wi-Fi at a [café / airport / hotel]. Give me a balanced, up-to-date explanation in plain English: what the real risks are today, what\'s mostly a myth, and a short list of habits that keep me safe.'
  },
  {
    cat: 'staying-safe', audience: 'all',
    title: 'Write a security tip for my team',
    prompt: 'Write a short, friendly security tip for [audience — e.g. staff, my family, a community group] about [topic — e.g. spotting phishing emails, passphrases, scam phone calls]. It will go in a [newsletter / group chat / notice board]. Under 100 words, no jargon, and end with one clear action people can take today.'
  },
  {
    cat: 'staying-safe', audience: 'pro',
    title: 'Help me interpret a security alert or log entry',
    prompt: 'Help me interpret this security alert or log entry.\n' +
      'Source: [e.g. EDR, firewall, Microsoft 365 sign-in logs, SIEM rule name]\n' +
      'Environment: [e.g. 200-seat organisation, Windows, Microsoft 365]\n' +
      'Alert or log: [paste — replace real IP addresses, hostnames, usernames and email addresses with placeholders like HOST-A or USER-1, unless your AI plan is approved for this data]\n\n' +
      'Tell me: what it likely indicates, how serious it is and how confident you are, the most likely benign explanations, what to check next, and any immediate containment steps. Say what extra information would change your assessment.'
  },
  {
    cat: 'staying-safe', audience: 'pro',
    title: 'Draft a staff message about a security incident',
    prompt: 'Draft a message to all staff about [incident — e.g. a phishing campaign targeting staff, a system outage, a suspected breach].\n' +
      'Known facts: [what happened, which systems, when]\n' +
      'What staff must do: [e.g. reset password, report suspicious emails to X]\n' +
      'Contact for questions: [name or team]\n\n' +
      'Structure: what happened in general terms, what it means for staff, what to do now, what NOT to do (for example, don\'t forward the suspicious email, don\'t discuss it outside work), and who to contact. Calm, clear, no technical detail or customer information. ' + GROUNDED
  },
  {
    cat: 'staying-safe', audience: 'pro',
    title: 'Draft a data breach notification to affected people',
    prompt: 'Help me draft a notification to people affected by a data breach, for an organisation covered by the Australian Notifiable Data Breaches scheme.\n\n' +
      'Our organisation and contact details: [name, phone, email]\n' +
      'What happened: [the facts you know — what, when, how it was discovered]\n' +
      'Kinds of information involved: [e.g. names, email addresses, driver licence numbers]\n' +
      'What we\'re doing about it: [actions taken]\n' +
      'Steps we recommend people take: [e.g. watch for scams, change passwords, replace ID documents]\n\n' +
      'Include every item above, as the scheme expects. Be clear, calm and transparent. State facts only — don\'t speculate about causes or impact, and don\'t minimise. ' + GROUNDED +
      ' Flag anything that should be reviewed by our privacy or legal adviser before it is sent.'
  },

  // ── EVERYDAY WORK ──
  {
    cat: 'work', audience: 'all',
    title: 'Draft a professional follow-up email',
    prompt: 'Write a professional follow-up email to [name or role] about [topic]. Context: [one or two sentences]. Tone: polite but direct. Include a clear call to action and a date if relevant. Under 150 words.'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Decline a request politely',
    prompt: 'Write a polite, professional email declining [describe the request] from [sender]. Reason: [brief reason]. Keep it brief and friendly, and leave the door open for future contact if appropriate.'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Respond to a complaint',
    prompt: 'Help me reply to this complaint.\n' +
      'The complaint: [paste it — remove the customer\'s personal details]\n' +
      'What we can offer or have done: [facts]\n\n' +
      'Acknowledge the person\'s experience, respond to each point they raise, explain what we\'re doing and give a clear next step with a timeframe. Tone: empathetic and solution-focused. Don\'t promise anything I haven\'t listed.'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Escalate an issue to management',
    prompt: 'Write a short escalation email to [role].\n' +
      'The issue: [what\'s happening]\n' +
      'Why it matters: [impact, deadline or risk]\n' +
      'What\'s been tried: [steps so far]\n' +
      'What I need from them: [decision, resources, approval]\n\n' +
      'Lead with the decision I need. Tone: urgent but calm. Under 200 words. ' + GROUNDED
  },
  {
    cat: 'work', audience: 'all',
    title: 'Write a meeting agenda',
    prompt: 'Create an agenda for a [duration] meeting about [topic]. Attendees: [roles or team]. Goal: [one sentence — the decision or outcome we need]. Include time allocations, who leads each item, and leave time at the end to confirm actions.'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Turn notes or a transcript into meeting minutes',
    prompt: 'Turn the notes or transcript below into clear meeting minutes: date, attendees, key decisions, action items (owner and due date where mentioned) and open questions.\n\n' +
      'Only include decisions and actions that are actually in the text. Mark anything unclear as [UNCLEAR] rather than filling it in.\n\n[Paste your notes or transcript here]'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Write a project status update',
    prompt: 'Write a project status update for [project] for [audience — e.g. leadership, a client].\n' +
      'Format: overall status (Red / Amber / Green) with one line on why, a short summary, progress this period, risks or issues, and next steps.\n\n' +
      GROUNDED + '\n\nMy notes:\n[paste your notes — progress, blockers, dates]'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Create a step-by-step checklist',
    prompt: 'Create a step-by-step checklist for [process — e.g. onboarding a new team member, setting up a new laptop, preparing for an audit]. Each step should be one actionable task. Group the steps into stages, and make it easy to follow for someone who has never done this before.'
  },
  {
    cat: 'work', audience: 'all',
    title: 'Write a first draft of a document',
    prompt: 'Write a first draft of a [document type — e.g. procedure, proposal, policy section, report] about [topic].\n' +
      'Audience: [who will read it]\n' +
      'Purpose: [what the reader should know or do afterwards]\n' +
      'Key points to cover: [bullet list]\n' +
      'Tone and length: [e.g. formal, about 2 pages]\n\n' +
      'Use clear headings. ' + GROUNDED
  },
  {
    cat: 'work', audience: 'all',
    title: 'Find patterns in a table of data',
    prompt: 'Here is a table of data about [what it is]. ' + SANITISE + '\n\n' +
      '[Paste the table, or a sample of it, with the column headings]\n\n' +
      'Summarise the main trends, the highest and lowest values, and anything unusual. Show the numbers behind each point so I can check them, and tell me if the data is too small or incomplete to draw conclusions.'
  },
  {
    cat: 'work', audience: 'pro',
    title: 'Write a business case for a security investment',
    prompt: 'Help me write a business case for [initiative — e.g. rolling out MFA, endpoint protection, security awareness training].\n' +
      'Audience: [leadership / board / finance]\n' +
      'The problem and current risk: [what could happen and why]\n' +
      'Costs I know: [figures]\n\n' +
      'Include the problem, the risk of not acting, options with their trade-offs, the costs and benefits, and a recommendation. Plain, non-technical language. Don\'t invent costs, statistics or incident figures — write [NEEDS INPUT] wherever I need to supply one.'
  },
  {
    cat: 'work', audience: 'pro',
    title: 'Security questions to ask a vendor',
    prompt: 'We\'re an Australian organisation covered by the Privacy Act, evaluating [type of service — e.g. cloud HR platform, managed IT provider]. List the security and privacy questions to ask before signing. Cover: where data is stored and who can access it, subcontractors, certifications (e.g. ISO 27001, SOC 2), breach history and notification, incident response, backups, what happens to our data when the contract ends, and whether our data is used to train AI models. Group the questions and mark the must-haves.'
  },

  // ── WRITING & COMMS ──
  {
    cat: 'comms', audience: 'all',
    title: 'Summarise a long document',
    prompt: 'Summarise the document below. Give me:\n1. A 3-bullet overview\n2. A one-paragraph summary for someone with no background\n3. Any actions, deadlines or decisions the reader needs to know\n\nOnly use what\'s in the document, and say if anything important is unclear.\n\n[Paste the document text here]'
  },
  {
    cat: 'comms', audience: 'all',
    title: 'Rewrite in plain English',
    prompt: 'Rewrite the text below in plain English for someone with no specialist background. Avoid jargon, use short sentences, and keep every fact and requirement. Under 150 words.\n\n[Paste the text here]'
  },
  {
    cat: 'comms', audience: 'all',
    title: 'Proofread and improve my writing',
    prompt: 'Proofread the text below. Fix grammar, spelling and punctuation (Australian English), then improve clarity and flow while keeping my meaning and tone. Show the corrected version, then a short list of the main changes.\n\n[Paste your text here]'
  },
  {
    cat: 'comms', audience: 'all',
    title: 'Write an announcement',
    prompt: 'Write a short announcement about [topic — e.g. a system change, a new policy, an event] for [audience]. Lead with the key information, not background. Include what people need to do and by when, if anything. Under 150 words.'
  },
  {
    cat: 'comms', audience: 'all',
    title: 'Turn a policy into a one-page summary',
    prompt: 'Turn the policy below into a one-page summary for [audience]. Short paragraphs and bullet points, plain English, and a "What this means for you" section at the end. Don\'t add rules or requirements that aren\'t in the policy.\n\n[Paste the policy or its key points here]'
  },
  {
    cat: 'comms', audience: 'all',
    title: 'Write a job advertisement',
    prompt: 'Write a job ad for a [job title] at a [type of organisation] in [location]. Include a role summary, 5–7 key responsibilities, what we\'re looking for (separating essential from nice-to-have), and a short "about us". Tone: professional and welcoming, no corporate jargon. Use inclusive language and avoid anything that could discourage applicants based on age, gender or background.\n\nDetails: [pay range, hours, key requirements]'
  },
  {
    cat: 'comms', audience: 'all',
    title: 'Plan a flyer, poster or social media post',
    prompt: 'Help me plan a [flyer / poster / social media post / presentation slide].\n' +
      'Topic: [topic]\n' +
      'Audience: [who it\'s for]\n' +
      'Key message: [one sentence]\n' +
      'Call to action: [what people should do]\n' +
      'Tone: [professional / bold / friendly]\n\n' +
      'Suggest a headline, supporting text, a simple layout and ideas for images. Keep the wording short enough to read at a glance.'
  },
  {
    cat: 'comms', audience: 'pro',
    title: 'Review a policy for gaps and privacy issues',
    prompt: 'Review the policy below and list:\n1. Gaps in coverage\n2. Anything unclear or open to interpretation\n3. Possible issues under the Australian Privacy Principles or the Notifiable Data Breaches scheme — name the specific principle for each so I can check it\n4. Recommended improvements, most important first\n\nThis is a first pass, not legal advice — say where a privacy or legal adviser should confirm.\n\n[Paste the policy — remove names and internal details first]'
  },

  // ── UNDERSTANDING SOMETHING ──
  {
    cat: 'learn', audience: 'all',
    title: 'Explain this to me simply',
    prompt: 'Explain [concept, term or news story — e.g. ransomware, a VPN, the cloud] as if I\'m a complete beginner. Use a real-world analogy, tell me why it matters to me, and what (if anything) I should do about it. Under 200 words.'
  },
  {
    cat: 'learn', audience: 'all',
    title: 'What does this message, alert or error mean?',
    prompt: 'I got this message on my [phone / computer / app / website] and don\'t understand it.\n' +
      'The message: [paste the exact text]\n' +
      'What I was doing: [e.g. opening an attachment, browsing, updating]\n\n' +
      'First, tell me whether it looks like a scam — fake virus warnings and pop-ups that say "call this number" or "your computer is locked" are common tricks. Then explain in plain English what it means, how serious it is, and the steps to fix it. ' + NO_NUMBERS
  },
  {
    cat: 'learn', audience: 'all',
    title: 'Quiz me on a topic',
    prompt: 'Give me 5 multiple-choice questions to test my understanding of [topic], starting easy and getting harder. Ask one question at a time and wait for my answer. After each answer, tell me if I\'m right and explain why in one or two sentences. At the end, tell me what to review.'
  },
  {
    cat: 'learn', audience: 'all',
    title: 'Create a learning plan',
    prompt: 'Create a 4-week learning plan for someone starting [skill or topic] from scratch. I have about [X hours] a week. One realistic goal per week, with a small practice task. Suggest the kinds of free resources to look for, rather than specific links that might not exist.'
  },
  {
    cat: 'learn', audience: 'pro',
    title: 'Explain a CVE and its business impact',
    prompt: 'Explain this vulnerability for a briefing to non-technical leadership.\n' +
      'CVE ID: [ID]\n' +
      'Description and affected versions: [paste from the vendor advisory or NVD]\n' +
      'Our exposure: [e.g. internet-facing, internal only, not sure]\n\n' +
      'Base your answer only on the details I\'ve pasted — if you don\'t recognise this CVE, say so rather than guessing. Cover: what it is in plain English, what an attacker could do, how urgent it is for us given our exposure, and what we should do. Remind me to confirm exploitation status in the CISA Known Exploited Vulnerabilities catalog.'
  },
  {
    cat: 'learn', audience: 'pro',
    title: 'Summarise a threat report for leadership',
    prompt: 'Summarise the threat report or advisory below for leadership. In plain English: the key threats, who is most at risk, and what an organisation like ours ([size / sector]) should do — prioritised. One page maximum, no jargon. Only use what\'s in the report.\n\n[Paste the report or advisory text here]'
  },

  // ── YOUR DAY-TO-DAY ──
  {
    cat: 'life', audience: 'all',
    title: 'Help me prioritise my day',
    prompt: 'Here are my tasks for today, with any deadlines. I have about [X hours] available. Sort them by urgency and importance, suggest a realistic order with rough times, and tell me what could be delegated, moved or dropped.\n\n[List your tasks here]'
  },
  {
    cat: 'life', audience: 'all',
    title: 'Prepare for a difficult conversation',
    prompt: 'I need to have a difficult conversation with [e.g. my manager, a colleague, a family member] about [topic]. What I want to come out of it: [outcome]. Help me prepare: the key points to make, an opening line, how they might react and how I could respond, and how to keep it calm and constructive. Give me wording I can actually use.'
  },
  {
    cat: 'life', audience: 'all',
    title: 'Write a complaint to a business',
    prompt: 'Help me write a clear, firm complaint to [business] about [issue].\n' +
      'What happened: [facts, dates, order or reference number]\n' +
      'What I want: [refund / repair / replacement / apology]\n\n' +
      'Be professional but not a pushover. If my rights under the Australian Consumer Law are relevant, mention them in plain terms. Under 250 words.'
  },
  {
    cat: 'life', audience: 'all',
    title: 'Turn a rough idea into a plan',
    prompt: 'I have an idea that isn\'t fully formed: [describe it in a few sentences]. Before you answer, ask me up to 5 questions you need answered. Then give me a step-by-step plan with realistic timelines, the first thing to do this week, and the biggest risks.'
  },
  {
    cat: 'life', audience: 'all',
    title: 'Questions to ask at a job interview',
    prompt: 'I have an interview for a [job title] role at [type of organisation]. Here\'s the job ad: [paste it]. Suggest 5–8 genuine questions to ask the interviewer about the role, the team and the culture — specific to this job, not generic — and briefly say what each one helps me find out.'
  },
  {
    cat: 'life', audience: 'all',
    title: 'Write a performance self-assessment',
    prompt: 'Help me write a self-assessment for my performance review. Highlight my contributions with their impact, be honest about areas to grow, and suggest goals for the next period. Tone: confident, not boastful. About 300–400 words. Only use achievements from my notes — don\'t invent any.\n\nMy notes:\n[paste your notes]'
  },
  {
    cat: 'life', audience: 'all',
    title: 'Help me negotiate something',
    prompt: 'I need to negotiate [salary / contract terms / a price / a deadline] with [person or organisation].\n' +
      'Current situation or offer: [describe]\n' +
      'What I want: [goal]\n' +
      'What I could give or trade: [options]\n\n' +
      'Help me prepare: my opening position, my walk-away point, trade-offs, what to avoid saying, and specific wording I can use.'
  },
];

var currentCat      = 'all';
var currentAudience = 'all'; // 'all' = everyone, 'pro' = show pro prompts too

function renderAudienceToggle() {
  var toggle = document.getElementById('audience-toggle');
  if (!toggle) return;
  toggle.querySelectorAll('.ag-audience-btn').forEach(function(btn) {
    var active = btn.dataset.audience === currentAudience;
    btn.classList.toggle('ag-audience-btn--active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function renderCatFilter() {
  var bar = document.getElementById('cat-filter-bar');
  if (!bar) return;
  bar.innerHTML = CATS.map(function(c) {
    var active = c.id === currentCat;
    return '<button type="button" class="ag-cat-btn' + (active ? ' ag-cat-btn--active' : '') + '" data-cat="' + esc(c.id) + '" aria-pressed="' + active + '">' + esc(c.label) + '</button>';
  }).join('');
}

function renderPrompts() {
  var grid = document.getElementById('prompt-grid');
  if (!grid) return;
  var filtered = PROMPTS.filter(function(p) {
    var catMatch      = currentCat === 'all' || p.cat === currentCat;
    var audienceMatch = currentAudience === 'pro' || p.audience !== 'pro';
    return catMatch && audienceMatch;
  });
  if (!filtered.length) {
    grid.innerHTML = '<div class="ag-empty">No prompts in this category yet.</div>';
    return;
  }
  grid.innerHTML = filtered.map(function(p, i) {
    var id = 'prompt-' + i;
    var cat = CATS.find(function(c) { return c.id === p.cat; });
    var proTag = p.audience === 'pro' ? '<span class="ag-prompt-pro">Security &amp; IT</span>' : '';
    return '<div class="ag-prompt-card">' +
      '<div class="ag-prompt-meta">' +
        '<span class="ag-prompt-cat">' + esc(cat ? cat.label : p.cat) + '</span>' +
        proTag +
      '</div>' +
      '<h3 class="ag-prompt-title">' + esc(p.title) + '</h3>' +
      '<pre class="ag-prompt-text" id="' + id + '">' + esc(p.prompt) + '</pre>' +
      '<button type="button" class="ag-copy-btn" data-prompt-id="' + id + '">Copy prompt</button>' +
    '</div>';
  }).join('');
}

function copyPrompt(id, btn) {
  var el = document.getElementById(id);
  if (!el) return;
  var done = function() {
    btn.textContent = 'Copied ✓';
    btn.classList.add('ag-copy-btn--done');
    setTimeout(function() {
      btn.textContent = 'Copy prompt';
      btn.classList.remove('ag-copy-btn--done');
    }, 2000);
  };
  navigator.clipboard.writeText(el.textContent).then(done).catch(function() {
    var range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    done();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderAudienceToggle();
  renderCatFilter();
  renderPrompts();

  var toggle = document.getElementById('audience-toggle');
  if (toggle) {
    toggle.addEventListener('click', function(e) {
      var btn = e.target.closest('.ag-audience-btn');
      if (!btn) return;
      currentAudience = btn.dataset.audience;
      renderAudienceToggle();
      renderPrompts();
    });
  }

  var cats = document.getElementById('cat-filter-bar');
  if (cats) {
    cats.addEventListener('click', function(e) {
      var btn = e.target.closest('.ag-cat-btn');
      if (!btn) return;
      currentCat = btn.dataset.cat;
      renderCatFilter();
      renderPrompts();
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
