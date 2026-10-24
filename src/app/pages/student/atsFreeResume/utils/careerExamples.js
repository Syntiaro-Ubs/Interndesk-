const SKILL_CATEGORIES = {
    technology: [
        { key: 'programming', label: 'Programming Languages', placeholder: 'e.g. Java, Python, SQL, JavaScript', suggestions: ['Java', 'Python', 'SQL', 'JavaScript', 'C++'] },
        { key: 'frontend', label: 'Frontend & User Experience', placeholder: 'e.g. React, HTML, CSS, accessibility', suggestions: ['React', 'HTML', 'CSS', 'Accessibility', 'Figma'] },
        { key: 'backend', label: 'Systems & Infrastructure', placeholder: 'e.g. REST APIs, Linux, networking, security', suggestions: ['REST APIs', 'Linux', 'Networking', 'Cybersecurity', 'Cloud'] },
        { key: 'databases', label: 'Data & Reporting', placeholder: 'e.g. PostgreSQL, Excel, Power BI', suggestions: ['PostgreSQL', 'Excel', 'Power BI', 'MongoDB', 'Tableau'] },
        { key: 'frameworks', label: 'Platforms & Frameworks', placeholder: 'e.g. Spring, Django, .NET', suggestions: ['Spring', 'Django', '.NET', 'Node.js', 'Angular'] },
        { key: 'tools', label: 'Tools & Cloud', placeholder: 'e.g. Git, Docker, AWS, Azure', suggestions: ['Git', 'Docker', 'AWS', 'Azure', 'Kubernetes'] },
        { key: 'other', label: 'Methods & Core Competencies', placeholder: 'e.g. troubleshooting, Agile, system design', suggestions: ['Troubleshooting', 'Agile', 'System Design', 'Testing'] },
    ],
    engineering: [
        { key: 'programming', label: 'Engineering Software', placeholder: 'e.g. AutoCAD, SolidWorks, CATIA, ANSYS', suggestions: ['AutoCAD', 'SolidWorks', 'CATIA', 'ANSYS', 'MATLAB'] },
        { key: 'frontend', label: 'Design & Drafting', placeholder: 'e.g. 2D drafting, 3D modeling, GD&T', suggestions: ['2D Drafting', '3D Modeling', 'GD&T', 'Technical Drawing'] },
        { key: 'backend', label: 'Manufacturing & Processes', placeholder: 'e.g. CNC machining, Lean, Six Sigma', suggestions: ['CNC Machining', 'Lean Manufacturing', 'Six Sigma', 'Preventive Maintenance'] },
        { key: 'databases', label: 'Materials & Equipment', placeholder: 'e.g. alloys, hydraulic systems, PLCs', suggestions: ['Alloys', 'Hydraulic Systems', 'PLCs', 'Pneumatics'] },
        { key: 'frameworks', label: 'Quality & Standards', placeholder: 'e.g. ISO 9001, safety standards, inspection', suggestions: ['ISO 9001', 'Quality Control', 'Root Cause Analysis', 'Safety Standards'] },
        { key: 'tools', label: 'Tools & Machinery', placeholder: 'e.g. CNC machines, measuring instruments', suggestions: ['CNC Machines', 'Calipers', 'Micrometers', 'PLC'] },
        { key: 'other', label: 'Core Engineering Skills', placeholder: 'e.g. troubleshooting, project planning, analysis', suggestions: ['Troubleshooting', 'Project Planning', 'Technical Analysis', 'Teamwork'] },
    ],
    business: [
        { key: 'programming', label: 'Business & Data Tools', placeholder: 'e.g. Excel, Salesforce, Power BI', suggestions: ['Excel', 'Salesforce', 'Power BI', 'Tableau', 'SAP'] },
        { key: 'frontend', label: 'Customer & Communication', placeholder: 'e.g. client relations, presentations, negotiation', suggestions: ['Client Relations', 'Presentations', 'Negotiation', 'Customer Service'] },
        { key: 'backend', label: 'Operations & Processes', placeholder: 'e.g. sales operations, hiring, workflow planning', suggestions: ['Sales Operations', 'Recruitment', 'Workflow Planning', 'Vendor Management'] },
        { key: 'databases', label: 'Reporting & Administration', placeholder: 'e.g. forecasting, documentation, reporting', suggestions: ['Forecasting', 'Documentation', 'Reporting', 'Data Analysis'] },
        { key: 'frameworks', label: 'Industry Platforms', placeholder: 'e.g. CRM, ERP, accounting or HR systems', suggestions: ['CRM', 'ERP', 'QuickBooks', 'Workday'] },
        { key: 'tools', label: 'Productivity Tools', placeholder: 'e.g. Microsoft 365, Google Workspace, project tools', suggestions: ['Microsoft 365', 'Google Workspace', 'Asana', 'Trello'] },
        { key: 'other', label: 'Core Business Skills', placeholder: 'e.g. leadership, planning, problem solving', suggestions: ['Leadership', 'Planning', 'Problem Solving', 'Teamwork'] },
    ],
    healthcare: [
        { key: 'programming', label: 'Clinical & Office Systems', placeholder: 'e.g. electronic health records, MS Office', suggestions: ['Electronic Health Records', 'MS Office', 'Medical Records'] },
        { key: 'frontend', label: 'Patient Care', placeholder: 'e.g. patient assessment, care planning', suggestions: ['Patient Assessment', 'Care Planning', 'Patient Education'] },
        { key: 'backend', label: 'Clinical Procedures', placeholder: 'e.g. vital signs, medication administration', suggestions: ['Vital Signs', 'Medication Administration', 'First Aid'] },
        { key: 'databases', label: 'Documentation & Reporting', placeholder: 'e.g. clinical documentation, case notes', suggestions: ['Clinical Documentation', 'Case Notes', 'Incident Reporting'] },
        { key: 'frameworks', label: 'Standards & Compliance', placeholder: 'e.g. infection control, patient safety', suggestions: ['Infection Control', 'Patient Safety', 'HIPAA'] },
        { key: 'tools', label: 'Equipment & Tools', placeholder: 'e.g. diagnostic and monitoring equipment', suggestions: ['Patient Monitors', 'Diagnostic Equipment', 'PPE'] },
        { key: 'other', label: 'Core Care Skills', placeholder: 'e.g. communication, empathy, teamwork', suggestions: ['Communication', 'Empathy', 'Teamwork', 'Time Management'] },
    ],
    education: [
        { key: 'programming', label: 'Teaching & Learning Tools', placeholder: 'e.g. learning platforms, presentation tools', suggestions: ['Learning Management Systems', 'Google Classroom', 'PowerPoint'] },
        { key: 'frontend', label: 'Instruction & Lesson Planning', placeholder: 'e.g. lesson planning, differentiated instruction', suggestions: ['Lesson Planning', 'Differentiated Instruction', 'Assessment Design'] },
        { key: 'backend', label: 'Classroom & Program Management', placeholder: 'e.g. classroom management, student support', suggestions: ['Classroom Management', 'Student Support', 'Program Coordination'] },
        { key: 'databases', label: 'Assessment & Reporting', placeholder: 'e.g. grading, student progress reports', suggestions: ['Grading', 'Progress Reports', 'Student Records'] },
        { key: 'frameworks', label: 'Curriculum & Standards', placeholder: 'e.g. curriculum development, education standards', suggestions: ['Curriculum Development', 'Education Standards', 'IEP'] },
        { key: 'tools', label: 'Classroom Tools', placeholder: 'e.g. interactive boards, online learning tools', suggestions: ['Interactive Boards', 'Google Workspace', 'Educational Technology'] },
        { key: 'other', label: 'Core Education Skills', placeholder: 'e.g. communication, mentoring, organization', suggestions: ['Communication', 'Mentoring', 'Organization', 'Leadership'] },
    ],
};

function getCareerTrack(title = '') {
    const role = title.toLowerCase();
    if (/mechanical|manufactur|automotive|production|industrial|civil engineer|electrical engineer|electronics engineer|maintenance engineer|quality engineer|process engineer|hvac|cad designer/.test(role)) return 'engineering';
    if (/nurse|doctor|physician|health|medical|clinical|pharmac|therapist|dentist|caregiver/.test(role)) return 'healthcare';
    if (/teacher|educat|lecturer|professor|instructor|tutor|school/.test(role)) return 'education';
    if (/software|developer|programmer|information technology|\bit\b|data engineer|data analyst|cyber|network engineer|cloud engineer|systems engineer|web designer/.test(role)) return 'technology';
    if (/sales|market|accountant|accounting|finance|human resources|\bhr\b|recruit|business|admin|operations|customer|bank|consultant|manager/.test(role)) return 'business';
    return title.trim() ? 'business' : 'general';
}

const WORK_EXAMPLES = {
    technology: {
        accomplishment: 'e.g. Improved a system or service by solving a recurring issue and measuring the result.',
        project: 'e.g. Internal service improvement or customer support portal',
        projectRole: 'e.g. Project Contributor',
        methods: 'e.g. Tools, platforms, standards, or methods used in your role',
        projectDescription: 'e.g. Planned and delivered a solution to a user or business need, then measured its impact...',
        contribution: 'e.g. Streamlined a process and improved turnaround time by 20%.',
    },
    engineering: {
        accomplishment: 'e.g. Reduced production downtime by 15% through preventive maintenance improvements.',
        project: 'e.g. Production Line Efficiency Improvement',
        projectRole: 'e.g. Mechanical Design Engineer',
        methods: 'e.g. AutoCAD | SolidWorks | GD&T | Lean Manufacturing',
        projectDescription: 'e.g. Designed and evaluated a component to improve reliability, safety, or production efficiency...',
        contribution: 'e.g. Reduced cycle time by 12% by improving the assembly process.',
    },
    business: {
        accomplishment: 'e.g. Increased customer retention by 12% through a follow-up and service improvement plan.',
        project: 'e.g. Customer Retention Improvement Campaign',
        projectRole: 'e.g. Project Coordinator',
        methods: 'e.g. Excel | CRM | Reporting | Process Improvement',
        projectDescription: 'e.g. Planned and delivered an initiative to improve customer, team, or business outcomes...',
        contribution: 'e.g. Improved response time by 20% by organizing team workflows and follow-ups.',
    },
    healthcare: {
        accomplishment: 'e.g. Improved follow-up completion by 15% by coordinating patient reminders and care plans.',
        project: 'e.g. Patient Follow-up Workflow Improvement',
        projectRole: 'e.g. Care Team Contributor',
        methods: 'e.g. Patient care | Clinical documentation | Safety procedures',
        projectDescription: 'e.g. Coordinated a care or service improvement to support patient safety and continuity...',
        contribution: 'e.g. Improved appointment follow-up by coordinating reminders with the care team.',
    },
    education: {
        accomplishment: 'e.g. Increased student assignment completion by 18% through structured progress check-ins.',
        project: 'e.g. Student Engagement and Progress Program',
        projectRole: 'e.g. Program Coordinator',
        methods: 'e.g. Lesson planning | Assessment | Learning platforms',
        projectDescription: 'e.g. Designed and delivered a learning activity or program to improve student outcomes...',
        contribution: 'e.g. Improved assignment completion by 18% with regular feedback and progress tracking.',
    },
    general: {
        accomplishment: 'e.g. Improved a team process by 15% through planning, coordination, or service improvements.',
        project: 'e.g. Team Process Improvement Initiative',
        projectRole: 'e.g. Project Contributor',
        methods: 'e.g. Tools, equipment, standards, or methods relevant to your field',
        projectDescription: 'e.g. Organized and completed a project that solved a practical need or improved a result...',
        contribution: 'e.g. Reduced turnaround time by improving coordination and tracking.',
    },
};

export function getCareerExamples(title = '') {
    const track = getCareerTrack(title);
    const examples = WORK_EXAMPLES[track];
    return {
        experienceTitle: title.trim() ? `e.g. ${title.trim()}` : 'e.g. Job title or role',
        accomplishment: examples.accomplishment,
        project: examples.project,
        projectRole: examples.projectRole,
        methods: examples.methods,
        projectDescription: examples.projectDescription,
        contribution: examples.contribution,
    };
}

export function getCareerSkillCategories(title = '') {
    return SKILL_CATEGORIES[getCareerTrack(title)] || [
        { key: 'programming', label: 'Core Skills', placeholder: 'e.g. Skills and knowledge used in your role', suggestions: ['Communication', 'Planning', 'Problem Solving', 'Teamwork'] },
        ...SKILL_CATEGORIES.business.slice(1),
    ];
}
