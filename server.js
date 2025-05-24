const express = require('express');
const cors = require('cors');
const pdf = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check for required environment variables
if (!process.env.GEMINI_API_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT) {
  console.warn('Warning: Missing required environment variables. API functionality may be limited.');
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase;

// Debug log for environment variables
console.log('SUPABASE_URL:', supabaseUrl ? 'Found (value hidden)' : 'Not found');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Found (value hidden)' : 'Not found');

if (supabaseUrl && supabaseKey) {
  try {
    console.log('Initializing Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
    
    // Test Supabase connection
    supabase.from('resume_analyses').select('id').limit(1)
      .then(({ data, error }) => {
        if (error) {
          if (error.code === '42P01') {
            console.error('Error: The resume_analyses table does not exist in Supabase.');
            console.error('Please create the table using the SQL in supabase_schema.sql');
          } else {
            console.error('Error connecting to Supabase:', error);
          }
        } else {
          console.log('Successfully connected to Supabase resume_analyses table');
        }
      });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Warning: Missing Supabase environment variables. Database functionality will not work.');
}

const app = express();
// Update CORS configuration to allow requests from frontend domain
app.use(cors({
  origin: ['https://resume-rank-fontend.onrender.com', 'http://localhost:3000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Google Drive API (if credentials available)
let drive;
try {
  const { google } = require('googleapis');
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    drive = google.drive({
      version: 'v3',
      auth: new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      }),
    });
  }
} catch (error) {
  console.error('Error initializing Google Drive API:', error);
}

// Hard code the API key for testing (better to use env variables in production)
const GEMINI_API_KEY = "AIzaSyDI9q8l80wS6-eZ1APIF9B3ohRmeXEZyrE";

// Initialize Gemini API with the working key
let genAI;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('Gemini API initialized successfully with direct key');
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

// Hard code the parent folder ID
const PARENT_FOLDER_ID = "1iDXkG-Ox2VoBToGX1BipoOjcYSMQQpVF"; // Parent folder containing Data Analyst and Software Engineer subfolders

// Rest of your code remains the same
async function extractFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

async function getResumesFromDrive(folderId) {
  if (!drive) {
    throw new Error('Google Drive API not initialized');
  }
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf'`,
    fields: 'files(id, name)',
  });
  return response.data.files;
}

async function downloadAndParseResume(fileId) {
  if (!drive) {
    throw new Error('Google Drive API not initialized');
  }
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    
    const buffer = Buffer.from(response.data);
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF for file ${fileId}:`, error);
    throw new Error('Failed to parse PDF');
  }
}

async function analyzeResume(resumeText, jobDescription) {
  if (!genAI) {
    throw new Error('Gemini AI not initialized');
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.2,         // Lower temperature for more consistent output
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });

  const prompt = `
    You are a professional resume analyzer. First, extract the candidate's name and email address from the resume text. For the name, look for patterns like:
    - "Name:", "Candidate:", or similar labels followed by a name
    - The first non-empty line at the top of the resume
    - A name in the contact section or header
    For the email, look for:
    - "Email:", "E-mail:", "Contact:", followed by an email address
    - Common email patterns like "name@domain.com"
    - Email addresses in contact sections or headers
    
    Then analyze this resume against the following job description and provide detailed scores (0-10) for:
    1. Skills Match: How well do the candidate's technical and soft skills align with the job requirements?
    2. Experience Relevance: How relevant is their work experience to the role?
    3. Education Fit: How well does their educational background match the position?
    4. Project Impact: How impactful and relevant are their projects to the role?
    
    IMPORTANT: Use the full 0-10 range for each score. Be strict and competitive:
    - Only give 9-10 for truly exceptional, perfect matches.
    - Give 7-8 for strong but not perfect matches.
    - Give 5-6 for average or partial matches.
    - Give 3-4 for weak matches.
    - Give 0-2 for poor or missing fit.
    Do NOT cluster all candidates at the top. Make sure scores reflect real differences in fit to the job description, and penalize missing or irrelevant experience, skills, or education.
    
    Also provide:
    - 3 key strengths that make this candidate a good fit
    - Areas for improvement
    - A detailed analysis of the candidate's fit for the role
    
    Job Description:
    ${jobDescription}
    
    Resume Text:
    ${resumeText}
    
    IMPORTANT: Respond with a raw JSON object, not wrapped in markdown code blocks or any other formatting. The JSON should start with { and end with }. The entire response should be valid JSON:
    {
      "candidateName": string (the extracted candidate name, or "No name found" if none found),
      "email": string (the extracted email address, or "No email found" if none found),
      "skillsMatch": number (0-10),
      "experienceRelevance": number (0-10),
      "educationFit": number (0-10),
      "projectImpact": number (0-10),
      "keyStrengths": string[],
      "areasForImprovement": string[],
      "analysis": string
    }
    
    Note: For the name and email fields, make sure to:
    1. Extract the complete name/email if found
    2. Return "No name found" or "No email found" if not found
    3. Do not include any explanatory text, just the value or "No ... found"
  `;

  try {
    console.log('Sending request to Gemini 1.5 Flash...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini 1.5 Flash');
    const response = await result.response;
    const text = response.text();
    console.log('Parsing response text...');
    console.log('Response text preview:', text.substring(0, 100) + '...');
    
    // Clean the response text to ensure it's valid JSON
    let cleanedText = text;
    
    // Remove markdown code blocks if present
    if (cleanedText.includes("```json")) {
      cleanedText = cleanedText.replace(/```json\s*/, "");
      cleanedText = cleanedText.replace(/\s*```/, "");
      console.log('Removed JSON code blocks');
    } else if (cleanedText.includes("```")) {
      cleanedText = cleanedText.replace(/```\s*/, "");
      cleanedText = cleanedText.replace(/\s*```/, "");
      console.log('Removed generic code blocks');
    }
    
    // Find the first { and last } to extract JSON
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      console.log('Extracted JSON between braces');
    } else {
      console.error('Could not find JSON braces in the response');
      console.log('Full response text:', text);
      throw new Error('Failed to extract JSON from Gemini response - no valid JSON structure found');
    }
    
    console.log('Cleaned JSON text:', cleanedText.substring(0, 100) + '...');
    
    try {
      const parsedJson = JSON.parse(cleanedText);
      console.log('Successfully parsed JSON response with these keys:', Object.keys(parsedJson).join(', '));
      
      // Calculate total score using a weighted formula
      // Weights: Skills (35%), Experience (35%), Education (15%), Projects (15%)
      const totalScore = (
        (parsedJson.skillsMatch * 0.35) +
        (parsedJson.experienceRelevance * 0.35) +
        (parsedJson.educationFit * 0.15) +
        (parsedJson.projectImpact * 0.15)
      ) * 10; // Convert to 0-100 scale
      
      // Round to 1 decimal place
      parsedJson.totalScore = Math.round(totalScore * 10) / 10;
      
      return parsedJson;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Full cleaned response text:', cleanedText);
      throw new Error(`Failed to parse Gemini API response as JSON: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { jobDescription, driveFolderLink } = req.body;
    console.log('Received analysis request with job description length:', jobDescription?.length);
    console.log('Drive folder link:', driveFolderLink);
    
    // Check if Gemini API is initialized
    if (!genAI) {
      throw new Error('Gemini API not initialized');
    }
    
    // Use the real Gemini API since we have a working key
    console.log('Gemini API is available, using it for analysis');
    
    const folderId = await extractFolderId(driveFolderLink);
    if (!folderId) {
      throw new Error('Invalid Drive folder link');
    }
    
    let resumes = [];
    try {
      resumes = await getResumesFromDrive(folderId);
      console.log(`Found ${resumes.length} resumes in the folder`);
    } catch (error) {
      console.error('Error getting resumes from Drive:', error);
      throw new Error('Error accessing Google Drive: ' + error.message);
    }
    
    if (resumes.length === 0) {
      throw new Error('No PDF resumes found in the Drive folder');
    }
    
    console.log(`Analyzing ${resumes.length} resumes...`);
    
    const analysisPromises = resumes.map(async (file) => {
      try {
        console.log(`Processing resume: ${file.name}`);
        const resumeText = await downloadAndParseResume(file.id);
        
        // Analyze the resume against the job description
        console.log(`Analyzing resume: ${file.name}`);
        const analysis = await analyzeResume(resumeText, jobDescription);
        
        // Store the analysis result in Supabase
        if (supabase) {
          try {
            const timestamp = new Date().toISOString();
            
            // Prepare the record data
            const recordData = {
              job_description: jobDescription,
              resume_name: file.name,
              resume_id: file.id,
              skills_match: analysis.skillsMatch,
              experience_relevance: analysis.experienceRelevance,
              education_fit: analysis.educationFit,
              project_impact: analysis.projectImpact,
              key_strengths: analysis.keyStrengths,
              areas_for_improvement: analysis.areasForImprovement,
              total_score: analysis.totalScore,
              analysis_text: analysis.analysis,
              email: analysis.email,
              created_at: timestamp
            };
            
            console.log('Attempting to store record in Supabase...');
            
            // Try to insert the record with clear error logging
            const { data, error } = await supabase
              .from('resume_analyses')
              .insert([recordData]);
            
            if (error) {
              console.error('Supabase insertion error code:', error.code);
              console.error('Supabase insertion error message:', error.message);
              
              if (error.code === '42501') {
                console.error('RLS Policy Error: You need to update the Row Level Security policy in Supabase');
                console.error('Go to Supabase dashboard > Authentication > Policies and either:');
                console.error('1. Disable RLS for the resume_analyses table (for development) OR');
                console.error('2. Create a policy that allows inserts without authentication');
              }
              
              analysis.stored = false;
              analysis.storeError = error.message;
            } else {
              console.log('Analysis stored in Supabase successfully');
              analysis.stored = true;
            }
          } catch (dbError) {
            console.error('Error with Supabase operation:', dbError);
            analysis.stored = false;
            analysis.storeError = dbError.message;
          }
        }
        
        return {
          fileName: file.name,
          fileId: file.id,
          analysis
        };
      } catch (error) {
        console.error(`Error processing resume ${file.name}:`, error);
        return {
          fileName: file.name,
          fileId: file.id,
          error: error.message
        };
      }
    });
    
    // Wait for all analyses to complete
    const results = await Promise.all(analysisPromises);
    
    // Sort results by totalScore (descending)
    results.sort((a, b) => {
      // Check if both have valid analysis and scores
      if (a.analysis?.totalScore !== undefined && b.analysis?.totalScore !== undefined) {
        return b.analysis.totalScore - a.analysis.totalScore;
      } else if (a.analysis?.totalScore !== undefined) {
        return -1; // a has score, b doesn't - a comes first
      } else if (b.analysis?.totalScore !== undefined) {
        return 1;  // b has score, a doesn't - b comes first
      }
      // Both have errors or no score, keep original order
      return 0;
    });
    
    console.log('Analysis complete, sending response');
    res.json({ results });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// n8n API endpoints
app.post('/api/n8n/create-calendar-events', async (req, res) => {
  try {
    const { events } = req.body;
    console.log('Events being sent to n8n:', JSON.stringify(events, null, 2));
    
    // Call n8n webhook for calendar events
    const response = await fetch(process.env.N8N_CALENDAR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error('Failed to create calendar events');
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error creating calendar events:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/n8n/send-rejection-emails', async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;
    
    // Call n8n webhook for sending emails
    const response = await fetch(process.env.N8N_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients, subject, body }),
    });

    if (!response.ok) {
      throw new Error('Failed to send rejection emails');
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error sending rejection emails:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Save a job result
app.post('/api/save-job', async (req, res) => {
  const { jobTitle, results } = req.body;
  if (!jobTitle || !results) {
    return res.status(400).json({ error: 'Missing jobTitle or results' });
  }
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert([{ job_title: jobTitle, results }])
      .select();
    if (error) throw error;
    res.json({ success: true, job: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all saved jobs
app.get('/api/saved-jobs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id, job_title, created_at');
    if (error) throw error;
    res.json({ jobs: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single saved job by ID
app.get('/api/saved-jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id, job_title, created_at, results')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json({ job: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoint to fetch subfolders
app.get('/api/drive-folders', async (req, res) => {
  try {
    if (!drive) {
      throw new Error('Google Drive API not initialized');
    }

    const response = await drive.files.list({
      q: `'${PARENT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    res.json(response.data.files);
  } catch (error) {
    console.error('Error fetching subfolders:', error);
    res.status(500).json({ error: 'Failed to fetch subfolders' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 