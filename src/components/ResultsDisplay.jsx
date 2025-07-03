import React, { useState, useEffect } from "react";
import { FaTable, FaThLarge, FaClipboardList, FaCalendarAlt, FaTimesCircle, FaEnvelopeOpenText, FaCircle, FaSave } from 'react-icons/fa';
import * as XLSX from "xlsx";

// Add status constants
const CANDIDATE_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  REJECTED: 'rejected'
};

// Add status colors
const STATUS_COLORS = {
  [CANDIDATE_STATUS.NEW]: 'text-gray-400',
  [CANDIDATE_STATUS.CONTACTED]: 'text-black',
  [CANDIDATE_STATUS.REJECTED]: 'text-red-500'
};

// Add status labels
const STATUS_LABELS = {
  [CANDIDATE_STATUS.NEW]: 'New',
  [CANDIDATE_STATUS.CONTACTED]: 'Contacted',
  [CANDIDATE_STATUS.REJECTED]: 'Rejected'
};

// Scheduling Modal Component
function SchedulingModal({ isOpen, onClose, selectedCandidates, onSchedule, fields, setFields }) {
  const handleChange = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule({
      ...fields,
      candidates: selectedCandidates
    });
    // Optionally reset fields here if you want
    // setFields({ ...initial values... });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule Individual Interviews</h2>
            <p className="text-gray-500 text-sm mt-1">Set up interviews with selected candidates.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Title</label>
            <input
              type="text"
              value={fields.interviewTitle}
              onChange={e => handleChange('interviewTitle', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Description</label>
            <textarea
              value={fields.interviewDescription}
              onChange={e => handleChange('interviewDescription', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
              rows="2"
              placeholder="Add any additional details about the interview..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer Name</label>
              <input
                type="text"
                value={fields.interviewerName}
                onChange={e => handleChange('interviewerName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer Email</label>
              <input
                type="email"
                value={fields.interviewerEmail}
                onChange={e => handleChange('interviewerEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </span>
                <input
                  type="datetime-local"
                  value={fields.startDate}
                  onChange={e => handleChange('startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base placeholder-gray-400"
                  placeholder="Select date and time"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </span>
                <input
                  type="datetime-local"
                  value={fields.endDate}
                  onChange={e => handleChange('endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base placeholder-gray-400"
                  placeholder="Select date and time"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Duration (minutes)</label>
            <select
              value={fields.duration}
              onChange={e => handleChange('duration', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selected Candidates ({selectedCandidates.length}):</label>
            <ul className="list-disc list-inside text-gray-900 text-base mt-1">
              {selectedCandidates.map((candidate, index) => (
                <li key={index}>{candidate.fileName}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-900"
            >
              Schedule Individual Interviews
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper to format ISO string to local datetime-local input value
function formatLocalForInput(dateString) {
  const date = new Date(dateString);
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Calendar Review Table Modal Component
function CalendarReviewTableModal({ isOpen, onClose, events, setEvents, onAddAll, loading }) {
  if (!isOpen) return null;

  const handleTimeChange = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = new Date(value).toISOString();
    updatedEvents[index][field + 'Local'] = new Date(value).toLocaleString();
    setEvents(updatedEvents);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Review & Edit Calendar Events</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Candidate</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Start Time</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">End Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {events.map((event, idx) => (
                <tr key={event.fileName}>
                  <td className="px-4 py-2 whitespace-nowrap">{event.candidateName || event.fileName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="datetime-local"
                      value={event.startTime ? formatLocalForInput(event.startTime) : ''}
                      onChange={e => handleTimeChange(idx, 'startTime', e.target.value)}
                      className="border rounded p-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">{event.startTimeLocal}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="datetime-local"
                      value={event.endTime ? formatLocalForInput(event.endTime) : ''}
                      onChange={e => handleTimeChange(idx, 'endTime', e.target.value)}
                      className="border rounded p-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">{event.endTimeLocal}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onAddAll}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add All Events to Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Rejection Emails Modal Component
function RejectionEmailsModal({ isOpen, onClose, unselectedCandidates, onStatusUpdate }) {
  const [mailBody, setMailBody] = useState("");

  // Generate the default sample rejection email
  const sampleBody = `Dear Candidate,\n\nThank you for your interest in the position and for taking the time to apply. We appreciate the effort you put into your application.\n\nAfter careful consideration of your application and the current requirements of the role, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe were impressed with your background and experience, and we encourage you to apply for future positions that match your skills and interests.\n\nWe wish you the best in your job search and future professional endeavors.\n\nBest regards,\nThe Hiring Team`;

  // Reset mailBody to sampleBody every time the modal is opened
  React.useEffect(() => {
    if (isOpen) setMailBody(sampleBody);
  }, [isOpen]);

  // Get all valid email addresses
  const validCandidates = unselectedCandidates
    .map(candidate => candidate.analysis?.email)
    .filter(email => email && email !== 'No email found');

  const handleOpenGmail = () => {
    if (validCandidates.length === 0) return;
    const recipients = validCandidates.join(',');
    const subject = "Application Status Update";
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&bcc=${encodeURIComponent(recipients)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
    window.open(mailtoLink, '_blank');
    
    // Update statuses for rejected candidates
    onStatusUpdate(unselectedCandidates);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Rejection Email</h2>
          <div className="flex items-center gap-4">
            {validCandidates.length > 0 && (
              <button
                onClick={handleOpenGmail}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Open in Gmail
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {validCandidates.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No valid email addresses found for unselected candidates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Edit the rejection email below. When ready, click "Open in Gmail" to send to all unselected candidates.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
              <textarea
                value={mailBody}
                onChange={e => setMailBody(e.target.value)}
                rows={12}
                className="w-full p-3 border rounded font-mono text-sm"
              />
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ results, jobTitle, canSave = true }) {
  const [viewMode, setViewMode] = useState("table");
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [calendarLinks, setCalendarLinks] = useState([]);
  const [showRejectionEmails, setShowRejectionEmails] = useState(false);
  const [loadingAddAll, setLoadingAddAll] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [candidateStatuses, setCandidateStatuses] = useState({});
  const [numCandidatesToSelect, setNumCandidatesToSelect] = useState("");
  // Save Results Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveJobTitle, setSaveJobTitle] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Scheduling modal fields state (lifted up)
  const [schedulingFields, setSchedulingFields] = useState({
    startDate: "",
    endDate: "",
    duration: 30,
    interviewerName: "",
    interviewerEmail: "",
    interviewTitle: "Technical Interview",
    interviewDescription: ""
  });
  
  // Extract results array from the response object
  const resultsArray = results?.results || [];
  
  // Check if results is an error object
  if (results && results.error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-medium text-red-600 mb-4">Error</h2>
        <p className="text-gray-800">{results.error}</p>
      </div>
    );
  }
  
  // Generate comparative summary
  const generateSummary = () => {
    if (!resultsArray || resultsArray.length === 0) return null;
    
    // Filter out error results
    const validResults = resultsArray.filter(r => r.analysis);
    
    if (validResults.length === 0) return null;
    
    // Find top candidate
    const topCandidate = validResults[0]; // Already sorted by totalScore
    
    // Find average scores
    const avgSkills = validResults.reduce((sum, r) => sum + r.analysis.skillsMatch, 0) / validResults.length;
    const avgExperience = validResults.reduce((sum, r) => sum + r.analysis.experienceRelevance, 0) / validResults.length;
    const avgEducation = validResults.reduce((sum, r) => sum + r.analysis.educationFit, 0) / validResults.length;
    const avgProject = validResults.reduce((sum, r) => sum + r.analysis.projectImpact, 0) / validResults.length;
    const avgTotal = validResults.reduce((sum, r) => sum + r.analysis.totalScore, 0) / validResults.length;
    
    return {
      topCandidate: topCandidate.fileName,
      topScore: topCandidate.analysis.totalScore,
      averageScore: avgTotal.toFixed(1),
      candidateCount: validResults.length,
      topStrengths: topCandidate.analysis.keyStrengths,
      comparisons: [
        {
          category: "Skills Match",
          topScore: topCandidate.analysis.skillsMatch,
          avgScore: avgSkills.toFixed(1),
        },
        {
          category: "Experience",
          topScore: topCandidate.analysis.experienceRelevance,
          avgScore: avgExperience.toFixed(1),
        },
        {
          category: "Education",
          topScore: topCandidate.analysis.educationFit,
          avgScore: avgEducation.toFixed(1),
        },
        {
          category: "Project Impact",
          topScore: topCandidate.analysis.projectImpact,
          avgScore: avgProject.toFixed(1),
        }
      ]
    };
  };
  
  const summary = generateSummary();
  
  const handleCandidateSelect = (candidate) => {
    setSelectedCandidates(prev => {
      const isSelected = prev.some(c => c.fileName === candidate.fileName);
      if (isSelected) {
        return prev.filter(c => c.fileName !== candidate.fileName);
      } else {
        return [...prev, candidate];
      }
    });
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const handleSchedule = async (scheduleData) => {
    try {
      const { startDate, endDate, duration, candidates } = scheduleData;
      const startTime = new Date(startDate);
      const endTime = new Date(endDate);
      const interviewDuration = duration * 60 * 1000;
      const numInterviews = Math.floor((endTime - startTime) / interviewDuration);

      if (numInterviews < candidates.length) {
        alert(`Not enough time slots for all candidates. You have ${candidates.length} candidates but only ${numInterviews} time slots available.`);
        return;
      }

      // Create calendar events for each candidate
      const events = candidates.map((candidate, index) => {
        const interviewStart = new Date(startTime.getTime() + (index * interviewDuration));
        const interviewEnd = new Date(interviewStart.getTime() + interviewDuration);
        const candidateName = candidate.analysis?.candidateName || candidate.fileName;
        return {
          title: `${scheduleData.interviewTitle} with ${candidateName}`,
          description: `${scheduleData.interviewDescription}\n\nInterviewer: ${scheduleData.interviewerName} (${scheduleData.interviewerEmail})\nCandidate: ${candidateName}`,
          startTime: interviewStart.toISOString(),
          endTime: interviewEnd.toISOString(),
          startTimeLocal: interviewStart.toLocaleString(),
          endTimeLocal: interviewEnd.toLocaleString(),
          attendees: [
            scheduleData.interviewerEmail,
            candidate.analysis?.email
          ].filter(email => email && email !== 'No email found'),
          fileName: candidate.fileName,
          candidateName
        };
      });

      setCalendarLinks(events);
      setShowSchedulingModal(false);
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error creating calendar events:', error);
      alert('Error creating calendar events. Please try again.');
    }
  };

  const handleDeselectAll = () => {
    setSelectedCandidates([]);
  };

  const handleSendRejectionEmails = () => {
    const unselectedCandidates = resultsArray.filter(
      candidate => !selectedCandidates.some(selected => selected.fileName === candidate.fileName)
    );
    setShowRejectionEmails(true);
  };

  const handleRejectionStatusUpdate = (rejectedCandidates) => {
    const newStatuses = { ...candidateStatuses };
    rejectedCandidates.forEach(candidate => {
      newStatuses[candidate.fileName] = CANDIDATE_STATUS.REJECTED;
    });
    setCandidateStatuses(newStatuses);
  };

  // Add handler for Add All Events
  const handleAddAllEvents = async () => {
    setLoadingAddAll(true);
    try {
      // First create the calendar events
      const calendarResponse = await fetch('https://resume-rank.onrender.com/api/n8n/create-calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: calendarLinks }),
      });
      
      if (!calendarResponse.ok) {
        throw new Error('Failed to create calendar events');
      }

      // Send email notifications to all attendees
      const emailPromises = calendarLinks.map(event => {
        const recipients = event.attendees.filter(email => email && email !== 'No email found');
        if (recipients.length === 0) return Promise.resolve();

        const subject = `Calendar Invitation: ${event.title}`;
        const body = `
Dear ${event.candidateName || 'Candidate'},

Your interview has been scheduled:

Title: ${event.title}
Date: ${new Date(event.startTime).toLocaleDateString()}
Time: ${new Date(event.startTime).toLocaleTimeString()} - ${new Date(event.endTime).toLocaleTimeString()}
Description: ${event.description}

A calendar invitation has been sent to your email address. Please accept the invitation to confirm your attendance.

Best regards,
The Hiring Team
        `;

        return fetch('/api/n8n/send-rejection-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipients, subject, body }),
        });
      });

      await Promise.all(emailPromises);
      
      // Update candidate statuses after successful calendar event creation
      const newStatuses = { ...candidateStatuses };
      calendarLinks.forEach(event => {
        newStatuses[event.fileName] = CANDIDATE_STATUS.CONTACTED;
      });
      setCandidateStatuses(newStatuses);
      
      setShowReviewModal(false);
      setCalendarLinks([]);
      alert('All events added to calendar and notifications sent!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add events to calendar or send notifications.');
    } finally {
      setLoadingAddAll(false);
    }
  };

  // Get status for a candidate
  const getCandidateStatus = (candidate) => {
    return candidateStatuses[candidate.fileName] || CANDIDATE_STATUS.NEW;
  };

  // Status badge component
  const StatusBadge = ({ status }) => (
    <div className="flex items-center space-x-1">
      <FaCircle className={`h-2 w-2 ${STATUS_COLORS[status]}`} />
      <span className={`text-xs font-medium ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    </div>
  );

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setShowSummary(false); // Hide summary when changing view mode
  };

  const handleSelectTopCandidates = () => {
    const num = parseInt(numCandidatesToSelect);
    if (isNaN(num) || num <= 0) return;
    
    const topCandidates = resultsArray
      .filter(candidate => !candidate.error)
      .slice(0, num);
    
    setSelectedCandidates(topCandidates);
  };

  // Export to XLSX handler
  const handleExportXLSX = () => {
    const exportData = resultsArray.map((candidate, idx) => ({
      "#": idx + 1,
      "Candidate": candidate.analysis?.candidateName || candidate.fileName,
      "Email": candidate.analysis?.email || "",
      "Skills": candidate.analysis?.skillsMatch ?? "",
      "Experience": candidate.analysis?.experienceRelevance ?? "",
      "Education": candidate.analysis?.educationFit ?? "",
      "Projects": candidate.analysis?.projectImpact ?? "",
      "Overall": candidate.analysis?.totalScore ?? "",
      "Key Strengths": candidate.analysis?.keyStrengths?.join("; ") ?? "",
      "Areas for Improvement": candidate.analysis?.areasForImprovement?.join("; ") ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, "candidates.xlsx");
  };

  return (
    <div className="p-6 relative">
      {/* Job Title Header and Save Button */}
      {canSave && (
        <button
          className="absolute top-0 right-0 mt-4 mr-4 z-10 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={() => setShowSaveModal(true)}
        >
          <FaSave className="mr-2" />
          Save Results
        </button>
      )}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{jobTitle || "Job Title"}</h2>
        <p className="text-sm text-gray-500 mt-2">Found {resultsArray.length} candidates</p>
      </div>

      {/* Select Top Candidates Input */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={resultsArray.length}
            value={numCandidatesToSelect}
            onChange={(e) => setNumCandidatesToSelect(e.target.value)}
            placeholder="Number of top candidates"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
          <button
            onClick={handleSelectTopCandidates}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Select Top Candidates
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-end items-center mb-6 gap-4">
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => handleViewModeChange("table")}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${
              viewMode === "table"
                ? "bg-black border-black text-white"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaTable className="mr-2" />
            Table
          </button>
          <button
            onClick={() => handleViewModeChange("cards")}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium ${
              viewMode === "cards"
                ? "bg-black border-black text-white"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaThLarge className="mr-2" />
            Cards
          </button>
        </div>
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
        >
          <FaClipboardList className="mr-2" />
          Summary
        </button>
      </div>

      {/* Summary Section */}
      {showSummary && summary && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Top Candidate</h4>
              <p className="text-lg font-medium text-gray-900">{summary.topCandidate}</p>
              <p className="text-sm text-gray-500">Score: {summary.topScore}/10</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Overall Statistics</h4>
              <p className="text-sm text-gray-900">Average Score: {summary.averageScore}/10</p>
              <p className="text-sm text-gray-900">Total Candidates: {summary.candidateCount}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Category Comparisons</h4>
              <div className="space-y-4">
                {summary.comparisons.map((comparison, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{comparison.category}</span>
                      <span className="text-sm text-gray-500">
                        Top: {comparison.topScore}/10 | Avg: {comparison.avgScore}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full"
                        style={{ width: `${(comparison.topScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedCandidates.length > 0 && (
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={() => setShowSchedulingModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900"
          >
            <FaCalendarAlt className="mr-2" />
            Schedule Interviews
          </button>
          <button
            onClick={() => setShowRejectionEmails(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <FaEnvelopeOpenText className="mr-2" />
            Send Rejection Emails
          </button>
          <button
            onClick={() => setSelectedCandidates([])}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaTimesCircle className="mr-2" />
            Clear Selection
          </button>
        </div>
      )}

      {/* Results Display */}
      {viewMode === "table" ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Education
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultsArray.map((candidate, index) => (
                  <tr key={index} className={candidate.error ? "bg-red-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.some(c => c.fileName === candidate.fileName)}
                        onChange={() => handleCandidateSelect(candidate)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={getCandidateStatus(candidate)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.analysis?.candidateName || candidate.fileName}
                      </div>
                    </td>
                    {candidate.error ? (
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                        {candidate.error}
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.analysis.skillsMatch}/10</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.analysis.experienceRelevance}/10</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.analysis.educationFit}/10</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.analysis.projectImpact}/10</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{candidate.analysis.totalScore}/100</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewDetails(candidate)}
                            className="text-black hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleExportXLSX}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save as XLSX
            </button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultsArray.map((candidate, index) => (
            <div
              key={index}
              className={`bg-white overflow-hidden shadow rounded-lg ${
                candidate.error ? "border border-red-300" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {candidate.analysis?.candidateName || candidate.fileName}
                    </h3>
                    <StatusBadge status={getCandidateStatus(candidate)} />
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCandidates.some(c => c.fileName === candidate.fileName)}
                    onChange={() => handleCandidateSelect(candidate)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                </div>
                {candidate.error ? (
                  <div className="mt-4 text-sm text-red-500">{candidate.error}</div>
                ) : (
                  <div className="space-y-4">
                    {/* Overview Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Overview</h4>
                      <div className="space-y-2">
                        {candidate.analysis?.email && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {candidate.analysis.email}
                          </p>
                        )}
                        {candidate.analysis?.keyStrengths && candidate.analysis.keyStrengths.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Key Strengths:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {candidate.analysis.keyStrengths.slice(0, 2).map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scores Section */}
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Skills Match</span>
                        <span className="text-gray-900">{candidate.analysis.skillsMatch}/10</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full"
                          style={{ width: `${(candidate.analysis.skillsMatch / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Experience</span>
                        <span className="text-gray-900">{candidate.analysis.experienceRelevance}/10</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full"
                          style={{ width: `${(candidate.analysis.experienceRelevance / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Education</span>
                        <span className="text-gray-900">{candidate.analysis.educationFit}/10</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full"
                          style={{ width: `${(candidate.analysis.educationFit / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Projects</span>
                        <span className="text-gray-900">{candidate.analysis.projectImpact}/10</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full"
                          style={{ width: `${(candidate.analysis.projectImpact / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Overall Score</span>
                        <span className="text-lg font-bold text-black">{candidate.analysis.totalScore}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <button
                  onClick={() => handleViewDetails(candidate)}
                  className="text-sm font-medium text-black hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Candidate Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {selectedCandidate.analysis?.candidateName || selectedCandidate.fileName}
                  </p>
                  {selectedCandidate.analysis?.email && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {selectedCandidate.analysis.email}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Key Strengths</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {selectedCandidate.analysis?.keyStrengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Areas for Improvement</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {selectedCandidate.analysis?.areasForImprovement.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analysis</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedCandidate.analysis?.analysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showSchedulingModal && (
        <SchedulingModal
          isOpen={showSchedulingModal}
          onClose={() => setShowSchedulingModal(false)}
          selectedCandidates={selectedCandidates}
          onSchedule={handleSchedule}
          fields={schedulingFields}
          setFields={setSchedulingFields}
        />
      )}
      {showReviewModal && (
        <CalendarReviewTableModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          events={calendarLinks}
          setEvents={setCalendarLinks}
          onAddAll={handleAddAllEvents}
          loading={loadingAddAll}
        />
      )}
      {showRejectionEmails && (
        <RejectionEmailsModal
          isOpen={showRejectionEmails}
          onClose={() => setShowRejectionEmails(false)}
          unselectedCandidates={resultsArray.filter(
            candidate => !selectedCandidates.some(selected => selected.fileName === candidate.fileName)
          )}
          onStatusUpdate={handleRejectionStatusUpdate}
        />
      )}

      {/* Save Results Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Save Results</h2>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={saveJobTitle}
                onChange={e => setSaveJobTitle(e.target.value)}
                placeholder="Enter a job title for these results"
              />
            </div>
            {saveError && <div className="text-red-600 text-sm mb-2">{saveError}</div>}
            {saveSuccess && <div className="text-green-600 text-sm mb-2">Results saved successfully!</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowSaveModal(false)}
                disabled={saveLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={async () => {
                  setSaveLoading(true);
                  setSaveError("");
                  setSaveSuccess(false);
                  try {
                    const response = await fetch("/api/save-job", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ jobTitle: saveJobTitle, results }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      setSaveSuccess(true);
                      setTimeout(() => {
                        setShowSaveModal(false);
                        setSaveSuccess(false);
                        setSaveJobTitle("");
                      }, 1200);
                    } else {
                      setSaveError(data.error || "Failed to save results");
                    }
                  } catch (err) {
                    setSaveError("Failed to save results");
                  } finally {
                    setSaveLoading(false);
                  }
                }}
                disabled={saveLoading || !saveJobTitle}
              >
                {saveLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
