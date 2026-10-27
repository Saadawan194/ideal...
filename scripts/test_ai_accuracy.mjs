import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Test URLs representing typical user photos
const testSamples = [
  {
    name: 'Luxury Velvet Sofa',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=75',
    expectedType: 'Sofa / Living Room'
  },
  {
    name: 'Carved Wooden Bed',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=75',
    expectedType: 'Bed / Bedroom'
  },
  {
    name: 'Dressing Table / Vanity',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=75',
    expectedType: 'Dressing / Storage'
  },
  {
    name: 'Graphic Icon / Non-furniture (Junk Test)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=75',
    expectedType: 'REJECT / Junk'
  }
];

const prompt = `You are the master cataloguer for "Ideal Furniture" (Pakistan's luxury furniture house, renowned for Chinioti hand-carved heritage, modern drawing room suites, banquet dining, and artisanal timber pieces).

INSPECT THIS IMAGE WITH EXTREME ACCURACY.

CRITICAL RULES:
1. FAZOOL / JUNK FILTER:
   - If this image is an icon, logo, computer graphic, clip-art, document/receipt, screenshot, car/vehicle, meme, food, clothing, abstract art, or non-furniture object:
     Set "isFurniture": false, "decision": "REJECT", "confidence": 0.1, "reason": "Non-furniture graphic/junk".
   - If it is genuine furniture, proceed to step 2.

2. CLASSIFICATION:
   - Identify if it is: Sofa, Bed, Chinioti Bed, Dressing Table, Showcase / Crockery Cabinet, Mirror, Side Table, Dining Table, or Chair.
   - "category": "Living Room Furniture", "Bedroom Furniture", "Dining Room Furniture", etc.
   - "subCategory": "Sofas", "Chinioti Beds", "Modern Beds", "Dressing Tables", "Showcases", "Mirrors", "Side Tables", etc.

3. LUXURY, NON-GENERIC TITLE:
   - High-end, distinctive, SEO title describing exactly what you see.
   - NEVER use generic words like "Bed" or "Sofa".

4. RICH DESCRIPTION:
   - 2-3 sentences mentioning timber quality (Sheesham, Teak, Walnut), traditional joinery, upholstery (Poshish, velvet), polish finish, and aesthetic character.

Return strictly a JSON object:
{
  "isFurniture": boolean,
  "decision": "AUTO_UPLOAD" | "REJECT",
  "confidence": number,
  "category": string,
  "subCategory": string,
  "title": string,
  "description": string,
  "wood": string,
  "upholstery": string,
  "reason": string
}`;

async function runTest() {
  console.log('🧪 Starting AI Accuracy & Confidence Test on Real Furniture Samples...\n');

  for (const sample of testSamples) {
    console.log(`----------------------------------------------------------------`);
    console.log(`Testing Sample: ${sample.name} (Expected: ${sample.expectedType})`);
    try {
      const imgRes = await fetch(sample.url);
      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64 } }
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text);
      console.log(`🤖 Decision: ${parsed.decision} (Confidence: ${parsed.confidence})`);
      if (parsed.decision === 'REJECT') {
        console.log(`🗑️  Junk Detected & Filtered! Reason: "${parsed.reason}"`);
      } else {
        console.log(`✨ Category: [${parsed.category}] > [${parsed.subCategory}]`);
        console.log(`👑 Title: "${parsed.title}"`);
        console.log(`📝 Description: "${parsed.description}"`);
        console.log(`🪵 Wood: "${parsed.wood}" | Upholstery: "${parsed.upholstery}"`);
      }
    } catch (err) {
      console.error(`❌ Error testing sample:`, err.message);
    }
  }
  console.log(`\n----------------------------------------------------------------`);
  console.log('✅ AI Accuracy Test Completed!');
}

runTest();
