import React, { useState, useEffect } from "react";

const JOB_ROLES = {
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

export default function JobDescriptionInput({ value, onChange }) {
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedRole, setSelectedRole] = useState("Data Scientist");

  // Set initial value when component mounts
  useEffect(() => {
    if (!value) {
      onChange({ target: { value: JOB_ROLES["Data Scientist"] } });
    }
  }, []);

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    onChange({ target: { value: JOB_ROLES[role] } });
  };

  const handleModeChange = (isTemplate) => {
    setUseTemplate(isTemplate);
    if (isTemplate) {
      // When switching to template mode, set the first role as default
      setSelectedRole("Data Scientist");
      onChange({ target: { value: JOB_ROLES["Data Scientist"] } });
    } else {
      // When switching to custom mode, keep the current value
      onChange({ target: { value: value } });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={useTemplate}
            onChange={() => handleModeChange(true)}
            className="form-radio h-4 w-4 text-black focus:ring-black"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Use Template</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={!useTemplate}
            onChange={() => handleModeChange(false)}
            className="form-radio h-4 w-4 text-black focus:ring-black"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Custom Job Description</span>
        </label>
      </div>

      {useTemplate ? (
        <div className="space-y-2">
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {Object.keys(JOB_ROLES).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <textarea
            value={value}
            onChange={onChange}
            placeholder="Select a role to see the template..."
            className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            readOnly={useTemplate}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={onChange}
            placeholder="Enter your custom job description here..."
            className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p className="text-xs text-gray-500">
            Include key responsibilities, required skills, and qualifications
          </p>
        </div>
      )}
    </div>
  );
} 