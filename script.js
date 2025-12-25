const verbs = {};
let originalData = {}; // Store original data structure
let allOtherVerbsData = []; // Store all other verbs for sorting
let currentSortOrder = 'english'; // Default sort order

// Verb files organized by folders (1-11 and irregular)
const verbFiles = [
  { key: "1", file: "verbs/1/1.json" },
  { key: "1. a- (4a A1)", file: "verbs/1/1._a-_(4a_A1).json" },
  { key: "1A (4B 01)", file: "verbs/1/1A_(4B_01).json" },
  { key: "2 (4A 02)", file: "verbs/2/2_(4A_02).json" },
  { key: "2A (4B 02)", file: "verbs/2/2A_(4B_02).json" },
  { key: "3", file: "verbs/3/3.json" },
  { key: "4", file: "verbs/4/4.json" },
  { key: "5. class (3A 01)", file: "verbs/5/5._class_(3A_01).json" },
  { key: "5. class (3B 01)", file: "verbs/5/5._class_(3B_01).json" },
  { key: "7", file: "verbs/7/7.json" },
  { key: "8y", file: "verbs/8/8y.json" },
  { key: "8W (1k 01)", file: "verbs/8/8W_(1k_01).json" },
  { key: "9", file: "verbs/9/9.json" },
  { key: "irregular", file: "verbs/irregular/irregular.json" }
];

// #region agent log
const fetchStartTime = performance.now();
fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:3',message:'JSON fetch started',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Fetch all verb files in parallel
Promise.all(
  verbFiles.map(({ key, file }) =>
    fetch(file)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load ${file}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => ({ key, data }))
      .catch(error => {
        console.warn(`Failed to load ${file}:`, error);
        return { key, data: null };
      })
  )
)
  .then(results => {
    // #region agent log
    const fetchEndTime = performance.now();
    fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:5',message:'JSON fetch completed',data:{fetchTimeMs:fetchEndTime-fetchStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    const parseStartTime = performance.now();
    fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:7',message:'JSON parse started',data:{dataKeys:results.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Merge all verb data
    for (const { key, data } of results) {
      if (data && data[key]) {
        originalData[key] = data[key];
        // Merge verbs into the main verbs object
        Object.assign(verbs, data[key]);
      }
    }
    
    // #region agent log
    const parseEndTime = performance.now();
    const verbCount = Object.keys(verbs).length;
    fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:45',message:'JSON parse and merge completed',data:{parseTimeMs:parseEndTime-parseStartTime,totalVerbs:verbCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    console.log("All tenses loaded – type በለ and press the button!");
    setupSuggestions();
    displayCommonVerbs();
    displayOtherVerbs();
  })
  .catch(error => {
    console.error("Error loading verb files:", error);
  });

function conjugate(skipHistory = false) {
  // If suggestions are visible, select the first one before conjugating
  if (typeof window.selectFirstSuggestion === 'function') {
    if (window.selectFirstSuggestion()) {
      return; // selectFirstSuggestion already calls conjugate()
    }
  }
  
  const rawInput = document.getElementById('verbInput').value.trim();
  const { matchKey, verb, matches } = findVerb(rawInput);
  const output = document.getElementById('output');
  const commonVerbsSection = document.getElementById('common-verbs-section');

  if (!verb || !matchKey) {
    output.innerHTML = `<p style="color:red;">No match for "${rawInput}". Try በለ or an English gloss like "arrive".</p>`;
    // Show common verbs section if no match found
    if (commonVerbsSection) {
      commonVerbsSection.style.display = 'block';
    }
    
    // Show other verbs section if no match found
    const otherVerbsSection = document.getElementById('other-verbs-section');
    if (otherVerbsSection) {
      otherVerbsSection.style.display = 'block';
    }
    
    // Update history for no-match state
    if (!skipHistory) {
      updateHistory({ type: 'search', query: rawInput, found: false });
    }
    return;
  }
  
  // Hide common verbs section when a verb is found
  if (commonVerbsSection) {
    commonVerbsSection.style.display = 'none';
  }
  
  // Hide other verbs section when a verb is found
  const otherVerbsSection = document.getElementById('other-verbs-section');
  if (otherVerbsSection) {
    otherVerbsSection.style.display = 'none';
  }

  // Clear the search input when displaying verb conjugation
  const verbInput = document.getElementById('verbInput');
  if (verbInput) {
    verbInput.value = '';
  }

  let html = `<h2>${matchKey} – ${cleanSpaces(verb.english || "")}</h2>`;
  if (verb.infinitive) {
    html += `<p class="infinitive">Infinitive: <span class="inf-fidel">${verb.infinitive.fidel || ""}</span> <span class="inf-translit">${verb.infinitive.translit || ""}</span></p>`;
  }
  // Only show "Found X matches" if there are multiple matches AND the input doesn't exactly match the verb key
  // This prevents showing the message when directly viewing a specific verb
  const normalizedInput = normalizeQuery(rawInput);
  const normalizedMatchKey = normalizeQuery(matchKey);
  if (matches.length > 1 && normalizedInput !== normalizedMatchKey) {
    html += `<p style="color:#555;font-size:14px;">Found ${matches.length} matches. Showing the first: ${matches.map(m => {
      const verbText = verbs[m]?.english ? `${m} (${verbs[m].english.split(',')[0].trim()})` : m;
      return `<span class="match-verb-link" data-verb="${m}">${verbText}</span>`;
    }).join(" ")} </p>`;
  }
  
  // Add special note for "have" verb
  if (matchKey === "አለ") {
    html += `<p style="color:#666;font-size:14px;font-style:italic;margin-top:10px;">basic conjugation - mainly for people and objects in masculine form</p>`;
  }

  // Nice tense names
  const tenseNames = {
    present:                  "Present",
    past_simple:              "Past Simple",
    perfect:                  "Perfect (Past Simple)",
    imperfective_compound:    "Compound Imperfect (Present/Future)",
    gerund:                   "Gerund",
    compound_gerund:          "Compound Gerund",
    jussive_imperative:       "Jussive / Imperative",
    negative_present:         "Negative Present",
    negative_past_simple:     "Negative Past Simple",
    negative_perfect:         "Negative Perfect",
    negative_imperfective:    "Negative Imperfect",
    negative_jussive_imperative: "Negative Jussive"
  };

  // Person labels (English / Amharic) in fixed order
  const personLabels = [
    { key: "1sg",  label: "I / እኔ" },
    { key: "2sgm", label: "you (m.) / አንተ" },
    { key: "2sgf", label: "you (f.) / አንቺ" },
    { key: "3sgm", label: "he / እሱ" },
    { key: "3sgf", label: "she / እሷ" },
    { key: "1pl",  label: "we / እኛ" },
    { key: "2pl",  label: "you (pl.) / እናንተ" },
    { key: "3pl",  label: "they / እነሱ" },
    { key: "2resp", label: "you (resp.) / እርስዎ" },
    { key: "3resp", label: "he/she (resp.) / እሳቸው" },
  ];

  // Loop through EVERY tense in the verb
  for (const [tenseKey, tenseData] of Object.entries(verb)) {
    if (tenseKey === "english" || tenseKey === "infinitive") continue; // skip non-tenses

    html += `<h3>${tenseNames[tenseKey] || tenseKey}</h3>`;
    html += `<table>
      <tr>
        <th>Person</th>
        <th>Amharic</th>
        <th>Transliteration</th>
        <th>English</th>
      </tr>`;

    // Check if tenseData is array-based (for irregular verbs) or object-based (for regular verbs)
    const isArrayBased = Array.isArray(tenseData.fidel);
    
    // Track if any transliteration has "*" ending
    let hasAsteriskEnding = false;
    
    if (isArrayBased) {
      // Handle array-based structure (irregular verbs like ነበረ, አለ)
      const count = Math.min(
        tenseData.fidel?.length || 0,
        tenseData.translit?.length || 0,
        tenseData.english?.length || 0
      );
      
      for (let i = 0; i < count; i++) {
        const translit = tenseData.translit[i] || "";
        if (translit.endsWith("*")) {
          hasAsteriskEnding = true;
        }
        const personLabel = personLabels[i] ? personLabels[i].label : `Person ${i + 1}`;
        html += `<tr>
          <td>${personLabel}</td>
          <td>${tenseData.fidel[i] || ""}</td>
          <td>${translit}</td>
          <td>${cleanSpaces(tenseData.english[i] || "")}</td>
        </tr>`;
      }
    } else {
      // Handle object-based structure (regular verbs)
      for (const person of personLabels) {
        const form = tenseData[person.key];
        if (!form) continue;
        
        const translit = form.translit || "";
        if (translit.endsWith("*")) {
          hasAsteriskEnding = true;
        }
        
        // Format English translation for imperfective_compound
        let enText = form.en || "";
        if (tenseKey === "imperfective_compound" && enText.includes("will") && !enText.includes(" / ")) {
          // Only format if it contains "will" but doesn't already have " / " (pre-formatted)
          enText = formatImperfectiveEnglish(enText, person.key);
        } else {
          enText = cleanSpaces(enText);
        }
        
        html += `<tr>
          <td>${person.label}</td>
          <td>${form.fidel || ""}</td>
          <td>${translit}</td>
          <td>${enText}</td>
        </tr>`;
      }
    }

    html += `</table>`;
    
    // Add note if any transliteration has "*" ending
    if (hasAsteriskEnding) {
      html += `<p style="color:#666;font-size:14px;font-style:italic;margin-top:10px;">*pronunciation differs from the writing as indicated in transliteration</p>`;
    }
    
    html += `<br>`;
  }

  output.innerHTML = html;
  
  // Update browser history
  if (!skipHistory) {
    updateHistory({ type: 'verb', verbKey: matchKey, query: rawInput });
  }
  
  // Add click handlers for match verb links
  const matchLinks = output.querySelectorAll('.match-verb-link');
  matchLinks.forEach(link => {
    link.addEventListener('click', function() {
      const verbKey = this.getAttribute('data-verb');
      if (verbKey) {
        document.getElementById('verbInput').value = verbKey;
        conjugate();
        // Scroll to output after clicking
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function isEnglishQuery(query) {
  // Check if query contains Latin letters (likely English)
  return /[a-zA-Z]/.test(query);
}

function findVerb(query) {
  // #region agent log
  const findVerbStartTime = performance.now();
  fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:140',message:'findVerb called',data:{query:query,verbCount:Object.keys(verbs).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const q = normalizeQuery(query);
  if (!q) return { matchKey: null, verb: null, matches: [] };

  const isEnglish = isEnglishQuery(q);

  const exactRootMatches = []; // Exact verb root matches (highest priority for roots)
  const exactEnglishMatches = []; // Exact English translation matches (e.g., "be" matches "be")
  const englishPrefixMatches = []; // English translation prefix matches (e.g., "des" matches "desire")
  const wordBoundaryMatches = []; // Word boundary English matches (e.g., "be" matches "be generous")
  const englishSubstringMatches = []; // English substring matches
  const prefixRootMatches = []; // Verb root prefix matches (starts with)
  const rootMatches = []; // Verb root substring matches (lower priority)
  const formMatches = []; // Form translation matches (lowest priority)

  let iterationCount = 0;
  for (const [verbKey, verbData] of Object.entries(verbs)) {
    iterationCount++;
    const verbKeyLower = verbKey.toLowerCase();
    
    // Exact verb root match (highest priority)
    if (verbKeyLower === q) {
      exactRootMatches.push(verbKey);
      continue;
    }
    
    // Check English matches first if query looks like English
    const englishMatchType = matchesEnglish(verbData.english || "", q);
    if (englishMatchType === 'exact') {
      exactEnglishMatches.push(verbKey);
      continue;
    } else if (englishMatchType === 'prefix') {
      englishPrefixMatches.push(verbKey);
      continue;
    } else if (englishMatchType === 'word') {
      wordBoundaryMatches.push(verbKey);
      continue;
    } else if (englishMatchType === 'substring') {
      englishSubstringMatches.push(verbKey);
      continue;
    }
    
    // Prefix match (verb starts with query) - higher priority than substring
    if (verbKeyLower.startsWith(q)) {
      prefixRootMatches.push(verbKey);
      continue;
    }
    
    // Substring match (verb contains query) - lower priority
    if (verbKeyLower.includes(q)) {
      rootMatches.push(verbKey);
      continue;
    }
    
    // Match by infinitive forms (fidel / translit)
    if (verbData.infinitive) {
      const infFidel = (verbData.infinitive.fidel || "").toLowerCase();
      const infTranslit = (verbData.infinitive.translit || "").toLowerCase();
      if (infFidel.includes(q) || infTranslit.includes(q)) {
        formMatches.push(verbKey);
        continue;
      }
    }
    // Match by any form (fidel / translit / en) - lower priority
    for (const [tenseKey, tenseData] of Object.entries(verbData)) {
      if (tenseKey === "english" || tenseKey === "infinitive") continue;
      for (const form of Object.values(tenseData)) {
        if (!form || typeof form !== "object") continue;
        const fidel = (form.fidel || "").toLowerCase();
        const translit = (form.translit || "").toLowerCase();
        const en = (form.en || "").toLowerCase();
        if (fidel.includes(q) || translit.includes(q) || en.includes(q)) {
          formMatches.push(verbKey);
          break;
        }
      }
      if (formMatches.includes(verbKey)) break;
    }
  }

  // Combine matches in priority order
  // For English queries: exact root > exact English > English prefix > word boundary > English substring > prefix root > substring root > forms
  // For non-English queries: exact root > exact English > word boundary > prefix root > substring root > English substring > forms
  let allMatches;
  if (isEnglish) {
    allMatches = [...new Set([...exactRootMatches, ...exactEnglishMatches, ...englishPrefixMatches, ...wordBoundaryMatches, ...englishSubstringMatches, ...prefixRootMatches, ...rootMatches, ...formMatches])];
  } else {
    allMatches = [...new Set([...exactRootMatches, ...exactEnglishMatches, ...wordBoundaryMatches, ...prefixRootMatches, ...rootMatches, ...englishSubstringMatches, ...formMatches])];
  }
  
  const matchKey = allMatches[0] || null;
  const verb = matchKey ? verbs[matchKey] : null;
  // #region agent log
  const findVerbEndTime = performance.now();
  fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:203',message:'findVerb completed',data:{executionTimeMs:findVerbEndTime-findVerbStartTime,iterations:iterationCount,matchesFound:allMatches.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return { matchKey, verb, matches: allMatches };
}

function normalizeQuery(q) {
  if (!q) return '';
  let s = q.trim().toLowerCase();
  // Strip leading "to " (common for English infinitives)
  s = s.replace(/^to\s+/, '');
  return s;
}

function cleanSpaces(text) {
  if (!text) return text;
  // Replace multiple spaces with single space
  return text.replace(/\s+/g, ' ').trim();
}

function formatImperfectiveEnglish(enText, personKey) {
  if (!enText || !enText.includes("will")) return cleanSpaces(enText);
  
  // Remove "will" and create present tense version
  let present = enText.replace(/\s+will\s+/i, " ").trim();
  present = cleanSpaces(present);
  
  // Handle third person singular (he/she) - add 's' to verb if needed
  if (personKey === "3sgm" || personKey === "3sgf") {
    const words = present.split(/\s+/);
    if (words.length >= 2) {
      const verb = words[words.length - 1];
      // If verb doesn't already end with 's', 'es', 'ies', add 's'
      if (!verb.match(/[sxzh]es?$|ies$/i) && !verb.endsWith('s')) {
        words[words.length - 1] = verb + 's';
        present = words.join(' ');
      }
    }
  }
  
  const cleanedFuture = cleanSpaces(enText);
  return `${present} / ${cleanedFuture}`;
}

function matchesEnglish(englishText, query) {
  if (!englishText || !query) return false;
  const lowerEnglish = englishText.toLowerCase().trim();
  const lowerQuery = query.toLowerCase().trim();
  
  // Split by comma and check each part separately
  const parts = lowerEnglish.split(',').map(p => p.trim());
  
  // Check for exact match first (highest priority)
  const hasExactMatch = parts.some(part => part === lowerQuery);
  if (hasExactMatch) return 'exact';
  
  // Check for prefix match (e.g., "des" matches "desire", "describe")
  const hasPrefixMatch = parts.some(part => {
    const words = part.split(/\s+/);
    return words.some(word => word.startsWith(lowerQuery));
  });
  if (hasPrefixMatch) return 'prefix';
  
  // Check for word boundary match (e.g., "be" matches "be able" but not "begin")
  const wordBoundaryRegex = new RegExp('\\b' + lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
  const hasWordMatch = parts.some(part => wordBoundaryRegex.test(part));
  if (hasWordMatch) return 'word';
  
  // Check for substring match anywhere in the translation
  if (lowerEnglish.includes(lowerQuery)) return 'substring';
  
  return false;
}

function setupSuggestions() {
  const input = document.getElementById('verbInput');
  const container = document.getElementById('suggestions');

  const list = document.createElement('ul');
  list.className = 'suggestions-list';
  container.appendChild(list);

  let visible = false;
  let currentItems = []; // Store current suggestions

  function hide() {
    list.innerHTML = '';
    list.style.display = 'none';
    visible = false;
    currentItems = [];
  }

  function show(items) {
    list.innerHTML = '';
    currentItems = items; // Store items for Enter key selection
    items.forEach(item => {
      const li = document.createElement('li');
      const infinitivePart = item.infinitive ? ` (${item.infinitive})` : '';
      li.innerHTML = `<span class="suggestion-key">${item.key}${infinitivePart}</span><span class="suggestion-en">${item.en || ''}</span>`;
      li.onclick = () => {
        input.value = item.key;
        hide();
        conjugate();
      };
      list.appendChild(li);
    });
    list.style.display = items.length ? 'block' : 'none';
    visible = items.length > 0;
  }

  function selectFirstSuggestion() {
    if (visible && currentItems.length > 0) {
      const firstItem = currentItems[0];
      input.value = firstItem.key;
      hide(); // Hide suggestions first to prevent recursion
      // Now call conjugate - since suggestions are hidden, it won't try to select again
      conjugate();
      return true;
    }
    return false;
  }

  input.addEventListener('input', (e) => {
    // Handle transliteration if enabled
    if (transliterationEnabled) {
      if (e.inputType === 'insertText') {
        handleTransliterationInput(input, e);
      } else if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
        // Reset buffer on deletion
        latinBuffer = '';
        lastAmharicLength = 0;
      }
    }
    
    // Show common verbs section if input is empty
    const commonVerbsSection = document.getElementById('common-verbs-section');
    const output = document.getElementById('output');
    if (input.value.trim() === '') {
      if (commonVerbsSection) {
        commonVerbsSection.style.display = 'block';
      }
      output.innerHTML = '';
      // Reset transliteration buffer
      latinBuffer = '';
      lastAmharicLength = 0;
    }
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:306',message:'input event triggered',data:{inputValue:input.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const q = normalizeQuery(input.value);
    if (!q) {
      hide();
      return;
    }
    const items = searchMatches(q, 8);
    if (items.length) show(items);
    else hide();
  });

  input.addEventListener('focus', () => {
    const q = normalizeQuery(input.value);
    if (!q) return;
    const items = searchMatches(q, 8);
    if (items.length) show(items);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If suggestions are visible, select the first one
      if (!selectFirstSuggestion()) {
        // Otherwise, just conjugate with current input
        hide();
        conjugate();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && e.target !== input) hide();
  });

  // Make selectFirstSuggestion available globally for the button
  window.selectFirstSuggestion = selectFirstSuggestion;
}

function searchMatches(q, limit = 8) {
  // #region agent log
  const searchStartTime = performance.now();
  fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:344',message:'searchMatches called',data:{query:q,limit:limit,verbCount:Object.keys(verbs).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  q = normalizeQuery(q);
  const isEnglish = isEnglishQuery(q);
  
  const exactRootMatches = []; // Exact verb root matches (highest priority for roots)
  const exactEnglishMatches = []; // Exact English translation matches
  const englishPrefixMatches = []; // English translation prefix matches
  const wordBoundaryMatches = []; // Word boundary English matches
  const englishSubstringMatches = []; // English substring matches
  const prefixRootMatches = []; // Verb root prefix matches (starts with)
  const rootMatches = []; // Verb root substring matches (lower priority)
  const formMatches = []; // Form translation matches (lowest priority)
  
  let iterationCount = 0;
  for (const [verbKey, verbData] of Object.entries(verbs)) {
    iterationCount++;
    const infinitive = verbData.infinitive?.fidel || '';
    const resultItem = { key: verbKey, en: verbData.english || '', infinitive: infinitive };
    const verbKeyLower = verbKey.toLowerCase();
    
    // Exact verb root match (highest priority)
    if (verbKeyLower === q) {
      exactRootMatches.push(resultItem);
      continue;
    }
    
    // Check English matches first if query looks like English
    const englishMatchType = matchesEnglish(verbData.english || '', q);
    if (englishMatchType === 'exact') {
      exactEnglishMatches.push(resultItem);
      continue;
    } else if (englishMatchType === 'prefix') {
      englishPrefixMatches.push(resultItem);
      continue;
    } else if (englishMatchType === 'word') {
      wordBoundaryMatches.push(resultItem);
      continue;
    } else if (englishMatchType === 'substring') {
      englishSubstringMatches.push(resultItem);
      continue;
    }
    
    // Prefix match (verb starts with query) - higher priority than substring
    if (verbKeyLower.startsWith(q)) {
      prefixRootMatches.push(resultItem);
      continue;
    }
    
    // Substring match (verb contains query) - lower priority
    if (verbKeyLower.includes(q)) {
      rootMatches.push(resultItem);
      continue;
    }
    
    // Match by infinitive forms (fidel / translit)
    if (verbData.infinitive) {
      const infFidel = (verbData.infinitive.fidel || '').toLowerCase();
      const infTranslit = (verbData.infinitive.translit || '').toLowerCase();
      if (infFidel.includes(q) || infTranslit.includes(q)) {
        formMatches.push(resultItem);
        continue;
      }
    }
    
    // scan forms - lower priority
    for (const [tenseKey, tenseData] of Object.entries(verbData)) {
      if (tenseKey === 'english' || tenseKey === 'infinitive') continue;
      for (const form of Object.values(tenseData)) {
        if (!form || typeof form !== 'object') continue;
        if ((form.fidel || '').toLowerCase().includes(q)
          || (form.translit || '').toLowerCase().includes(q)
          || (form.en || '').toLowerCase().includes(q)) {
          formMatches.push(resultItem);
          break;
        }
      }
      if (formMatches.some(r => r.key === verbKey)) break;
    }
  }
  
  // Combine matches in priority order
  // For English queries: exact root > exact English > English prefix > word boundary > English substring > prefix root > substring root > forms
  // For non-English queries: exact root > exact English > word boundary > prefix root > substring root > English substring > forms
  let allResults;
  if (isEnglish) {
    allResults = [...exactRootMatches, ...exactEnglishMatches, ...englishPrefixMatches, ...wordBoundaryMatches, ...englishSubstringMatches, ...prefixRootMatches, ...rootMatches, ...formMatches];
  } else {
    allResults = [...exactRootMatches, ...exactEnglishMatches, ...wordBoundaryMatches, ...prefixRootMatches, ...rootMatches, ...englishSubstringMatches, ...formMatches];
  }
  
  // unique by key, preserving order
  const seen = new Set();
  const deduped = [];
  for (const r of allResults) {
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    deduped.push(r);
    if (deduped.length >= limit) break;
  }
  // #region agent log
  const searchEndTime = performance.now();
  fetch('http://127.0.0.1:7243/ingest/c2e10cd5-8fde-4906-b4f4-c0ba1d717189',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:417',message:'searchMatches completed',data:{executionTimeMs:searchEndTime-searchStartTime,iterations:iterationCount,resultsReturned:deduped.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return deduped;
}

function displayCommonVerbs() {
  const container = document.getElementById('common-verbs-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // List of common verbs to display (verb key, English translation)
  const commonVerbsList = [
    { key: "ነው", en: "be" },
    { key: "አለ", en: "have" },
    { key: "ሄደ", en: "go" },
    { key: "መጣ", en: "come" },
    { key: "ወጣ", en: "go out" },
    { key: "በላ", en: "eat" },
    { key: "ጠጣ", en: "drink" },
    { key: "ቻለ", en: "can, be able" },
    { key: "ተማረ", en: "learn" },
    { key: "ጻፈ", en: "write" },
    { key: "ገዛ", en: "buy, rule" },
    { key: "ዘጋ", en: "close, shut" },
    { key: "ከፈተ", en: "open" },
    { key: "ጀመረ", en: "begin, start" },
    { key: "ነገረ", en: "tell" },
    { key: "ሰማ", en: "hear" },
    { key: "አወቀ", en: "know" },
    { key: "ተኛ", en: "sleep" },
    { key: "ወሰደ", en: "take" },
    { key: "ላከ", en: "send" },
    { key: "ረሳ", en: "forget" },
    { key: "ሠራ / ሰራ", en: "work" },
    { key: "ኖረ", en: "live, stay" },
    { key: "አደረገ", en: "do, make" },
    { key: "ፈለገ", en: "want" }
  ];
  
  commonVerbsList.forEach(verbInfo => {
    // Handle keys with "/" (like "ሠራ / ሰራ") - try first part for lookup
    const searchKey = verbInfo.key.includes(" / ") ? verbInfo.key.split(" / ")[0].trim() : verbInfo.key;
    
    // Get the verb from the verbs object if it exists (for English translation)
    const verb = verbs[searchKey];
    const english = verb ? (verb.english || verbInfo.en) : verbInfo.en;
    
    const box = document.createElement('div');
    box.className = 'verb-box';
    box.innerHTML = `
      <div class="verb-fidel">${verbInfo.key}</div>
      <div class="verb-english">${english.split(',')[0].trim()}</div>
    `;
    
    box.onclick = () => {
      // Use the search key (first part if there's a "/") for searching
      document.getElementById('verbInput').value = searchKey;
      conjugate();
      // Scroll to output
      document.getElementById('output').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    container.appendChild(box);
  });
}

function displayOtherVerbs() {
  const container = document.getElementById('other-verbs-list');
  const titleElement = document.getElementById('all-verbs-title');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Check if verbs object is populated
  if (!verbs || Object.keys(verbs).length === 0) {
    if (titleElement) {
      titleElement.textContent = 'All Verbs (0)';
    }
    console.warn("Verbs data not loaded yet");
    return;
  }
  
  // Collect ALL verbs from the verbs object (which already contains all merged verbs)
  allOtherVerbsData = [];
  
  for (const [verbKey, verbData] of Object.entries(verbs)) {
    if (verbData && typeof verbData === "object" && verbData.english) {
      allOtherVerbsData.push({
        key: verbKey,
        verb: verbData
      });
    }
  }
  
  // Update title with count
  const verbCount = allOtherVerbsData.length;
  if (titleElement) {
    titleElement.textContent = `All Verbs (${verbCount})`;
  }
  
  // Sort and render
  sortAndRenderOtherVerbs();
  
  // Setup sort button event listeners
  setupSortButtons();
}

function sortAndRenderOtherVerbs() {
  const container = document.getElementById('other-verbs-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Create a copy to sort
  const sortedVerbs = [...allOtherVerbsData];
  
  // Sort based on current sort order
  if (currentSortOrder === 'amharic') {
    // Sort by Amharic verb key
    sortedVerbs.sort((a, b) => a.key.localeCompare(b.key));
  } else {
    // Sort by English translation (first translation if multiple)
    sortedVerbs.sort((a, b) => {
      const verbA = a.verb;
      const verbB = b.verb;
      const englishA = verbA ? (verbA.english || "").split(',')[0].trim().toLowerCase() : "";
      const englishB = verbB ? (verbB.english || "").split(',')[0].trim().toLowerCase() : "";
      return englishA.localeCompare(englishB);
    });
  }
  
  // Display all other verbs
  sortedVerbs.forEach(verbInfo => {
    const verb = verbInfo.verb;
    const english = verb ? (verb.english || "") : "";
    
    const box = document.createElement('div');
    box.className = 'verb-box';
    box.innerHTML = `
      <div class="verb-fidel">${verbInfo.key}</div>
      <div class="verb-english">${english.split(',')[0].trim()}</div>
    `;
    
    box.onclick = () => {
      document.getElementById('verbInput').value = verbInfo.key;
      conjugate();
      // Scroll to output
      document.getElementById('output').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    container.appendChild(box);
  });
}

function setupSortButtons() {
  const sortAmharic = document.getElementById('sort-amharic');
  const sortEnglish = document.getElementById('sort-english');
  
  if (!sortAmharic || !sortEnglish) return;
  
  // Remove existing listeners by cloning and replacing
  const newSortAmharic = sortAmharic.cloneNode(true);
  const newSortEnglish = sortEnglish.cloneNode(true);
  sortAmharic.parentNode.replaceChild(newSortAmharic, sortAmharic);
  sortEnglish.parentNode.replaceChild(newSortEnglish, sortEnglish);
  
  // Set initial active state
  if (currentSortOrder === 'amharic') {
    newSortAmharic.classList.add('active');
    newSortEnglish.classList.remove('active');
  } else {
    newSortAmharic.classList.remove('active');
    newSortEnglish.classList.add('active');
  }
  
  // Add event listeners
  newSortAmharic.addEventListener('click', () => {
    currentSortOrder = 'amharic';
    newSortAmharic.classList.add('active');
    newSortEnglish.classList.remove('active');
    sortAndRenderOtherVerbs();
  });
  
  newSortEnglish.addEventListener('click', () => {
    currentSortOrder = 'english';
    newSortAmharic.classList.remove('active');
    newSortEnglish.classList.add('active');
    sortAndRenderOtherVerbs();
  });
}

function goToHome(skipHistory = false) {
  // Clear the search input
  const input = document.getElementById('verbInput');
  if (input) {
    input.value = '';
  }
  
  // Clear the output
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = '';
  }
  
  // Show the common verbs section
  const commonVerbsSection = document.getElementById('common-verbs-section');
  if (commonVerbsSection) {
    commonVerbsSection.style.display = 'block';
  }
  
  // Show the other verbs section
  const otherVerbsSection = document.getElementById('other-verbs-section');
  if (otherVerbsSection) {
    otherVerbsSection.style.display = 'block';
  }
  
  // Hide suggestions if visible
  const suggestions = document.getElementById('suggestions');
  if (suggestions) {
    const list = suggestions.querySelector('.suggestions-list');
    if (list) {
      list.style.display = 'none';
    }
  }
  
  // Update browser history
  if (!skipHistory) {
    updateHistory({ type: 'home' });
  }
}

// Dark Mode Functions
function toggleDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  const body = document.body;
  
  if (toggle.checked) {
    body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
}

function initDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  const toggle = document.getElementById('darkModeToggle');
  
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
    if (toggle) {
      toggle.checked = true;
    }
  }
}

// Transliteration functionality
let transliterationEnabled = false;

function selectLanguage(language) {
  const englishBox = document.getElementById('englishBox');
  const amharicBox = document.getElementById('amharicBox');
  const input = document.getElementById('verbInput');
  
  if (language === 'english') {
    transliterationEnabled = false;
    englishBox.classList.add('active');
    amharicBox.classList.remove('active');
    input.placeholder = "";
  } else if (language === 'amharic') {
    transliterationEnabled = true;
    amharicBox.classList.add('active');
    englishBox.classList.remove('active');
    input.placeholder = "le→ለ, lu→ሉ, li→ሊ, la→ላ";
  }
  
  localStorage.setItem('transliterationEnabled', transliterationEnabled);
  
  // Reset buffer when switching languages
  latinBuffer = '';
  lastAmharicLength = 0;
}

function initTransliteration() {
  const saved = localStorage.getItem('transliterationEnabled');
  const englishBox = document.getElementById('englishBox');
  const amharicBox = document.getElementById('amharicBox');
  const input = document.getElementById('verbInput');
  
  if (saved === 'true') {
    transliterationEnabled = true;
    if (amharicBox && englishBox) {
      amharicBox.classList.add('active');
      englishBox.classList.remove('active');
      input.placeholder = "le→ለ, lu→ሉ, li→ሊ, la→ላ";
    }
  } else {
    // Default is English
    transliterationEnabled = false;
    if (englishBox && amharicBox) {
      englishBox.classList.add('active');
      amharicBox.classList.remove('active');
      input.placeholder = "";
    }
  }
}

// Track Latin input buffer for each position
let latinBuffer = '';
let lastAmharicLength = 0;

// Add transliteration to input field - real-time with no Latin display
function handleTransliterationInput(input, event) {
  if (!transliterationEnabled || typeof transliterate !== 'function') return;
  if (!event || !event.data) {
    // Handle deletion or other events
    if (event && event.inputType === 'deleteContentBackward') {
      // Remove last character from buffer
      latinBuffer = latinBuffer.slice(0, -1);
    }
    return;
  }
  
  const cursorPos = input.selectionStart;
  const typedChar = event.data;
  
  // Only process Latin letters and apostrophes
  if (!/[a-zA-Z']/.test(typedChar)) {
    // Reset buffer on non-Latin input (like space or punctuation)
    if (typedChar === ' ') {
      latinBuffer = '';
      lastAmharicLength = 0;
    }
    return;
  }
  
  // Add typed character to buffer
  latinBuffer += typedChar;
  
  // Try to transliterate the buffer
  const transliterated = transliterate(latinBuffer);
  
  // Calculate how many characters to replace
  // We need to replace the Latin characters that were just typed
  const textBefore = input.value.substring(0, cursorPos - 1); // -1 because event.data is already in value
  const textAfter = input.value.substring(cursorPos);
  
  // Remove the last Amharic output (if any) and the Latin character that was just added
  const charsToRemove = lastAmharicLength + 1; // +1 for the Latin char just typed
  const newTextBefore = textBefore.substring(0, textBefore.length - (charsToRemove - 1)) + transliterated;
  
  // Update the input value
  input.value = newTextBefore + textAfter;
  const newCursorPos = newTextBefore.length;
  input.selectionStart = input.selectionEnd = newCursorPos;
  
  // Track the length of the converted Amharic for next iteration
  lastAmharicLength = transliterated.length;
  
  // If we hit a space or the buffer gets too long, reset
  if (latinBuffer.length > 10) {
    latinBuffer = '';
    lastAmharicLength = 0;
  }
}

// Browser history management
function updateHistory(state) {
  const url = state.type === 'home' 
    ? window.location.pathname 
    : `${window.location.pathname}?verb=${encodeURIComponent(state.verbKey || state.query || '')}`;
  
  window.history.pushState(state, '', url);
}

function restoreState(state) {
  if (!state) {
    goToHome(true);
    return;
  }
  
  const input = document.getElementById('verbInput');
  
  if (state.type === 'home') {
    goToHome(true);
  } else if (state.type === 'verb' && state.verbKey) {
    if (input) {
      input.value = state.verbKey;
    }
    conjugate(true);
  } else if (state.type === 'search' && state.query) {
    if (input) {
      input.value = state.query;
    }
    conjugate(true);
  } else {
    goToHome(true);
  }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
  restoreState(event.state);
});

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  initTransliteration();
  
  // Initialize history state on page load
  const urlParams = new URLSearchParams(window.location.search);
  const verbParam = urlParams.get('verb');
  
  if (verbParam) {
    // Restore verb from URL
    const input = document.getElementById('verbInput');
    if (input) {
      input.value = decodeURIComponent(verbParam);
    }
    // Use replaceState for initial load to avoid adding to history
    const state = { type: 'verb', verbKey: decodeURIComponent(verbParam), query: decodeURIComponent(verbParam) };
    window.history.replaceState(state, '', window.location.href);
    conjugate(true);
  } else {
    // Set initial home state
    window.history.replaceState({ type: 'home' }, '', window.location.pathname);
  }
});