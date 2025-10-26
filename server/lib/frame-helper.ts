// Farcaster Frame HTML Generator
// Generates HTML with Farcaster Frame meta tags for dynamic frame responses

interface FrameButton {
  label: string;
  action?: 'post' | 'post_redirect' | 'link' | 'mint' | 'tx';
  target?: string;
}

interface FrameOptions {
  image: string;
  buttons: FrameButton[];
  postUrl?: string;
  inputText?: string;
  aspectRatio?: '1.91:1' | '1:1';
  state?: any;
  title?: string;
  description?: string;
}

export function generateFrameHtml(options: FrameOptions): string {
  const {
    image,
    buttons,
    postUrl,
    inputText,
    aspectRatio = '1.91:1',
    state,
    title = 'PredictX',
    description = 'Crypto Price Prediction Game',
  } = options;

  const buttonTags = buttons.map((btn, index) => {
    const num = index + 1;
    let tags = `    <meta property="fc:frame:button:${num}" content="${btn.label}" />`;
    
    if (btn.action && btn.action !== 'post') {
      tags += `\n    <meta property="fc:frame:button:${num}:action" content="${btn.action}" />`;
    }
    
    if (btn.target) {
      tags += `\n    <meta property="fc:frame:button:${num}:target" content="${btn.target}" />`;
    }
    
    return tags;
  }).join('\n');

  const inputTag = inputText 
    ? `    <meta property="fc:frame:input:text" content="${inputText}" />` 
    : '';

  // Encode state as base64 per Farcaster spec
  const stateTag = state 
    ? `    <meta property="fc:frame:state" content="${Buffer.from(JSON.stringify(state)).toString('base64')}" />` 
    : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    
    <!-- Farcaster Frame -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${image}" />
    <meta property="fc:frame:image:aspect_ratio" content="${aspectRatio}" />
${postUrl ? `    <meta property="fc:frame:post_url" content="${postUrl}" />` : ''}
${buttonTags}
${inputTag}
${stateTag}
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${image}" alt="Frame preview" style="max-width: 100%; height: auto;" />
  </body>
</html>`;
}

// Generate frame image URL based on state
export function getFrameImageUrl(baseUrl: string, state: {
  action?: 'btc' | 'eth' | 'stats' | 'leaderboard';
  fid?: number;
  coinId?: string;
  direction?: string;
  result?: string;
}): string {
  const params = new URLSearchParams();
  
  if (state.action) params.append('action', state.action);
  if (state.fid) params.append('fid', state.fid.toString());
  if (state.coinId) params.append('coin', state.coinId);
  if (state.direction) params.append('dir', state.direction);
  if (state.result) params.append('result', state.result);
  
  return `${baseUrl}/api/frame-image?${params.toString()}`;
}
