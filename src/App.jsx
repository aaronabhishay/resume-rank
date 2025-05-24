import React, { useState, useEffect } from "react";
import { Briefcase, FileText, BookmarkCheck, Upload, FolderGit2, ArrowRight } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import JobDescriptionInput from "./components/JobDescriptionInput";
import DriveFolderInput from "./components/DriveFolderInput";
import ResultsDisplay from "./components/ResultsDisplay";

// Dynamically determine backend URL based on environment
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  // Local backend always on 5000
  : 'https://resume-rank.onrender.com';  // Production

console.log('Using backend URL:', BACKEND_URL);

const JOB_ROLES = {
  "Select a role...": "",
  "Data Scientist": `Data Scientist

Responsibilities:
- Develop and implement machine learning models and algorithms
- Analyze large datasets to extract meaningful insights
- Create data-driven solutions for business problems
- Collaborate with cross-functional teams to identify opportunities
- Design and maintain data pipelines and ETL processes
- Present findings and recommendations to stakeholders

Requirements:
- Master's or PhD in Computer Science, Statistics, Mathematics, or related field
- Strong programming skills in Python, R, or similar languages
- Experience with machine learning frameworks (TensorFlow, PyTorch, scikit-learn)
- Proficiency in SQL and database management
- Knowledge of statistical analysis and experimental design
- Experience with big data technologies (Hadoop, Spark)
- Strong problem-solving and analytical skills
- Excellent communication and presentation abilities`,

  "Software Engineer": `Software Engineer

Responsibilities:
- Design, develop, and maintain scalable software applications
- Write clean, efficient, and maintainable code
- Collaborate with cross-functional teams to define features
- Perform code reviews and mentor junior developers
- Troubleshoot and debug complex issues
- Implement automated testing and continuous integration
- Optimize application performance and security

Requirements:
- Bachelor's degree in Computer Science or related field
- 3+ years of experience in software development
- Strong proficiency in one or more programming languages (Java, Python, JavaScript)
- Experience with web frameworks (React, Angular, Node.js)
- Knowledge of database systems (SQL, NoSQL)
- Understanding of software design patterns and architecture
- Experience with version control systems (Git)
- Familiarity with cloud platforms (AWS, Azure, GCP)
- Strong problem-solving and analytical skills`
};

export default function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [driveFolderLink, setDriveFolderLink] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("job-analysis");
  const [jobTitle, setJobTitle] = useState("Job Title");
  // Saved Jobs Modal State
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);
  const [savedJobsError, setSavedJobsError] = useState("");
  // Scoring Logic Modal State
  const defaultScoringLogic = `IMPORTANT: Use the full 0-10 range for each score. Be strict and competitive:
- Only give 9-10 for truly exceptional, perfect matches.
- Give 7-8 for strong but not perfect matches.
- Give 5-6 for average or partial matches.
- Give 3-4 for weak matches.
- Give 0-2 for poor or missing fit.
Do NOT cluster all candidates at the top. Make sure scores reflect real differences in fit to the job description, and penalize missing or irrelevant experience, skills, or education.`;
  const [scoringLogic, setScoringLogic] = useState(defaultScoringLogic);
  const [showScoringModal, setShowScoringModal] = useState(false);

  const fetchSavedJobs = async () => {
    setSavedJobsLoading(true);
    setSavedJobsError("");
    try {
      const response = await fetch("/api/saved-jobs");
      const data = await response.json();
      if (data.jobs) {
        setSavedJobs(data.jobs);
      } else {
        setSavedJobsError(data.error || "Failed to fetch saved jobs");
      }
    } catch (err) {
      setSavedJobsError("Failed to fetch saved jobs");
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const handleOpenSavedJobs = () => {
    setShowSavedJobs(true);
    fetchSavedJobs();
  };

  const handleLoadSavedJob = async (id) => {
    setSavedJobsLoading(true);
    setSavedJobsError("");
    try {
      const response = await fetch(`/api/saved-jobs/${id}`);
      const data = await response.json();
      if (data.job && data.job.results) {
        setResults(data.job.results);
        setJobDescription(data.job.job_description);
        setJobTitle(data.job.job_title || "Job Title");
        setTab("candidate-results");
        setShowSavedJobs(false);
      } else {
        setSavedJobsError(data.error || "Failed to load job");
      }
    } catch (err) {
      setSavedJobsError("Failed to load job");
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !driveFolderLink || !experienceLevel) {
      alert("Please provide all required information");
      return;
    }
    setTab("candidate-results");
    setJobTitle(jobDescription.split('\n')[0] || "Job Title");
    setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            jobDescription, 
            driveFolderLink,
            experienceLevel,
            scoringLogic
          }),
        });
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error analyzing resumes:", error);
        alert("Error analyzing resumes. Please try again.");
        setTab("job-analysis");
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="flex items-center h-16 border-b bg-white sticky top-0 z-10 px-4 md:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-black" />
            <h1 className="text-xl font-bold">Resume Ranker</h1>
          </div>
          <div className="flex items-center gap-2 h-full">
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 h-full flex items-center">
              <Upload className="h-4 w-4" />
              Import Resumes
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 h-full flex items-center" onClick={handleOpenSavedJobs}>
              <BookmarkCheck className="h-4 w-4" />
              Saved Jobs
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 h-full flex items-center">
              <FileText className="h-4 w-4" />
              New Job Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="flex justify-center py-12">
        <Tabs defaultValue="job-analysis" className="space-y-6" value={tab} onValueChange={setTab}>
          <div className="flex justify-between items-center">
            <TabsList className="w-full flex">
              <TabsTrigger value="job-analysis" className="gap-2 flex-1">
                <Briefcase className="h-4 w-4" />
                Job Analysis
              </TabsTrigger>
              <TabsTrigger value="candidate-results" className="gap-2 flex-1">
                <FileText className="h-4 w-4" />
                Candidate Results
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="job-analysis" className="space-y-6">
            <Card className="w-[1400px] px-4 py-6 md:px-6 md:py-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Analyze New Job</CardTitle>
                    <CardDescription>Enter job details to find the best matching candidates</CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    <span className="text-xs font-medium">Step 1 of 2</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label htmlFor="experience" className="text-sm font-medium">
                        Experience Level
                      </label>
                      <Select value={experienceLevel} onChange={setExperienceLevel}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select experience..."
                            value={experienceLevel}
                            options={[
                              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>,
                              <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>,
                              <SelectItem value="senior">Senior (6+ years)</SelectItem>,
                            ]}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (6+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 text-gray-700"
                      onClick={() => setShowScoringModal(true)}
                    >
                      Edit Scoring Logic
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="job-description" className="text-sm font-medium">
                    Job Description
                  </label>
                  <JobDescriptionInput
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="drive-link" className="text-sm font-medium">
                    Google Drive Folder Link
                  </label>
                  <DriveFolderInput
                    value={driveFolderLink ? driveFolderLink.split('/').pop() : ""}
                    onChange={(folderId) => setDriveFolderLink(`https://drive.google.com/drive/folders/${folderId}`)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Supported formats: PDF, DOCX, TXT</span>
                </div>
                <Button onClick={handleAnalyze} disabled={loading} className="flex items-center gap-2" size="sm">
                  {loading ? "Analyzing..." : "Analyze Resumes"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="candidate-results">
            {loading ? (
              <Card className="w-[1400px] px-4 py-6 md:px-6 md:py-8">
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                      <p className="text-lg font-medium">Analyzing Resumes...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : results ? (
              <Card className="w-[1400px] px-4 py-6 md:px-6 md:py-8">
                <CardContent>
                  <ResultsDisplay results={results} jobTitle={jobTitle} />
                </CardContent>
              </Card>
            ) : (
              <Card className="w-[1400px] px-4 py-6 md:px-6 md:py-8">
                <CardContent>
                  <div className="flex items-center justify-center h-40 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Select a job analysis to view candidates</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Saved Jobs Modal */}
      {showSavedJobs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Saved Jobs</h2>
              <button onClick={() => setShowSavedJobs(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            {savedJobsLoading ? (
              <div className="text-gray-600">Loading...</div>
            ) : savedJobsError ? (
              <div className="text-red-600 text-sm mb-2">{savedJobsError}</div>
            ) : savedJobs.length === 0 ? (
              <div className="text-gray-600">No saved jobs found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {savedJobs.map(job => (
                  <li key={job.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{job.job_title}</div>
                      <div className="text-xs text-gray-500">{new Date(job.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      onClick={() => handleLoadSavedJob(job.id)}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Scoring Logic Modal */}
      {showScoringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Scoring Logic</h2>
              <button onClick={() => setShowScoringModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <textarea
              className="w-full border rounded p-3 text-sm font-mono mb-4"
              rows={8}
              value={scoringLogic}
              onChange={e => setScoringLogic(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowScoringModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowScoringModal(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 