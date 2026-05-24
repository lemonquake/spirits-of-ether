/**
 * Story definitions and utility functions for the Spirits of Ether Story Engine.
 */

/**
 * Sanitizes asset paths by stripping 'public/' or 'dist/' prefixes,
 * handling Windows backslashes, and ensuring a single leading slash.
 * E.g., 'dist/audio/story_bgm1.mp3' -> '/audio/story_bgm1.mp3'
 *       'public\act1_1.png' -> '/act1_1.png'
 * 
 * @param {string} path - The raw asset path.
 * @returns {string} The sanitized web-accessible path.
 */
export const sanitizeAssetPath = (path) => {
  if (!path) return '';
  let clean = path.trim();
  
  // Strip leading dot-slashes if present
  if (clean.startsWith('./')) clean = clean.substring(2);
  if (clean.startsWith('.\\')) clean = clean.substring(2);
  
  // Strip public/ or dist/ prefixes
  if (clean.startsWith('public/')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('public\\')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('dist/')) {
    clean = clean.substring(5);
  } else if (clean.startsWith('dist\\')) {
    clean = clean.substring(5);
  }
  
  // Replace backslashes with forward slashes
  clean = clean.replace(/\\/g, '/');
  
  // Ensure it starts with a single forward slash
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  
  return clean;
};

export const STORIES = {
  intro: [
    {
      audio: 'dist/audio/story_bgm1.mp3',
      image: 'dist/act1_1.png',
      speaker: '',
      text: 'Town of Heran, Main market'
    },
    {
      audio: 'dist/audio/story_bgm1.mp3',
      image: 'dist/act1_1.png',
      speaker: 'Azrin',
      text: 'Are you sure today is the day?'
    },
    {
      audio: 'dist/audio/story_bgm1.mp3',
      image: 'dist/act1_2.png',
      speaker: 'Azrael',
      text: 'Of course! Father would have want it to be today anyway.'
    },
    {
      audio: 'dist/audio/story_bgm1.mp3',
      image: 'dist/act1_azrin_talk.png',
      speaker: 'Azrin',
      text: 'By the way, where is father? I thought he was gonna refer us?'
    },
    {
      audio: 'dist/audio/story_bgm1.mp3',
      image: 'dist/act1_azrael_talk.png',
      speaker: 'Azrael',
      text: 'I think he went with mother to get supplies for tonight. Let those lovebirds have their time, hehe.'
    },
    {
      audio: 'dist/audio/story_bgm1.mp3',
      image: 'public/act1_1.png',
      speaker: '',
      text: '(The morning light shines upon Heran. The twins take a deep breath and prepare for their initiation...)'
    }
  ]
};
