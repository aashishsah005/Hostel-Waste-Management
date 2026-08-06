const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();

pptx.layout = 'LAYOUT_16x9';
pptx.title = 'Smart Hostel Food Waste Prediction & Management System';
pptx.author = 'Aashish & Team';
pptx.company = 'Department of Computer Science & Engineering';

// Theme Colors
const COLOR_BG_DARK = '1F3629';    // Forest Green
const COLOR_BG_CARD = 'F7F5EB';    // Paper Cream
const COLOR_TEXT_DARK = '1C221E';  // Ink Black
const COLOR_TEXT_LIGHT = 'F7F5EB'; // Light Cream
const COLOR_TURMERIC = 'DFA13B';   // Accent Warm Gold
const COLOR_CLAY = 'A64B34';       // Accent Red Clay
const COLOR_SAGE = '7C9473';       // Accent Sage Green
const COLOR_WHITE = 'FFFFFF';

const addSlideHeader = (slide, tag, title) => {
  // Slide Tag
  slide.addText(tag.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 11.5,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Courier New',
    bold: true,
    color: COLOR_SAGE,
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.7,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Georgia',
    bold: true,
    color: COLOR_TEXT_DARK,
  });
};

const addFooter = (slide, slideNum) => {
  slide.addText(`Hostel Waste Management System  |  Slide ${slideNum}`, {
    x: 0.8,
    y: 7.0,
    w: 11.7,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Arial',
    color: '999999',
  });
};

// ==========================================
// SLIDE 1: COVER SLIDE
// ==========================================
const s1 = pptx.addSlide();
s1.background = { color: COLOR_BG_DARK };

s1.addText('MINOR PROJECT PRESENTATION', {
  x: 1.0, y: 1.5, w: 11.3, h: 0.4,
  fontSize: 12, fontFace: 'Courier New', bold: true, color: COLOR_TURMERIC, tracking: 3
});

s1.addText('Smart Hostel Food Waste\nPrediction & Management System', {
  x: 1.0, y: 2.1, w: 11.3, h: 2.0,
  fontSize: 34, fontFace: 'Georgia', bold: true, color: COLOR_TEXT_LIGHT, leading: 42
});

s1.addText('A Full MERN-Stack Ecosystem for Demand Forecasting, Waste Analytics & Visitor Pass Management', {
  x: 1.0, y: 4.2, w: 10.5, h: 0.6,
  fontSize: 15, fontFace: 'Calibri', color: 'C8D6CD'
});

s1.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 5.2, w: 11.33, h: 0.02, fill: { color: COLOR_TURMERIC } });

s1.addText('Presented by: Department of Computer Science & Engineering\nTech Stack: MongoDB Atlas | Express.js | React | Node.js', {
  x: 1.0, y: 5.6, w: 11.3, h: 0.8,
  fontSize: 12, fontFace: 'Calibri', color: COLOR_TEXT_LIGHT
});

// ==========================================
// SLIDE 2: PROBLEM STATEMENT
// ==========================================
const s2 = pptx.addSlide();
addSlideHeader(s2, '01. Background & Motivation', 'The Problem with Traditional Hostel Mess Management');
addFooter(s2, 2);

s2.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 3.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s2.addText('Kitchen Uncertainty', { x: 1.0, y: 1.8, w: 3.2, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_CLAY });
s2.addText('Chefs cook for full capacity without knowing actual daily attendance, causing 15-20% food waste daily or sudden food shortages.', { x: 1.0, y: 2.3, w: 3.2, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 20 });

s2.addShape(pptx.shapes.RECTANGLE, { x: 4.8, y: 1.5, w: 3.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s2.addText('Lack of Root-Cause Data', { x: 5.0, y: 1.8, w: 3.2, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_TURMERIC });
s2.addText('Administration lacks structured data to identify why food was wasted (e.g. exam periods, holidays, weather, or unpopular menu items).', { x: 5.0, y: 2.3, w: 3.2, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 20 });

s2.addShape(pptx.shapes.RECTANGLE, { x: 8.8, y: 1.5, w: 3.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s2.addText('Financial & CO2e Losses', { x: 9.0, y: 1.8, w: 3.2, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
s2.addText('Wasted food depletes hostel budgets (₹60/kg cost basis) and generates unnecessary carbon emissions (2.5 kg CO2e per kg wasted).', { x: 9.0, y: 2.3, w: 3.2, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 20 });

// ==========================================
// SLIDE 3: OBJECTIVES
// ==========================================
const s3 = pptx.addSlide();
addSlideHeader(s3, '02. Project Objectives', 'Project Goals & Operational Scope');
addFooter(s3, 3);

const s3Items = [
  { title: 'Real-Time Student Signals', desc: 'Allow students to confirm or cancel meal attendance up to a day prior to cooking.' },
  { title: 'Predictive Demand Engine', desc: 'Calculate optimal cooking quantities by blending live RSVPs with historical averages.' },
  { title: 'Root-Cause Waste Tagging', desc: 'Enable mess managers to log daily food prep vs. consumed and tag specific waste causes.' },
  { title: 'Visitor Pass & QR Generator', desc: 'Provide an instant guest registration system that issues encrypted QR passes for gate entry.' }
];

s3Items.forEach((item, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const x = 0.8 + col * 5.8;
  const y = 1.5 + row * 2.6;

  s3.addShape(pptx.shapes.RECTANGLE, { x, y, w: 5.5, h: 2.3, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
  s3.addText(`0${idx+1}. ${item.title}`, { x: x + 0.3, y: y + 0.3, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
  s3.addText(item.desc, { x: x + 0.3, y: y + 0.8, w: 5.0, h: 1.2, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 18 });
});

// ==========================================
// SLIDE 4: PROPOSED SYSTEM & INNOVATIONS
// ==========================================
const s4 = pptx.addSlide();
addSlideHeader(s4, '03. Proposed Solution', 'System Highlights & Key Innovations');
addFooter(s4, 4);

s4.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s4.addText('Traditional Mess System', { x: 1.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_CLAY });
s4.addText('• Fixed quantity preparation based on guesswork\n• Paper-based or non-existent waste tracking\n• Unplanned visitor influx causing food shortage\n• No feedback loop connecting food quality to waste\n• Manual, uncoordinated record keeping', { x: 1.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 24 });

s4.addShape(pptx.shapes.RECTANGLE, { x: 6.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: COLOR_BG_DARK, width: 2 } });
s4.addText('Proposed Smart System', { x: 7.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
s4.addText('• RSVP-driven predictive demand forecasting\n• Daily digital logging with root-cause tagging\n• Self-service Visitor Pass generation with QR verification\n• Integrated rating & NLP keyword feedback extraction\n• Automated financial & carbon impact calculation', { x: 7.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 24 });

// ==========================================
// SLIDE 5: SYSTEM ARCHITECTURE
// ==========================================
const s5 = pptx.addSlide();
addSlideHeader(s5, '04. Architecture', 'System Architecture & Data Pipeline');
addFooter(s5, 5);

const archBlocks = [
  { name: 'React 18 Frontend', sub: 'Tailwind CSS, Recharts, Axios SPA', bg: '2F4B3C', fg: 'FFFFFF' },
  { name: 'Express REST API', sub: 'Node.js, JWT Middleware, Morgan', bg: 'DFA13B', fg: '1C221E' },
  { name: 'MongoDB Database', sub: 'Mongoose Schemas, MongoDB Atlas', bg: 'A64B34', fg: 'FFFFFF' }
];

archBlocks.forEach((b, i) => {
  const x = 0.8 + i * 4.0;
  s5.addShape(pptx.shapes.RECTANGLE, { x, y: 1.6, w: 3.6, h: 1.8, fill: { color: b.bg } });
  s5.addText(b.name, { x, y: 1.9, w: 3.6, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: b.fg, align: 'center' });
  s5.addText(b.sub, { x, y: 2.4, w: 3.6, h: 0.6, fontSize: 12, fontFace: 'Calibri', color: b.fg, align: 'center' });
});

s5.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 3.8, w: 11.6, h: 2.8, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s5.addText('End-to-End Data Pipeline Flow:', { x: 1.1, y: 4.1, w: 11.0, h: 0.3, fontSize: 14, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
s5.addText('1. Student confirms meal RSVP → Entry persisted in Booking collection.\n2. Prediction Controller fetches 30-day FoodEntry history + live RSVPs → Computes recommended prep.\n3. Mess Manager inputs prepared/consumed count → Updates FoodEntry with waste reason.\n4. Analytics Controller aggregates figures → Dynamically renders 30-day waste, cost, & carbon dashboards.', { x: 1.1, y: 4.5, w: 11.0, h: 1.9, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 22 });

// ==========================================
// SLIDE 6: DATABASE SCHEMA DESIGN
// ==========================================
const s6 = pptx.addSlide();
addSlideHeader(s6, '05. Database Design', 'MongoDB Document Schemas & Collections');
addFooter(s6, 6);

const schemas = [
  { name: 'User Collection', fields: 'name, email, password, role (admin/mess_manager/student/visitor), hostelBlock, roomNumber' },
  { name: 'Booking Collection', fields: 'student (Ref User), date, mealType, status, tokenCode, phone, purpose\n*Compound unique index: (student, date, mealType)' },
  { name: 'FoodEntry Collection', fields: 'date, mealType, mealsBooked, mealsPrepared, mealsConsumed, foodWastedKg, wasteReason, recordedBy' },
  { name: 'Feedback Collection', fields: 'user (Ref User), mealType, tasteRating, cleanlinessRating, serviceRating, comment' }
];

schemas.forEach((s, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const x = 0.8 + col * 5.8;
  const y = 1.5 + row * 2.6;

  s6.addShape(pptx.shapes.RECTANGLE, { x, y, w: 5.5, h: 2.3, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
  s6.addText(s.name, { x: x + 0.3, y: y + 0.3, w: 5.0, h: 0.4, fontSize: 15, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
  s6.addText(s.fields, { x: x + 0.3, y: y + 0.8, w: 5.0, h: 1.3, fontSize: 12, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 18 });
});

// ==========================================
// SLIDE 7: MODULE 1 - STUDENT & VISITOR
// ==========================================
const s7 = pptx.addSlide();
addSlideHeader(s7, '06. Core Module 1', 'Student Booking & Visitor QR Token Engine');
addFooter(s7, 7);

s7.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s7.addText('Student Meal RSVPs', { x: 1.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
s7.addText('• Weekly Menu Browser: Shows daily items & pricing.\n• One-Tap RSVPs: Confirm breakfast, lunch, snacks, dinner.\n• Cancellation Rules: Permits cancellation prior to cut-off.\n• Booking History: View past & upcoming meal status.', { x: 1.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 22 });

s7.addShape(pptx.shapes.RECTANGLE, { x: 6.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: COLOR_TURMERIC, width: 2 } });
s7.addText('Visitor QR Pass Generator', { x: 7.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_TURMERIC });
s7.addText('• Registration Form: Full Name, Phone, Purpose, Date, & Meal.\n• Dynamic QR Code Generation: Encodes token code & details.\n• Unique Pass Code: Formatted token ID (e.g. VIS-RUWT3W).\n• Gate Authorization: Gate instructions for seamless mess entry.', { x: 7.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 22 });

// ==========================================
// SLIDE 8: MODULE 2 - MESS MANAGER & PREDICTION
// ==========================================
const s8 = pptx.addSlide();
addSlideHeader(s8, '07. Core Module 2', 'Mess Manager Control & Demand Prediction Model');
addFooter(s8, 8);

s8.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 11.6, h: 1.6, fill: { color: COLOR_BG_DARK } });
s8.addText('Weighted Demand Prediction Formula:', { x: 1.1, y: 1.7, w: 11.0, h: 0.3, fontSize: 14, fontFace: 'Georgia', bold: true, color: COLOR_TURMERIC });
s8.addText('Predicted Demand = (α × Live Bookings) + ((1 - α) × Historical Avg. Consumption) + 5% Buffer Threshold', { x: 1.1, y: 2.1, w: 11.0, h: 0.8, fontSize: 14, fontFace: 'Courier New', color: COLOR_TEXT_LIGHT });

s8.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 3.4, w: 11.6, h: 3.1, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s8.addText('Daily Entry & Waste Tagging Operations:', { x: 1.1, y: 3.7, w: 11.0, h: 0.3, fontSize: 15, fontFace: 'Georgia', bold: true, color: COLOR_TEXT_DARK });
s8.addText('• Log Prepared vs. Consumed: Captures exact food prepared, consumed, and wasted in kg.\n• Root-Cause Classification: Selects cause (Exam Period, Holiday, Unpopular Menu, Weather, Over-preparation).\n• Menu Slot Manager: Full CRUD functionality for updating weekly hostel mess menus and prices.', { x: 1.1, y: 4.2, w: 11.0, h: 2.1, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 22 });

// ==========================================
// SLIDE 9: MODULE 3 - WASTE ANALYTICS & IMPACT
// ==========================================
const s9 = pptx.addSlide();
addSlideHeader(s9, '08. Core Module 3', 'Waste Analytics, Cost & Carbon Emission Dashboards');
addFooter(s9, 9);

const s9Stats = [
  { label: 'Total Waste (30d)', val: '305.9 kg', color: COLOR_CLAY },
  { label: 'Fulfilment Rate', val: '93%', color: COLOR_BG_DARK },
  { label: 'Estimated Cost Lost', val: '₹18,354', color: COLOR_TURMERIC },
  { label: 'Carbon Offset (CO2e)', val: '764.7 kg', color: COLOR_SAGE }
];

s9Stats.forEach((s, idx) => {
  const x = 0.8 + idx * 3.0;
  s9.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: 2.7, h: 1.4, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
  s9.addText(s.label, { x, y: 1.7, w: 2.7, h: 0.3, fontSize: 11, fontFace: 'Calibri', color: '666666', align: 'center' });
  s9.addText(s.val, { x, y: 2.0, w: 2.7, h: 0.6, fontSize: 20, fontFace: 'Georgia', bold: true, color: s.color, align: 'center' });
});

s9.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 3.2, w: 11.6, h: 3.3, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s9.addText('Impact Calculation Formulas:', { x: 1.1, y: 3.5, w: 11.0, h: 0.3, fontSize: 15, fontFace: 'Georgia', bold: true, color: COLOR_TEXT_DARK });
s9.addText('• Financial Impact Formula:  Cost Lost (₹) = Total Waste (kg) × ₹60/kg\n• Carbon Emission Formula:  CO2e Emissions (kg) = Total Waste (kg) × 2.5 kg CO2e/kg\n• Waste Cause Breakdown:     Aggregates waste totals by exam period, holiday, & menu popularity via Recharts.', { x: 1.1, y: 4.0, w: 11.0, h: 2.2, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 22 });

// ==========================================
// SLIDE 10: MODULE 4 - FEEDBACK & NLP
// ==========================================
const s10 = pptx.addSlide();
addSlideHeader(s10, '09. Core Module 4', 'Student Feedback & NLP Keyword Extraction');
addFooter(s10, 10);

s10.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s10.addText('3-Axis Student Rating', { x: 1.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
s10.addText('• Taste Rating (1 to 5 Stars)\n• Cleanliness Rating (1 to 5 Stars)\n• Service Speed Rating (1 to 5 Stars)\n• Detailed Comment Field for specific complaints or suggestions.', { x: 1.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 24 });

s10.addShape(pptx.shapes.RECTANGLE, { x: 6.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: COLOR_TURMERIC, width: 2 } });
s10.addText('Offline NLP Keyword Engine', { x: 7.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_TURMERIC });
s10.addText('• Stop-Word Filtering: Strips common words (the, and, was, to).\n• Word Frequency Counter: Computes recurring feedback words.\n• Real-Time Summary Badges: Highlights key issues (e.g. spicy ×12, undercooked ×5, tasty ×18).\n• Proactive Quality Prevention: Helps manager fix recipes before waste occurs.', { x: 7.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 22 });

// ==========================================
// SLIDE 11: SECURITY & DEPLOYMENT
// ==========================================
const s11 = pptx.addSlide();
addSlideHeader(s11, '10. Security & Setup', 'Security Architecture & Deployment Pipeline');
addFooter(s11, 11);

s11.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s11.addText('Security & Authentication', { x: 1.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_CLAY });
s11.addText('• JWT Token Authentication: 7-day expiration stateless auth.\n• Bcrypt Hashing: Password encryption with 10 salt rounds.\n• Route Middleware: Role authorization (protect & authorize).\n• Compound Unique Indexes: Prevents double-booking attacks.', { x: 1.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 24 });

s11.addShape(pptx.shapes.RECTANGLE, { x: 6.8, y: 1.5, w: 5.6, h: 5.0, fill: { color: COLOR_BG_CARD }, line: { color: 'E2DFD2', width: 1 } });
s11.addText('Cloud Deployment Pipeline', { x: 7.1, y: 1.8, w: 5.0, h: 0.4, fontSize: 16, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK });
s11.addText('• Database: MongoDB Atlas Cloud Cluster.\n• Frontend: Vercel / Netlify (Production React Bundle).\n• Backend: Render / Railway (Node.js REST API service).\n• Environment: Dotenv environment secret management.', { x: 7.1, y: 2.4, w: 5.0, h: 3.8, fontSize: 13, fontFace: 'Calibri', color: COLOR_TEXT_DARK, leading: 24 });

// ==========================================
// SLIDE 12: EXPERIMENTAL RESULTS
// ==========================================
const s12 = pptx.addSlide();
addSlideHeader(s12, '11. Results & Verification', 'System Performance & Verification Metrics');
addFooter(s12, 12);

const s12Res = [
  { val: '~93%', text: 'Meal Fulfilment Rate achieved over 30 days of operation data.' },
  { val: '15-20%', text: 'Reduction in food waste from predictive demand cooking.' },
  { val: '<50ms', text: 'Database query response time for dynamic MongoDB analytics.' }
];

s12Res.forEach((r, idx) => {
  const x = 0.8 + idx * 4.0;
  s12.addShape(pptx.shapes.RECTANGLE, { x, y: 1.6, w: 3.6, h: 4.8, fill: { color: COLOR_BG_CARD }, line: { color: COLOR_BG_DARK, width: 1 } });
  s12.addText(r.val, { x, y: 2.0, w: 3.6, h: 1.0, fontSize: 36, fontFace: 'Georgia', bold: true, color: COLOR_BG_DARK, align: 'center' });
  s12.addText(r.text, { x: x + 0.3, y: 3.2, w: 3.0, h: 2.8, fontSize: 14, fontFace: 'Calibri', color: COLOR_TEXT_DARK, align: 'center', leading: 20 });
});

// ==========================================
// SLIDE 13: FUTURE SCOPE & CONCLUSION
// ==========================================
const s13 = pptx.addSlide();
s13.background = { color: COLOR_BG_DARK };

s13.addText('12. CONCLUSION & FUTURE SCOPE', {
  x: 1.0, y: 1.0, w: 11.3, h: 0.3, fontSize: 10, fontFace: 'Courier New', bold: true, color: COLOR_TURMERIC
});

s13.addText('Future Scope & Concluding Remarks', {
  x: 1.0, y: 1.4, w: 11.3, h: 0.6, fontSize: 24, fontFace: 'Georgia', bold: true, color: COLOR_TEXT_LIGHT
});

s13.addText('Future System Extensions:\n• IoT Smart Scale Integration: Automatic food waste logging via digital weighing scales.\n• FastAPI Scikit-Learn Microservice: Advanced ML regression models (Random Forest / Linear Regression).\n• Mobile QR Gate Scanner App: Mobile app for security guards to scan and validate visitor passes.', {
  x: 1.0, y: 2.3, w: 11.3, h: 2.0, fontSize: 14, fontFace: 'Calibri', color: COLOR_TEXT_LIGHT, leading: 22
});

s13.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 4.6, w: 11.33, h: 0.02, fill: { color: COLOR_TURMERIC } });

s13.addText('Thank You!\nQuestions & Discussion', {
  x: 1.0, y: 5.0, w: 11.3, h: 1.2, fontSize: 26, fontFace: 'Georgia', bold: true, color: COLOR_TURMERIC, align: 'center'
});

// Save Presentation
const outputPath = 'd:/New folder/Hostel Waste Management/Hostel_Waste_Management_Presentation.pptx';
pptx.writeFile({ fileName: outputPath }).then((filename) => {
  console.log(`PPT generated successfully at: ${filename}`);
  process.exit(0);
}).catch((err) => {
  console.error('Error generating PPT:', err);
  process.exit(1);
});
