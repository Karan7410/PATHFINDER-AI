// ==========================================================
// 🚀 PATHFINDER SECURE INTELLIGENCE ENGINE BACKEND CORE
// ==========================================================

const express = require('express');
const cors = require('cors');
const path = require('path');

// Force dynamic absolute directory resolution for environment parameters
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────────────────
// 📡 DIRECT HARDCODED SECURITY OVERRIDE LAYER
// ──────────────────────────────────────────────────────────
// ⚠️ REPLACE WITH YOUR RAW SECURE UNCUT KEY STRINGS WITHIN THE QUOTES:
const groqApiKey = process.env.GROQ_API_KEY;
const ibmApiKey = process.env.IBM_CLOUD_API_KEY;
const ibmUrl = process.env.IBM_CLOUD_URL; 

const DB_NAME = "resume_history"; 

// Startup Handshake Diagnostic Tracker Log Verification
if (!process.env.IBM_CLOUD_API_KEY || !process.env.IBM_CLOUD_URL) {
    console.error("Error: API keys or URL are missing from .env file");
    process.exit(1); // Stop the server if keys are missing
}else {
    console.log("🚀 IBM Cloudant Secure Infrastructure linked up smoothly via Native OAuth Flow.");
}

// Helper function to dynamically fetch a clean IAM OAuth Bearer Token from IBM
async function getIAMAuthToken(apiKey) {
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`IBM IAM Gateway token generation failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.access_token;
}

// ──────────────────────────────────────────────────────────
// 🛠️ ENDPOINT 1: COMPREHENSIVE RESUME ANALYSIS MATRIX
// ──────────────────────────────────────────────────────────
app.post('/api/analyze-resume-groq', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) return res.status(400).json({ error: "Missing source text data string." });

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimization engine and career strategist.
Analyze the following resume text string thoroughly: "${resumeText}".

CRITICAL RULE: You must identify and suggest a MINIMUM of 6 distinct target career trajectories or roles that strongly align with the skills, projects, or background present in the text.

You MUST return a valid JSON object matching this exact structure layout with no markdown formatting:
{
  "is_valid_resume": true,
  "overall_ats_score": 85,
  "highlights": [
    "Highlight point 1 outlining a key strength or technical proficiency.",
    "Highlight point 2 addressing project experience or domain capability.",
    "Highlight point 3 identifying competitive edges found within the profile."
  ],
  "suggested_roles": [
    "Target Role 1",
    "Target Role 2",
    "Target Role 3",
    "Target Role 4",
    "Target Role 5",
    "Target Role 6"
  ]
}

If the document is empty or completely unrelated to a professional profile, set "is_valid_resume" to false, "overall_ats_score" to 0, "suggested_roles" to [], and provide an explanatory message in the "highlights" array.

Return ONLY raw JSON text. Do not wrap in markdown code blocks, do not include introductory conversational chatter.`;

        // 1. Fetch Complete AI Metrics Matrix from Groq
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_KEY}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        if (!groqResponse.ok) throw new Error(`Groq API Error: ${groqResponse.status}`);
        
        const groqData = await groqResponse.json();
        const parsedAiResult = JSON.parse(groqData.choices[0].message.content.trim());

        // 🪣 2. NATIVE HTTP CLOUDANT INTEGRATION VIA SECURE IAM OAUTH
        if (parsedAiResult.is_valid_resume && REAL_IBM_URL && !REAL_IBM_URL.includes('***')) {
            try {
                console.log("🔄 Requesting fresh IAM OAuth Token from IBM Server...");
                const iamBearerToken = await getIAMAuthToken(REAL_IBM_KEY);
                
                const cleanBaseUrl = REAL_IBM_URL.endsWith('/') ? REAL_IBM_URL.slice(0, -1) : REAL_IBM_URL;
                const cloudantEndpoint = `${cleanBaseUrl}/${DB_NAME}`;

                console.log(`📡 Streaming metrics to Cloudant database endpoint: ${cloudantEndpoint}`);

                const dbResponse = await fetch(cloudantEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${iamBearerToken}`, 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        overall_ats_score: parsedAiResult.overall_ats_score,
                        highlights: parsedAiResult.highlights,
                        suggested_roles: parsedAiResult.suggested_roles
                    })
                });

                if (dbResponse.ok) {
                    const dbData = await dbResponse.json();
                    console.log("🟢 Cloudant Sync Success! Saved Document ID:", dbData.id);
                } else {
                    const errText = await dbResponse.text();
                    console.error(`❌ Cloudant Data Write Rejected. Status: ${dbResponse.status} - ${errText}`);
                }
            } catch (dbErr) {
                console.error("❌ Cloudant Auth Pipeline Failed entirely:", dbErr.message);
            }
        }

        // Return data payload cleanly to your frontend application interface
        res.json(parsedAiResult);

    } catch (error) {
        console.error("CRITICAL EXCEPTION IN RESUME PARSING UTILITY:", error);
        res.status(500).json({ error: "Internal processing exception context logged." });
    }
});

// ──────────────────────────────────────────────────────────
// 🛠️ ENDPOINT 2: PROGRESSIVE CAREER MILESTONE ROADMAP GENERATOR
// ──────────────────────────────────────────────────────────
app.post('/api/generate-roadmap-groq', async (req, res) => {
    try {
        const { resumeText, role } = req.body;
        if (!resumeText || !role) return res.status(400).json({ error: "Missing roadmap configuration fields." });

        const roadmapPrompt = `Resume: "${resumeText}". Target Role: "${role}". Return ONLY raw JSON matching this exact structure template layout text string: {"match_score": 85 , "missing_skills": ["skill1"], "recommended_projects": ["p1"], "certifications": ["c1"], "improvement_plan": "steps" , "companies": "list of hiring targets"}. Do not wrap in markdown boxes.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: roadmapPrompt }],
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`Groq API Network connectivity error: ${response.status}`);
        
        const data = await response.json();
        const parsedRoadmap = JSON.parse(data.choices[0].message.content.trim());
        res.json(parsedRoadmap);

    } catch (error) {
        console.error("CRITICAL EXCEPTION IN ROADMAP GENERATION ENGINE:", error);
        res.status(500).json({ error: "Internal engine trajectory processing exception logged." });
    }
});

// ──────────────────────────────────────────────────────────
// 📡 SERVER BOOT LOADER SWITCH
// ──────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`📡 Pathfinder Secure Server Engine actively running on http://localhost:${PORT}`);
});