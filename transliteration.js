// Amharic transliteration mapping (Latin to Fidel)
// Based on the Ethiopian keyboard system (phonetic matching)
// Reference: keyboards.ethiopic.org

const transliterationMap = {
  // h family (ህ)
  'he': 'ሀ', 'hu': 'ሁ', 'hi': 'ሂ', 'ha': 'ሃ', 'hie': 'ሄ', 'h': 'ህ', 'ho': 'ሆ',
  
  // l family (ለ)
  'le': 'ለ', 'lu': 'ሉ', 'li': 'ሊ', 'la': 'ላ', 'lie': 'ሌ', 'l': 'ል', 'lo': 'ሎ', 'lua': 'ሏ',
  
  // H family (ሐ - emphatic)
  'He': 'ሐ', 'Hu': 'ሑ', 'Hi': 'ሒ', 'Ha': 'ሓ', 'Hie': 'ሔ', 'H': 'ሕ', 'Ho': 'ሖ', 'Hua': 'ሗ',
  
  // m family (መ)
  'me': 'መ', 'mu': 'ሙ', 'mi': 'ሚ', 'ma': 'ማ', 'mie': 'ሜ', 'm': 'ም', 'mo': 'ሞ', 'mua': 'ሟ',
  
  // ss family (ሠ - alternate s)
  'sse': 'ሠ', 'ssu': 'ሡ', 'ssi': 'ሢ', 'ssa': 'ሣ', 'ssie': 'ሤ', 'ss': 'ሥ', 'sso': 'ሦ', 'ssua': 'ሧ',
  
  // r family (ረ)
  're': 'ረ', 'ru': 'ሩ', 'ri': 'ሪ', 'ra': 'ራ', 'rie': 'ሬ', 'r': 'ር', 'ro': 'ሮ', 'rua': 'ሯ',
  
  // s family (ሰ)
  'se': 'ሰ', 'su': 'ሱ', 'si': 'ሲ', 'sa': 'ሳ', 'sie': 'ሴ', 's': 'ስ', 'so': 'ሶ', 'sua': 'ሷ',
  
  // x family (ሸ - sh sound)
  'xe': 'ሸ', 'xu': 'ሹ', 'xi': 'ሺ', 'xa': 'ሻ', 'xie': 'ሼ', 'x': 'ሽ', 'xo': 'ሾ', 'xua': 'ሿ',
  // sh variant for x
  'she': 'ሸ', 'shu': 'ሹ', 'shi': 'ሺ', 'sha': 'ሻ', 'shie': 'ሼ', 'sh': 'ሽ', 'sho': 'ሾ', 'shua': 'ሿ',
  
  // q family (ቀ)
  'qe': 'ቀ', 'qu': 'ቁ', 'qi': 'ቂ', 'qa': 'ቃ', 'qie': 'ቄ', 'q': 'ቅ', 'qo': 'ቆ', 
  'que': 'ቈ', 'qui': 'ቊ', 'qua': 'ቋ', 'quie': 'ቌ',
  
  // b family (በ)
  'be': 'በ', 'bu': 'ቡ', 'bi': 'ቢ', 'ba': 'ባ', 'bie': 'ቤ', 'b': 'ብ', 'bo': 'ቦ', 'bua': 'ቧ',
  
  // v family (ቨ)
  've': 'ቨ', 'vu': 'ቩ', 'vi': 'ቪ', 'va': 'ቫ', 'vie': 'ቬ', 'v': 'ቭ', 'vo': 'ቮ', 'vua': 'ቯ',
  
  // t family (ተ)
  'te': 'ተ', 'tu': 'ቱ', 'ti': 'ቲ', 'ta': 'ታ', 'tie': 'ቴ', 't': 'ት', 'to': 'ቶ', 'tua': 'ቷ',
  
  // c family (ቸ - ch sound)
  'ce': 'ቸ', 'cu': 'ቹ', 'ci': 'ቺ', 'ca': 'ቻ', 'cie': 'ቼ', 'c': 'ች', 'co': 'ቾ', 'cua': 'ቿ',
  // ch variant for c
  'che': 'ቸ', 'chu': 'ቹ', 'chi': 'ቺ', 'cha': 'ቻ', 'chie': 'ቼ', 'ch': 'ች', 'cho': 'ቾ', 'chua': 'ቿ',
  
  // ny family (ኘ)
  'nye': 'ኘ', 'nyu': 'ኙ', 'nyi': 'ኚ', 'nya': 'ኛ', 'nyie': 'ኜ', 'ny': 'ኝ', 'nyo': 'ኞ', 'nyua': 'ኟ',
  
  // ' family / glottal stop (አ)
  "'e": 'አ', "'u": 'ኡ', "'i": 'ኢ', "'a": 'ኣ', "'ie": 'ኤ', "'": 'እ', "'o": 'ኦ',
  
  // k family (ከ)
  'ke': 'ከ', 'ku': 'ኩ', 'ki': 'ኪ', 'ka': 'ካ', 'kie': 'ኬ', 'k': 'ክ', 'ko': 'ኮ',
  'kue': 'ኰ', 'kui': 'ኲ', 'kua': 'ኳ', 'kuie': 'ኴ',
  
  // K family (ኸ - emphatic k)
  'Ke': 'ኸ', 'Ku': 'ኹ', 'Ki': 'ኺ', 'Ka': 'ኻ', 'Kie': 'ኼ', 'K': 'ኽ', 'Ko': 'ኾ',
  
  // w family (ወ)
  'we': 'ወ', 'wu': 'ዉ', 'wi': 'ዊ', 'wa': 'ዋ', 'wie': 'ዌ', 'w': 'ው', 'wo': 'ዎ',
  
  // '' family (ዐ - alternate glottal)
  'aaa': 'ዐ', 'uu': 'ዑ', 'ii': 'ዒ', 'aa': 'ዓ', 'iie': 'ዔ', 'ee': 'ዕ', 'oo': 'ዖ',
  
  // z family (ዘ)
  'ze': 'ዘ', 'zu': 'ዙ', 'zi': 'ዚ', 'za': 'ዛ', 'zie': 'ዜ', 'z': 'ዝ', 'zo': 'ዞ', 'zua': 'ዟ',
  
  // Z family (ዠ - zh sound)
  'Ze': 'ዠ', 'Zu': 'ዡ', 'Zi': 'ዢ', 'Za': 'ዣ', 'Zie': 'ዤ', 'Z': 'ዥ', 'Zo': 'ዦ', 'Zua': 'ዧ',
  // zh variant for Z
  'zhe': 'ዠ', 'zhu': 'ዡ', 'zhi': 'ዢ', 'zha': 'ዣ', 'zhie': 'ዤ', 'zh': 'ዥ', 'zho': 'ዦ', 'zhua': 'ዧ',
  
  // y family (የ)
  'ye': 'የ', 'yu': 'ዩ', 'yi': 'ዪ', 'ya': 'ያ', 'yie': 'ዬ', 'y': 'ይ', 'yo': 'ዮ',
  
  // d family (ደ)
  'de': 'ደ', 'du': 'ዱ', 'di': 'ዲ', 'da': 'ዳ', 'die': 'ዴ', 'd': 'ድ', 'do': 'ዶ', 'dua': 'ዷ',
  
  // j family (ጀ)
  'je': 'ጀ', 'ju': 'ጁ', 'ji': 'ጂ', 'ja': 'ጃ', 'jie': 'ጄ', 'j': 'ጅ', 'jo': 'ጆ', 'jua': 'ጇ',
  
  // g family (ገ)
  'ge': 'ገ', 'gu': 'ጉ', 'gi': 'ጊ', 'ga': 'ጋ', 'gie': 'ጌ', 'g': 'ግ', 'go': 'ጎ',
  'gue': 'ጐ', 'gui': 'ጒ', 'gua': 'ጓ', 'guie': 'ጔ',
  
  // T family (ጠ - emphatic t)
  'Te': 'ጠ', 'Tu': 'ጡ', 'Ti': 'ጢ', 'Ta': 'ጣ', 'Tie': 'ጤ', 'T': 'ጥ', 'To': 'ጦ', 'Tua': 'ጧ',
  
  // C family (ጨ - emphatic ch)
  'Ce': 'ጨ', 'Cu': 'ጩ', 'Ci': 'ጪ', 'Ca': 'ጫ', 'Cie': 'ጬ', 'C': 'ጭ', 'Co': 'ጮ', 'Cua': 'ጯ',
  // Ch variant for C
  'Che': 'ጨ', 'Chu': 'ጩ', 'Chi': 'ጪ', 'Cha': 'ጫ', 'Chie': 'ጬ', 'Ch': 'ጭ', 'Cho': 'ጮ', 'Chua': 'ጯ',
  
  // P family (ጰ - emphatic p)
  'Pe': 'ጰ', 'Pu': 'ጱ', 'Pi': 'ጲ', 'Pa': 'ጳ', 'Pie': 'ጴ', 'P': 'ጵ', 'Po': 'ጶ', 'Pua': 'ጷ',
  
  // S family (ጸ - emphatic s)
  'Se': 'ጸ', 'Su': 'ጹ', 'Si': 'ጺ', 'Sa': 'ጻ', 'Sie': 'ጼ', 'S': 'ጽ', 'So': 'ጾ', 'Sua': 'ጿ',
  
  // SS family (ፀ - alternate emphatic s)
  'SSe': 'ፀ', 'SSu': 'ፁ', 'SSi': 'ፂ', 'SSa': 'ፃ', 'SSie': 'ፄ', 'SS': 'ፅ', 'SSo': 'ፆ',
  
  // f family (ፈ)
  'fe': 'ፈ', 'fu': 'ፉ', 'fi': 'ፊ', 'fa': 'ፋ', 'fie': 'ፌ', 'f': 'ፍ', 'fo': 'ፎ', 'fua': 'ፏ',
  
  // p family (ፐ)
  'pe': 'ፐ', 'pu': 'ፑ', 'pi': 'ፒ', 'pa': 'ፓ', 'pie': 'ፔ', 'p': 'ፕ', 'po': 'ፖ', 'pua': 'ፗ',
  
  // n family (ነ) - must be after ny to avoid conflicts
  'ne': 'ነ', 'nu': 'ኑ', 'ni': 'ኒ', 'na': 'ና', 'nie': 'ኔ', 'n': 'ን', 'no': 'ኖ', 'nua': 'ኗ',
  
  // N family (ኘ - emphatic n)
  'Ne': 'ኘ', 'Nu': 'ኙ', 'Ni': 'ኚ', 'Na': 'ኛ', 'Nie': 'ኜ', 'N': 'ኝ', 'No': 'ኞ', 'Nua': 'ኟ',
  
  // Standalone vowels (when not preceded by consonants)
  'a': 'አ', 'u': 'ኡ', 'i': 'ኢ', 'e': 'እ', 'o': 'ኦ'
};

// Function to transliterate Latin text to Amharic
function transliterate(latinText) {
  if (!latinText) return '';
  
  let result = '';
  let i = 0;
  const text = latinText;  // Keep original case for capital letter detection
  
  while (i < text.length) {
    let matched = false;
    
    // Try to match longer sequences first (up to 5 characters for sequences like 'shie')
    for (let len = 5; len >= 1; len--) {
      const substr = text.substring(i, i + len);
      if (transliterationMap[substr]) {
        result += transliterationMap[substr];
        i += len;
        matched = true;
        break;
      }
    }
    
    // If no match found, keep the original character
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  
  return result;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { transliterate, transliterationMap };
}
