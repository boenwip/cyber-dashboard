/**
 * ai-guide.js — pseudosec. AI Guide
 * Prompt library rendering and filtering
 */

var PROMPTS = [
  // ── WRITING ──
  { cat: 'writing', title: 'Summarise a long document', prompt: 'Summarise the following document in 3 bullet points, then write one paragraph suitable for sharing with non-technical staff:\n\n[paste document text here]' },
  { cat: 'writing', title: 'Rewrite for plain English', prompt: 'Rewrite the following in plain English for someone with no technical background. Keep it under 150 words:\n\n[paste text here]' },
  { cat: 'writing', title: 'Create a policy one-pager', prompt: 'Write a one-page summary of the following policy for staff. Use short paragraphs, bullet points where helpful, and plain language. Include a "what this means for you" section at the end:\n\n[paste policy or key points here]' },
  { cat: 'writing', title: 'Draft meeting notes', prompt: 'Based on the following rough notes, write clean, professional meeting minutes with: date, attendees, key decisions, action items, and next steps:\n\n[paste your rough notes here]' },
  { cat: 'writing', title: 'Write a training module intro', prompt: 'Write an engaging introduction for a training module on [topic]. Target audience: [describe audience, e.g. frontline staff with no tech background]. Tone: friendly and approachable. Length: 100–150 words.' },
  // ── EMAIL ──
  { cat: 'email', title: 'Professional follow-up email', prompt: 'Write a professional follow-up email to [name/role] about [topic]. Context: [one sentence of context]. Tone: polite but direct. Include a clear call to action.' },
  { cat: 'email', title: 'Decline a request politely', prompt: 'Write a polite email declining [request] from [sender]. Reason: [brief reason]. Keep it brief, professional, and leave the door open for future contact.' },
  { cat: 'email', title: 'Escalation email to leadership', prompt: 'Write a brief escalation email to [role] about [issue]. Include: what the issue is, why it matters, what\'s been tried, and what decision or support is needed. Tone: urgent but measured.' },
  { cat: 'email', title: 'Staff awareness announcement', prompt: 'Write a brief staff announcement about [topic, e.g. a new security policy, a scam to watch out for]. Keep it under 150 words. Include one clear action staff should take.' },
  { cat: 'email', title: 'Respond to a complaint', prompt: 'Write a professional response to a complaint about [issue]. Acknowledge the concern without admitting fault, explain what is being done, and provide a clear next step. Tone: empathetic and solution-focused.' },
  // ── LEARNING ──
  { cat: 'learning', title: 'Explain a concept simply', prompt: 'Explain [concept, e.g. phishing, ransomware, multi-factor authentication] as if I\'m a complete beginner. Use a real-world analogy. Keep it under 200 words.' },
  { cat: 'learning', title: 'Quiz me on a topic', prompt: 'Give me 5 multiple choice questions to test my understanding of [topic]. Include the correct answer and a one-sentence explanation after each question.' },
  { cat: 'learning', title: 'Learning plan for a skill', prompt: 'Create a 4-week learning plan for someone who wants to learn [skill/topic] starting from scratch. Include free resources where possible. One realistic task per week.' },
  { cat: 'learning', title: 'Summarise a concept as a table', prompt: 'Create a comparison table explaining the differences between [concept A] and [concept B]. Include: what it is, when it\'s used, key risks, and who it affects.' },
  { cat: 'learning', title: 'Turn jargon into plain English', prompt: 'I received this technical message and don\'t understand it. Explain what it means in plain English and what (if anything) I should do:\n\n[paste message here]' },
  // ── ADMIN ──
  { cat: 'admin', title: 'Create an agenda', prompt: 'Create a structured agenda for a [duration] meeting on [topic]. Include time allocations for each item. Attendees: [list roles]. Goal: [one sentence stating the meeting outcome].' },
  { cat: 'admin', title: 'Write a job ad', prompt: 'Write a job advertisement for a [role title] position at a [type of organisation] in Queensland, Australia. Include: role summary, key responsibilities (5–7 dot points), required qualifications, and a brief "about us" section. Tone: professional but welcoming.' },
  { cat: 'admin', title: 'Project status update', prompt: 'Write a brief project status update for [project name] for [audience, e.g. leadership team]. Format: traffic light status (Red/Amber/Green), one paragraph summary, key accomplishments this period, risks, and next steps.' },
  { cat: 'admin', title: 'Create a checklist', prompt: 'Create a step-by-step checklist for [process, e.g. onboarding a new employee, responding to a data breach]. Each step should be a clear, single action.' },
  // ── SECURITY ──
  { cat: 'security', title: 'Spot a phishing email', prompt: 'I received the following email and I\'m not sure if it\'s legitimate. Analyse it for signs of phishing. Check the sender, links, urgency, and content. Tell me what\'s suspicious and what I should do:\n\n[paste email text — do not include any personal data]' },
  { cat: 'security', title: 'Write a security awareness tip', prompt: 'Write a short, engaging security awareness tip about [topic, e.g. password hygiene, spotting scams, using public Wi-Fi]. Suitable for sharing on an intranet or in a staff newsletter. Include one practical action. Under 100 words.' },
  { cat: 'security', title: 'Explain a CVE to non-technical staff', prompt: 'Explain the following CVE in plain English for non-technical staff. What is it, does it affect us, and what do they need to do (if anything):\n\nCVE ID: [paste CVE ID]\nDescription: [paste brief description]' },
  { cat: 'security', title: 'Draft an incident communication', prompt: 'Draft a staff communication about a [type of incident, e.g. phishing campaign, system outage, data breach notification]. Audience: all staff. Include: what happened (in general terms), what the risk is, what action staff should take, and who to contact. Do not include specific technical details or client information.' },
  { cat: 'security', title: 'Review a policy for gaps', prompt: 'Review the following policy and identify: any gaps in coverage, anything that is unclear or ambiguous, recommendations to improve it, and anything that may not comply with Australian Privacy Act requirements. Provide your response as a structured list:\n\n[paste policy text — anonymise before pasting]' },
];

var currentCat = 'all';

function renderPrompts() {
  var grid = document.getElementById('prompt-grid');
  if (!grid) return;
  var filtered = PROMPTS.filter(function(p) {
    return currentCat === 'all' || p.cat === currentCat;
  });
  if (!filtered.length) {
    grid.innerHTML = '<div class="ag-empty">No prompts in this category.</div>';
    return;
  }
  grid.innerHTML = filtered.map(function(p, i) {
    var id = 'prompt-' + i;
    return '<div class="ag-prompt-card">' +
      '<div class="ag-prompt-cat">' + p.cat + '</div>' +
      '<div class="ag-prompt-title">' + p.title.replace(/</g,'&lt;') + '</div>' +
      '<pre class="ag-prompt-text" id="' + id + '">' + p.prompt.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>' +
      '<button class="ag-copy-btn" onclick="copyPrompt(\'' + id + '\', this)" aria-label="Copy prompt">' +
        'Copy prompt' +
      '</button>' +
    '</div>';
  }).join('');
}

function filterPrompts(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.ag-cat-btn').forEach(function(b) {
    b.classList.remove('ag-cat-btn--active');
  });
  btn.classList.add('ag-cat-btn--active');
  renderPrompts();
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
    // Fallback for older browsers
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

document.addEventListener('DOMContentLoaded', renderPrompts);
