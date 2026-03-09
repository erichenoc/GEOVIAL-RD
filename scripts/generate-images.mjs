import fs from 'fs';
import path from 'path';

const API_KEY = process.env.OPENROUTER_API_KEY || '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';
const MODEL = 'google/gemini-2.5-flash-image';
const BASE_DIR = path.resolve('public/images');

const IMAGE_PROMPTS = [
  { name: 'reports/pothole-1.jpg', prompt: 'Generate a photorealistic image of a large dangerous pothole on an urban road in Santo Domingo Dominican Republic. Tropical setting with palm trees visible. Damaged crumbling asphalt around the hole. Street level smartphone camera perspective. Natural bright daylight.' },
  { name: 'reports/pothole-2.jpg', prompt: 'Generate a photorealistic image of multiple small potholes scattered on a residential neighborhood street in a Caribbean city. Cracked deteriorated asphalt surface. Colorful houses visible on both sides. Smartphone perspective. Warm tropical daylight.' },
  { name: 'reports/crack-1.jpg', prompt: 'Generate a photorealistic close-up image of deep longitudinal cracks and fissures in dark road pavement. The cracks form a network pattern on asphalt surface. Shot from above with smartphone camera. Bright natural daylight. Dominican Republic urban street.' },
  { name: 'reports/drain-1.jpg', prompt: 'Generate a photorealistic image of a broken rusted storm drain cover on an urban street. The metal grate is cracked and partially collapsed. Shot from above with smartphone camera. Dominican Republic tropical city. Natural daylight.' },
  { name: 'reports/signage-1.jpg', prompt: 'Generate a photorealistic image of a bent damaged road stop sign on a street corner in Dominican Republic. The sign post is leaning, sign face dented. Tropical vegetation in background. Smartphone photo. Daylight.' },
  { name: 'reports/road-damage-1.jpg', prompt: 'Generate a photorealistic image of severe road surface erosion on a main avenue. Large chunks of asphalt broken apart. Exposed gravel base visible. Car level perspective. Dominican Republic tropical urban highway. Daylight.' },
  { name: 'reports/sidewalk-1.jpg', prompt: 'Generate a photorealistic image of a broken uneven concrete sidewalk in a Dominican Republic city. Raised cracked sections creating trip hazards. Weeds through cracks. Smartphone photo. Tropical neighborhood. Natural daylight.' },
  { name: 'reports/flooding-1.jpg', prompt: 'Generate a photorealistic image of urban street flooding on a road in Santo Domingo after tropical rain. Deep water ponding across both lanes. Drainage problem visible. Overcast tropical sky. Smartphone photo.' },
  { name: 'phases/before-1.jpg', prompt: 'Generate a photorealistic BEFORE repair photo of a badly damaged road section in Dominican Republic. Multiple potholes and cracks. Orange traffic cones marking the area. Smartphone photo taken by road inspector. Daylight.' },
  { name: 'phases/during-1.jpg', prompt: 'Generate a photorealistic photo of a road crew working on filling potholes in Dominican Republic. Workers in orange safety vests with asphalt equipment. Municipal road maintenance in progress. Smartphone photo. Daylight.' },
  { name: 'phases/after-1.jpg', prompt: 'Generate a photorealistic AFTER repair photo of a freshly repaired smooth road surface. New dark black asphalt patch on the road. Completed pothole repair. Clean road. Dominican Republic tropical setting. Smartphone photo. Daylight.' },
  { name: 'hero/hero-road.jpg', prompt: 'Generate a professional aerial drone photo of a modern well-maintained highway in Santo Domingo Dominican Republic. Clean lanes with white markings. Green tropical vegetation. Beautiful Caribbean blue sky. Cinematic composition.' },
  { name: 'hero/crew-working.jpg', prompt: 'Generate a professional photo of a municipal road maintenance crew of 5 workers in Dominican Republic. Workers in orange safety vests and hard hats. Standing on a repaired road. Teamwork. Professional photography. Golden hour.' },
  { name: 'reports/marking-1.jpg', prompt: 'Generate a photorealistic image of faded worn road lane markings on a busy urban avenue. Road paint barely visible on dark asphalt. Dominican Republic city with tropical trees. Smartphone photo. Natural daylight.' },
  { name: 'reports/lighting-1.jpg', prompt: 'Generate a photorealistic image of a broken non-functioning street light pole at dusk on a Dominican Republic urban road. The lamp is not illuminated. Dark road section. Smartphone photo showing contrast between lit and unlit areas.' }
];

async function generateImage(promptData) {
  console.log(`🎨 Generating: ${promptData.name}...`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://geovial-rd.vercel.app',
          'X-Title': 'GEOVIAL-RD'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: promptData.prompt }]
        })
      });

      const rawText = await response.text();
      const data = JSON.parse(rawText);

      if (data.error) {
        console.log(`  ❌ API error: ${data.error.message?.substring(0, 80)}`);
        continue;
      }

      const message = data.choices?.[0]?.message;
      if (!message) { console.log(`  ⚠️ No message in response`); continue; }

      // CHECK 1: message.images array (OpenRouter Gemini format)
      if (message.images && Array.isArray(message.images)) {
        for (const img of message.images) {
          const url = img.image_url?.url || img.url || '';
          if (url.startsWith('data:image')) {
            const b64 = url.split(',')[1];
            const buffer = Buffer.from(b64, 'base64');
            return saveBuffer(buffer, promptData.name);
          }
        }
      }

      // CHECK 2: content as array with image parts
      if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === 'image_url') {
            const url = part.image_url?.url || '';
            if (url.startsWith('data:image')) {
              const b64 = url.split(',')[1];
              return saveBuffer(Buffer.from(b64, 'base64'), promptData.name);
            }
          }
          if (part.inline_data?.data) {
            return saveBuffer(Buffer.from(part.inline_data.data, 'base64'), promptData.name);
          }
        }
      }

      // CHECK 3: Look for base64 anywhere in the raw response
      const b64Match = rawText.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]{100,})/);
      if (b64Match) {
        const buffer = Buffer.from(b64Match[1], 'base64');
        return saveBuffer(buffer, promptData.name);
      }

      console.log(`  ⚠️ No image found (attempt ${attempt})`);
    } catch (err) {
      console.log(`  ❌ Error (attempt ${attempt}): ${err.message}`);
    }
  }
  return false;
}

function saveBuffer(buffer, name) {
  const filePath = path.join(BASE_DIR, name);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  const sizeKB = (buffer.length / 1024).toFixed(0);
  console.log(`  ✅ Saved: ${name} (${sizeKB} KB)`);
  return true;
}

async function main() {
  console.log('🏭 GEOVIAL-RD Image Generator v2');
  console.log(`📡 Model: ${MODEL}`);
  console.log(`📁 Output: ${BASE_DIR}\n`);

  let success = 0, failed = 0;

  // Process in batches of 3
  for (let i = 0; i < IMAGE_PROMPTS.length; i += 3) {
    const batch = IMAGE_PROMPTS.slice(i, i + 3);
    const results = await Promise.all(batch.map(p => generateImage(p)));
    results.forEach(r => r ? success++ : failed++);

    if (i + 3 < IMAGE_PROMPTS.length) {
      console.log(`\n⏳ Batch ${Math.floor(i/3)+1} done. Pausing 3s...\n`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\n📊 Results: ${success} ✅ | ${failed} ❌ | ${IMAGE_PROMPTS.length} total`);

  // List generated files
  for (const sub of ['reports', 'phases', 'hero']) {
    const dir = path.join(BASE_DIR, sub);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f !== '.gitkeep');
      if (files.length) console.log(`\n${sub}/: ${files.join(', ')}`);
    }
  }
}

main().catch(console.error);
