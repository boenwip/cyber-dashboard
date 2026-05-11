/**
 * definitions.js — PseudoSec
 * 50 cyber security terms for the glossary and word of the day
 */

var DEFINITIONS = [
  {
    term: "Phishing",
    short: "A scam where attackers pretend to be someone you trust to steal your information.",
    full: "Phishing is when a cybercriminal sends you a message — usually an email — pretending to be a trusted organisation like your bank, the ATO, or Australia Post. The goal is to trick you into clicking a link, entering your login details, or opening an attachment that installs malware. It remains the number one attack method used against Australians.",
    example: "You receive an email from 'anz-secure@anz-alerts.com' asking you to verify your account. The domain isn't really ANZ — it just looks similar.",
    level: "beginner"
  },
  {
    term: "Ransomware",
    short: "Malicious software that locks your files and demands payment to unlock them.",
    full: "Ransomware is a type of malware that encrypts your files — making them completely inaccessible — then demands a ransom payment (usually in cryptocurrency) to restore access. Even if you pay, there's no guarantee you'll get your files back. It can spread across an entire organisation's network in hours. The ACSC recorded ransomware as the most disruptive cybercrime type in FY2024–25.",
    example: "A Queensland hospital's patient records become encrypted overnight. A note appears demanding $50,000 in Bitcoin within 72 hours.",
    level: "beginner"
  },
  {
    term: "Two-Factor Authentication",
    short: "A second security check beyond your password — usually a code sent to your phone.",
    full: "Two-factor authentication (2FA) means logging in requires two things: something you know (your password) and something you have (a code from your phone or authenticator app). Even if a criminal steals your password, they still can't access your account without that second factor. Enabling 2FA on your email and banking accounts is the single most effective thing most Australians can do to improve their security.",
    example: "After entering your password, your bank sends a 6-digit code to your mobile. You enter that code to complete the login.",
    level: "beginner"
  },
  {
    term: "Malware",
    short: "Any software designed to harm your device, steal data, or give attackers access.",
    full: "Malware is a catch-all term for malicious software — programs created specifically to cause harm. It includes viruses (self-replicating), trojans (disguised as legitimate software), spyware (silently watching what you do), and ransomware. Malware can arrive via email attachments, fake software downloads, malicious ads, or infected USB drives.",
    example: "You download what looks like a free PDF editor. It installs and works, but in the background it's recording everything you type.",
    level: "beginner"
  },
  {
    term: "Social Engineering",
    short: "Manipulating people into revealing information or taking actions they shouldn't.",
    full: "Social engineering attacks exploit human psychology rather than technical vulnerabilities. Attackers build trust, create urgency, or exploit authority to get someone to hand over credentials, transfer money, or install software. It's far easier to convince a person to click a link than to hack through a firewall. Most data breaches begin with some form of social engineering.",
    example: "Someone calls your IT department claiming to be a new employee who's locked out. They sound stressed and convincing — and the help desk resets their password without verification.",
    level: "beginner"
  },
  {
    term: "VPN",
    short: "A Virtual Private Network encrypts your internet connection to protect your privacy.",
    full: "A VPN (Virtual Private Network) creates an encrypted tunnel between your device and the internet. Anyone monitoring your network — like your internet provider, hackers on public Wi-Fi, or your employer — can't see what you're doing. VPNs are especially important on public networks like airport or cafe Wi-Fi. Note: a VPN protects your connection, not your device — it won't stop malware.",
    example: "Connecting to airport Wi-Fi is risky. With a VPN running, your connection is encrypted and can't be read by others on the same network.",
    level: "beginner"
  },
  {
    term: "Data Breach",
    short: "When private information is accessed, stolen, or exposed without permission.",
    full: "A data breach occurs when sensitive information — passwords, credit card numbers, health records, personal details — is accessed by someone who shouldn't have it. Breaches can be caused by hacking, insider threats, lost devices, or accidentally leaving data publicly accessible. Australia's Notifiable Data Breaches scheme requires organisations to report significant breaches to the OAIC.",
    example: "A retailer's database is hacked and 2 million customer email addresses and hashed passwords are stolen and posted online.",
    level: "beginner"
  },
  {
    term: "Password Manager",
    short: "An app that securely stores and generates strong passwords for all your accounts.",
    full: "A password manager stores all your passwords in an encrypted vault, protected by one strong master password. It can generate long, random, unique passwords for every site — so you never reuse passwords. This is critical because password reuse is how a breach at one small site can lead to your bank account being compromised. Recommended options include Bitwarden (free, open-source), 1Password, and Dashlane.",
    example: "Instead of using 'fluffy2018' everywhere, your password manager generates 'kX$9mP#2nQvL' for each site and remembers it automatically.",
    level: "beginner"
  },
  {
    term: "Zero-Day",
    short: "A security vulnerability that's unknown to the software maker — and has no patch yet.",
    full: "A zero-day vulnerability is a security flaw that the software vendor doesn't know about. Attackers who discover these can exploit them freely until a patch is released — which is why they're extremely valuable on criminal markets. Nation-state hackers often stockpile zero-days for use in targeted attacks. The name comes from 'zero days' of warning before exploitation begins.",
    example: "Researchers discover a flaw in Windows that allows attackers to run any code they want without admin rights. Microsoft has zero days to fix it before it's being exploited.",
    level: "intermediate"
  },
  {
    term: "Firewall",
    short: "A security barrier that monitors and controls what traffic can enter or leave a network.",
    full: "A firewall acts as a gatekeeper between your network and the internet, blocking connections that don't meet defined rules. Modern firewalls can inspect content, not just ports, to detect and block suspicious behaviour. Most home routers have a basic built-in firewall. Enterprise firewalls are significantly more sophisticated and can detect threats in encrypted traffic.",
    example: "Your home router's firewall automatically blocks incoming connections from unknown sources, preventing direct attacks on your devices.",
    level: "beginner"
  },
  {
    term: "Encryption",
    short: "Scrambling data so only authorised parties can read it.",
    full: "Encryption transforms readable data into unreadable ciphertext using mathematical algorithms and a key. Only someone with the correct decryption key can reverse it. Modern encryption (AES-256, RSA) is practically unbreakable with current technology. Your banking app, WhatsApp messages, and HTTPS websites all use encryption to protect your data in transit.",
    example: "When you send a message on WhatsApp, it's encrypted on your phone and can only be decrypted on the recipient's device — WhatsApp itself can't read it.",
    level: "beginner"
  },
  {
    term: "Business Email Compromise",
    short: "A scam where attackers impersonate executives or suppliers to fraudulently transfer money.",
    full: "Business Email Compromise (BEC) is one of the most financially damaging cybercrimes. Attackers either hack into or spoof a business email account — often a CEO or financial controller — and instruct an employee to transfer funds urgently. The requests seem legitimate and often come with plausible context. BEC cost Australian businesses hundreds of millions of dollars in FY2024–25.",
    example: "An accounts payable officer receives an email appearing to come from the CEO's address: 'I'm in a meeting, can you urgently process this $85,000 payment to our new supplier — details attached.'",
    level: "beginner"
  },
  {
    term: "Multi-Factor Authentication",
    short: "Using two or more different types of proof to verify your identity before login.",
    full: "Multi-factor authentication (MFA) extends two-factor authentication to potentially include more factors: something you know (password), something you have (phone/token), and something you are (fingerprint, face ID). MFA is the most effective defence against account takeover. The ACSC strongly recommends enabling MFA on all critical accounts — email, banking, cloud storage, and social media.",
    example: "Logging into your work system requires your password, then approving a push notification on your phone, then scanning your fingerprint.",
    level: "beginner"
  },
  {
    term: "Spear Phishing",
    short: "A highly targeted phishing attack using personal details to appear more convincing.",
    full: "While regular phishing casts a wide net, spear phishing is tailored specifically to you. Attackers research their target — your name, job title, colleagues, recent activities — and craft a convincing message. A spear phish might reference your actual manager's name, a real project you're working on, or your specific bank. Executives and finance staff are the most common targets.",
    example: "An email arrives from what looks like your colleague's address: 'Hi Sarah — here's the invoice for last week's conference I mentioned. Can you process it?' The email address is off by one character.",
    level: "intermediate"
  },
  {
    term: "Patch",
    short: "A software update that fixes security vulnerabilities or bugs.",
    full: "Patches are updates released by software vendors to fix known vulnerabilities. Unpatched systems are one of the leading causes of successful cyberattacks — attackers routinely scan the internet for systems running vulnerable software versions. The ACSC's Essential Eight recommends patching operating systems within 48 hours for critical vulnerabilities and two weeks for others.",
    example: "Microsoft releases a patch for a critical Windows flaw on Patch Tuesday. Organisations that apply it quickly are protected; those that don't may be compromised within days.",
    level: "beginner"
  },
  {
    term: "Credential Stuffing",
    short: "Using stolen username/password combinations from one breach to attack other accounts.",
    full: "When credentials are stolen in a data breach, criminals compile them into lists and automatically try them against other services — banking, email, shopping sites. If you use the same password across sites, one breach elsewhere can compromise all your accounts. This is called credential stuffing. It's entirely automated and can test millions of accounts per hour.",
    example: "Your password is stolen in a gaming forum breach. Attackers automatically try it on Gmail, PayPal, and your banking app within hours.",
    level: "intermediate"
  },
  {
    term: "Threat Actor",
    short: "Any individual or group responsible for a cyberattack or security incident.",
    full: "Threat actors are categorised by motivation and sophistication. Cybercriminals seek financial gain. Nation-state actors (like groups linked to Russia, China, North Korea, and Iran) conduct espionage, sabotage critical infrastructure, or steal intellectual property. Hacktivists attack for political reasons. Insider threats are employees who misuse their access. Understanding who is attacking and why helps defenders prioritise.",
    example: "The ACSC attributes a ransomware campaign targeting Australian healthcare providers to a criminal group operating out of Eastern Europe.",
    level: "intermediate"
  },
  {
    term: "Incident Response",
    short: "The process of detecting, containing, and recovering from a cyberattack.",
    full: "Incident response (IR) is the structured approach organisations use when a security incident occurs. The phases typically include: preparation, detection, containment, eradication, recovery, and lessons learned. Having an IR plan before an incident occurs is critical — decisions made in the first hours after a breach significantly affect the outcome. Australia's ACSC runs a 24/7 Cyber Security Hotline at 1300 CYBER1.",
    example: "An organisation detects ransomware spreading across its network at 2am. Their incident response plan dictates isolating affected systems, notifying leadership, and calling their external IR firm immediately.",
    level: "intermediate"
  },
  {
    term: "Attack Surface",
    short: "The total number of entry points through which an attacker could try to get in.",
    full: "Your attack surface is everything exposed to potential attackers — every device, application, open port, employee account, and third-party integration. As organisations grow, the attack surface expands. Reducing your attack surface (by removing unused services, applying least privilege, and keeping software updated) is a core principle of defence. Remote work significantly expanded attack surfaces for most Australian organisations.",
    example: "A small business with 10 employees has 10 laptops, 10 email accounts, a cloud accounting system, and a website. Each represents a potential entry point.",
    level: "intermediate"
  },
  {
    term: "Penetration Testing",
    short: "A simulated cyberattack performed by security professionals to find weaknesses before criminals do.",
    full: "Penetration testing (pen testing) involves authorised security professionals attempting to break into systems using the same techniques real attackers use. The goal is to find vulnerabilities before criminals do. Reports identify weaknesses, their severity, and recommended fixes. Regular pen testing is considered best practice and is required by many regulatory frameworks.",
    example: "A bank hires a security firm to try to hack their internet banking platform. The testers find that session tokens don't expire, allowing account hijacking. The bank fixes it before any criminal discovers the same flaw.",
    level: "intermediate"
  },
  {
    term: "Darknet",
    short: "Encrypted, anonymous parts of the internet often used for illegal activity.",
    full: "The darknet (often called dark web) is a part of the internet that requires special software like Tor to access and is not indexed by search engines. While it has legitimate privacy uses, it's also where stolen data, malware, and criminal services are bought and sold. Australian data breaches frequently result in stolen credentials appearing on darknet marketplaces within days.",
    example: "After a company's database is breached, security researchers find millions of Australian customer records for sale on a darknet forum for $500.",
    level: "intermediate"
  },
  {
    term: "OSINT",
    short: "Open-Source Intelligence — gathering information from publicly available sources.",
    full: "OSINT refers to the collection and analysis of information from publicly available sources — social media, company websites, job postings, public records, and more. Security professionals use OSINT to understand their own exposure. Attackers use it to research targets before an attack. Seemingly harmless public information — your job title, email format, org chart — can be weaponised in a social engineering attack.",
    example: "Before attacking a company, a criminal browses LinkedIn to identify the CFO's name, email format, and which accounting software the company uses — all public information.",
    level: "intermediate"
  },
  {
    term: "Supply Chain Attack",
    short: "Attacking a target by first compromising a trusted third-party supplier or tool they use.",
    full: "Supply chain attacks target the less-secure elements in an organisation's trusted relationships. Rather than attacking a well-defended target directly, criminals compromise a software vendor, managed service provider, or hardware supplier, then use that trusted access to reach the real target. The 2020 SolarWinds attack compromised thousands of organisations worldwide via a software update. Australia's healthcare and government sectors are frequently targeted via this method.",
    example: "An accounting firm uses a popular bookkeeping plugin. Attackers compromise the plugin's update server and push malicious code to all 10,000 users simultaneously.",
    level: "intermediate"
  },
  {
    term: "Man-in-the-Middle Attack",
    short: "When an attacker secretly intercepts communications between two parties.",
    full: "A man-in-the-middle (MitM) attack occurs when an attacker positions themselves between two communicating parties — silently reading, altering, or injecting data into the conversation. Both parties believe they're communicating directly. Common attack methods include ARP spoofing on local networks and evil twin Wi-Fi hotspots. HTTPS and certificate validation are the primary defences.",
    example: "At a cafe, an attacker creates a Wi-Fi hotspot named 'CafeWifi'. When you connect and visit your banking site, the attacker can see the traffic before it reaches the bank.",
    level: "intermediate"
  },
  {
    term: "SQL Injection",
    short: "Inserting malicious database commands into web form fields to manipulate the database.",
    full: "SQL injection is one of the oldest and most common web application vulnerabilities. Attackers insert SQL code into input fields (login forms, search boxes) that gets executed by the database backend. This can expose all stored data, modify records, delete databases, or bypass authentication entirely. Despite being a well-understood vulnerability, it remains common in poorly built web applications.",
    example: "A login form expects a username. An attacker enters: ' OR '1'='1. The database query returns true for every row, granting access without a valid password.",
    level: "intermediate"
  },
  {
    term: "Brute Force Attack",
    short: "Systematically trying every possible password combination until the correct one is found.",
    full: "Brute force attacks use automated tools to guess passwords by trying every possible combination. Simple passwords can be cracked in seconds with modern hardware. Dictionary attacks use wordlists of common passwords. Credential stuffing uses known password lists. Defences include account lockouts, rate limiting, CAPTCHA, and strong passwords. A 12-character random password takes billions of years to brute force.",
    example: "An attacker runs software against a login page, trying 100,000 password combinations per second. The account has no lockout policy and is using 'Summer2024'.",
    level: "beginner"
  },
  {
    term: "Endpoint",
    short: "Any device that connects to a network — laptops, phones, servers, printers.",
    full: "An endpoint is any device that connects to your network: laptops, desktops, smartphones, tablets, servers, printers, and IoT devices. Each endpoint is a potential entry point for attackers. Endpoint security involves keeping these devices patched, running security software, enforcing encryption, and monitoring for suspicious behaviour. The explosion of remote work has significantly expanded the number of endpoints organisations need to secure.",
    example: "An employee's personal phone connects to the company Wi-Fi to read work email. That phone is now an endpoint — if it's compromised, it could provide access to company resources.",
    level: "beginner"
  },
  {
    term: "Least Privilege",
    short: "Only giving users and systems the minimum access they need — nothing more.",
    full: "The principle of least privilege means every user, system, and application should have only the minimum permissions needed to do their job. If an account is compromised, limiting its privileges limits the damage an attacker can do. In practice this means: regular employees shouldn't have admin rights, applications shouldn't run as root, and access should be reviewed regularly and revoked when no longer needed.",
    example: "A payroll officer can view and edit payroll data but can't access the customer database or network infrastructure — they don't need it for their job.",
    level: "intermediate"
  },
  {
    term: "Threat Intelligence",
    short: "Information about current threats, attackers, and attack methods used to improve defences.",
    full: "Threat intelligence is evidence-based knowledge about threats — who's attacking, how, why, and what they're targeting. It helps organisations prioritise defences, understand their risk landscape, and detect attacks faster. Sources include government agencies like the ACSC, commercial vendors, information sharing groups, and open-source research. Consuming good threat intelligence is what separates reactive security from proactive security.",
    example: "The ACSC publishes an advisory that a criminal group is actively targeting Australian aged care providers using a specific phishing template — providers can immediately check for and block it.",
    level: "intermediate"
  },
  {
    term: "Vulnerability",
    short: "A weakness in software, hardware, or process that could be exploited by an attacker.",
    full: "A vulnerability is any weakness that could be exploited. It could be in software code (a bug that allows unexpected behaviour), hardware design, configuration (leaving default passwords), or process (no verification before resetting passwords). Vulnerabilities are assigned CVE numbers and scored by severity. The goal of security is to reduce vulnerabilities and ensure those that exist are mitigated before attackers can exploit them.",
    example: "An unpatched web server runs Apache 2.4.48. A publicly known vulnerability (CVE-2021-41773) in that version allows attackers to read files outside the web root.",
    level: "intermediate"
  },
  {
    term: "Dark Web Monitoring",
    short: "Scanning darknet forums and markets for stolen data belonging to you or your organisation.",
    full: "Dark web monitoring services continuously scan illicit forums, marketplaces, and data dumps for your email addresses, credentials, credit card numbers, or company data. When found, you're alerted so you can change passwords and take protective action before attackers exploit the stolen data. Services like HaveIBeenPwned (run by Australian Troy Hunt) provide free personal monitoring.",
    example: "A dark web monitoring service alerts a business that 200 employee email/password combinations from a third-party tool breach are being sold on a criminal forum.",
    level: "beginner"
  },
  {
    term: "CVE",
    short: "Common Vulnerabilities and Exposures — the standard system for naming security flaws.",
    full: "CVE (Common Vulnerabilities and Exposures) is a public database of known security vulnerabilities, each assigned a unique identifier (e.g. CVE-2024-12345). Each CVE gets a CVSS score from 0-10 indicating severity. Critical vulnerabilities (9.0+) require immediate attention. The system allows vendors, security teams, and researchers to clearly communicate about specific flaws. The US CISA maintains a Known Exploited Vulnerabilities catalog of CVEs being actively used in attacks.",
    example: "You see 'CVE-2024-21413 (CVSS 9.8)' in a security alert. The number identifies the specific flaw; the score tells you it's critical and needs immediate patching.",
    level: "intermediate"
  },
  {
    term: "Smishing",
    short: "Phishing conducted via SMS text message.",
    full: "Smishing is SMS phishing — fraudulent text messages designed to trick recipients into clicking malicious links, calling fake numbers, or revealing personal information. Common in Australia include fake Australia Post delivery notices, ATO refund scams, and 'suspicious activity' bank alerts. Never click links in unexpected SMS messages — always go directly to the organisation's official website.",
    example: "You receive: 'Australia Post: Your parcel requires a $3.50 customs fee. Pay now to avoid return: [link]'. The link leads to a fake payment page that steals your card details.",
    level: "beginner"
  },
  {
    term: "Identity Theft",
    short: "When someone uses your personal information to impersonate you for financial gain or fraud.",
    full: "Identity theft occurs when criminals use your personal information — name, date of birth, Medicare number, driver's licence, Tax File Number — to open accounts, take out loans, access services, or commit fraud in your name. Recovery can take years. Australia's myGovID and Services Australia have specific processes for reporting and recovering from identity theft. Reporting to IDCARE (1800 595 160) is the recommended first step.",
    example: "Using details from a data breach, a criminal opens three credit cards in your name and racks up $40,000 in debt before you notice a credit inquiry you didn't make.",
    level: "beginner"
  },
  {
    term: "Botnet",
    short: "A network of hacked computers controlled remotely by a criminal to launch attacks.",
    full: "A botnet is a collection of internet-connected devices (computers, phones, routers, smart TVs) infected with malware and controlled remotely without the owners' knowledge. Botnets are used to send spam, conduct DDoS attacks, crack passwords, mine cryptocurrency, or distribute malware. Your device could be part of a botnet right now without any visible symptoms.",
    example: "100,000 infected home routers in Australia are simultaneously used to flood a government website with fake traffic, making it unavailable — a DDoS attack conducted by a botnet.",
    level: "intermediate"
  },
  {
    term: "DDoS",
    short: "Distributed Denial of Service — overwhelming a server with traffic to make it unavailable.",
    full: "A Distributed Denial of Service (DDoS) attack floods a target — website, server, or network — with so much fake traffic that it can't respond to legitimate requests. Attacks originate from thousands of compromised devices (a botnet). DDoS attacks are often used against financial services, critical infrastructure, and government. Australian organisations experience DDoS attacks regularly, with attacks becoming larger and more sophisticated each year.",
    example: "A bank's internet banking site receives 10 million fake requests per second from a botnet. The servers can't cope and legitimate customers can't log in.",
    level: "intermediate"
  },
  {
    term: "Essential Eight",
    short: "The ACSC's eight baseline security controls every Australian organisation should implement.",
    full: "The Essential Eight is the Australian Signals Directorate's (ASD) prioritised set of mitigation strategies to protect against cyber threats. The eight controls are: application control, patch applications, configure Microsoft Office macro settings, user application hardening, restrict admin privileges, patch operating systems, multi-factor authentication, and regular backups. Organisations are assessed against three maturity levels. Government entities and critical infrastructure operators are required to achieve Maturity Level Two.",
    example: "An organisation implements all Essential Eight controls. When ransomware arrives via email, application control blocks it from executing, and recent backups mean no ransom payment is needed.",
    level: "intermediate"
  },
  {
    term: "Secure Password",
    short: "A password that is long, random, and unique to each account.",
    full: "A secure password is at least 12 characters long, randomly generated, and never reused across different accounts. Length matters more than complexity — 'correct-horse-battery-staple' is stronger than 'P@ssw0rd!'. Passphrases (random words strung together) are both strong and memorable. The ACSC recommends using a password manager to generate and store unique passwords for every account.",
    example: "'Tr0ub4dor&3' looks complex but is known from a famous comic strip. 'sunfish-trowel-runway-9' is longer, more random, and easier to remember.",
    level: "beginner"
  },
  {
    term: "Honeypot",
    short: "A decoy system designed to attract and monitor attackers.",
    full: "A honeypot is a decoy resource — fake server, fake credentials, fake file — set up specifically to attract attackers. When someone interacts with it, security teams get an alert (no legitimate user should ever access it) and can study attacker behaviour. Honeypots are used for early warning, threat intelligence gathering, and distracting attackers away from real assets.",
    example: "A company places a fake server named 'payroll-backup' on their network. When an attacker scanning the network connects to it, the security team is immediately alerted to the intrusion.",
    level: "intermediate"
  },
  {
    term: "Whaling",
    short: "A spear phishing attack specifically targeting senior executives.",
    full: "Whaling is a form of spear phishing that targets 'big fish' — CEOs, CFOs, board members, and other senior executives. Because executives have broad access and financial authority, compromising their accounts is extremely valuable. Attackers invest significant research time to craft convincing, personalised attacks. Often the goal is to trick an executive into authorising a large fraudulent transfer or surrendering credentials.",
    example: "The CFO receives what appears to be a board document requiring urgent signature. The attachment installs malware that captures banking credentials.",
    level: "intermediate"
  },
  {
    term: "Backup",
    short: "Copies of your data stored separately so you can recover from loss or attack.",
    full: "Regular backups are the most important recovery tool after a cyberattack. The ACSC recommends following the 3-2-1 rule: three copies of data, on two different media types, with one stored offsite. Critically, backups must be tested — many organisations discover their backups don't work properly only when they desperately need them. Ransomware specifically targets and destroys backups to force ransom payment.",
    example: "An organisation that follows 3-2-1 backup practices is hit by ransomware. They decline to pay, restore from clean backups, and are operational within 24 hours.",
    level: "beginner"
  },
  {
    term: "API Security",
    short: "Protecting the interfaces that allow different software systems to communicate.",
    full: "APIs (Application Programming Interfaces) allow apps and services to talk to each other. They're everywhere — your banking app uses APIs to retrieve your balance; websites use APIs to process payments. Insecure APIs are a major and growing attack vector. Common API vulnerabilities include broken authentication, excessive data exposure, and lack of rate limiting. The OWASP API Security Top 10 is the standard reference.",
    example: "A mobile banking app's API returns full account numbers when only the last 4 digits should be visible — a data exposure vulnerability that could affect millions of customers.",
    level: "intermediate"
  },
  {
    term: "Threat Hunting",
    short: "Proactively searching through networks and systems for signs of attackers who haven't been detected.",
    full: "Threat hunting is the proactive search for threats that have evaded automated security tools. Rather than waiting for alerts, trained analysts actively look for signs of compromise — unusual network connections, suspicious process behaviour, unexpected account activity. It's based on the assumption that sophisticated attackers are already inside and automated tools haven't caught them yet.",
    example: "A threat hunter reviewing network logs notices a server making repeated small data transfers to an IP in Singapore at 3am. Investigation reveals a months-old compromise that no alerts had flagged.",
    level: "intermediate"
  },
  {
    term: "Zero Trust",
    short: "A security model that trusts no one by default — every access request must be verified.",
    full: "Zero Trust is a security framework built on the principle of 'never trust, always verify'. Rather than assuming anything inside the network is safe, Zero Trust requires continuous verification of every user, device, and connection — regardless of location. It's particularly relevant as more work happens remotely and in the cloud. The Australian government has mandated Zero Trust architecture for federal agencies.",
    example: "Even after a staff member logs in from the office, every time they access a sensitive system, they must re-authenticate and their device's security posture is checked.",
    level: "intermediate"
  },
  {
    term: "Vishing",
    short: "Voice phishing — scam phone calls that attempt to steal information or money.",
    full: "Vishing (voice phishing) uses phone calls to manipulate victims into revealing sensitive information or transferring money. Attackers often impersonate banks, the ATO, Centrelink, police, or tech support. AI voice cloning has made vishing more sophisticated — attackers can now convincingly replicate the voice of a trusted person. The ATO's impersonation scam hotline (1800 008 540) receives thousands of reports monthly.",
    example: "You receive a call from 'the ATO' claiming you owe $4,200 in unpaid tax and will be arrested unless you purchase gift cards and read the codes over the phone.",
    level: "beginner"
  },
  {
    term: "Insider Threat",
    short: "A security risk that comes from within an organisation — employees, contractors, or partners.",
    full: "Insider threats are security risks posed by people who have authorised access to systems and data. They can be malicious (deliberate theft or sabotage), negligent (accidentally sending sensitive data to the wrong person), or compromised (a legitimate user whose credentials have been stolen). Insider threats are particularly difficult to detect because the access they use appears legitimate.",
    example: "A departing employee downloads client lists and project files before their last day. Three months later, they're selling that data to a competitor.",
    level: "intermediate"
  },
  {
    term: "SIEM",
    short: "Security Information and Event Management — a system that collects and analyses security alerts.",
    full: "A SIEM aggregates logs and security events from across an organisation's entire environment — firewalls, endpoints, servers, applications — and uses rules and AI to detect suspicious patterns. It provides security teams with a single view of security events and enables faster detection and response. Enterprise SIEMs can process billions of events per day and correlate them to identify multi-stage attacks.",
    example: "A SIEM correlates three separate events — a failed login at 2am, a successful login from overseas 10 minutes later, and a large file download — and raises a high-priority alert.",
    level: "intermediate"
  },
  {
    term: "Evil Twin Attack",
    short: "A fake Wi-Fi hotspot that mimics a legitimate one to intercept your traffic.",
    full: "An evil twin attack involves setting up a rogue Wi-Fi access point that looks identical to a legitimate one (same name, similar signal strength). When devices connect to it instead of the real network, the attacker can intercept all unencrypted traffic, redirect users to fake login pages, and inject malicious content. Commonly deployed in airports, hotels, cafes, and conference centres.",
    example: "At a conference centre, an attacker creates a hotspot named 'ConferenceCentre_Guest' — the same name as the real Wi-Fi. Attendees' devices automatically connect to the stronger fake signal.",
    level: "intermediate"
  },
  {
    term: "Digital Footprint",
    short: "All the information about you that exists online — what you've shared and what's been collected.",
    full: "Your digital footprint is the trail of data you leave online — social media posts, account registrations, purchases, location check-ins, comments, and data collected by apps and websites. This information can be found via OSINT and used to craft targeted attacks, answer security questions, or build a profile for identity theft. Reducing your digital footprint (setting accounts to private, using privacy-focused tools) reduces your attack surface as an individual.",
    example: "An attacker searches your name online and finds your LinkedIn (job title, employer, colleagues), Facebook (birthday, hometown, family members), and a forum post with your email — enough to launch a convincing spear phishing attack.",
    level: "beginner"
  },
  {
    term: "Air Gap",
    short: "Physical isolation of a computer or network — no connection to the internet or other networks.",
    full: "An air-gapped system is completely isolated from external networks, including the internet. Data can only enter or leave via physical media (USB drives, discs). Air gaps are used for extremely sensitive systems — nuclear facility controls, classified government networks, critical industrial systems. Attackers have developed sophisticated methods to bridge air gaps, including acoustic, electromagnetic, and thermal covert channels.",
    example: "The control systems for a power station's generators are air-gapped — completely disconnected from the internet. Even if the company's admin network is compromised, attackers can't directly reach the operational technology.",
    level: "intermediate"
  },
  {
    term: "Threat Modelling",
    short: "Systematically identifying what could go wrong and planning how to protect against it.",
    full: "Threat modelling is a structured process for identifying potential threats, attack vectors, and vulnerabilities in a system before it's built or changed. Teams ask: what are we building? What could go wrong? What do we do about it? Common frameworks include STRIDE and PASTA. Building security in from the design stage is significantly cheaper than fixing it after deployment.",
    example: "Before launching a new customer portal, the development team maps all entry points, identifies what data could be exposed if each is compromised, and implements controls for the highest-risk scenarios.",
    level: "intermediate"
  }
];
