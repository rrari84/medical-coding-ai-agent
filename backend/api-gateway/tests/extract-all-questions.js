// tests/extract-all-questions.js
// Extract all 100 questions from the practice test PDF

const fs = require('fs');
const path = require('path');

function createFullQuestionBank() {
  // All 100 questions with correct answers from your practice test
  const questions = [
    {
      id: 1,
      text: "During a regular checkup, Dr. Stevens discovered a suspicious lesion on the floor of Paul's mouth and decided to perform an excision. Which CPT code covers the excision of an oral lesion?",
      options: { A: "40800", B: "41105", C: "41113", D: "40804" },
      correct: "C",
      category: "CPT",
      explanation: "41113 pertains to excision of lesion of floor of mouth."
    },
    {
      id: 2,
      text: "While shaving, Robert accidentally caused a small cut on his chin that later became infected. He visited a healthcare provider who incised and drained the infected area. Which CPT code covers the incision and drainage of an infected cut?",
      options: { A: "10080", B: "10021", C: "10060", D: "10160" },
      correct: "C",
      category: "CPT",
      explanation: "10060 is the CPT code for incision and drainage of abscess."
    },
    {
      id: 3,
      text: "Lucas, a professional swimmer, developed a cyst in his arm due to repetitive motion. The doctor decided to excise the cyst. Which CPT code represents the excision of a cyst?",
      options: { A: "20005", B: "20055", C: "20010", D: "20020" },
      correct: "D",
      category: "CPT",
      explanation: "20020 is the CPT code for incision and removal of foreign body, subcutaneous tissues; simple."
    },
    {
      id: 4,
      text: "Ella's doctor suspected she might have diabetes. He ordered a Hemoglobin A1c test to assess her average blood sugar levels over the past three months. Which CPT code represents the Hemoglobin A1c test?",
      options: { A: "83036", B: "83033", C: "83035", D: "83034" },
      correct: "A",
      category: "CPT",
      explanation: "Code 83036 is for the Hemoglobin A1c test."
    },
    {
      id: 5,
      text: "Riley had an overactive thyroid and was recommended for a thyroid lobectomy. Which CPT code pertains to this procedure?",
      options: { A: "60210", B: "60212", C: "60220", D: "60225" },
      correct: "C",
      category: "CPT",
      explanation: "60220 refers to a thyroid lobectomy."
    },
    {
    id: 6,
    question: "After a series of tests, Dr. Wright determined that Katie had a kidney stone and recommended a percutaneous nephrostolithotomy. Which CPT code corresponds to this procedure?",
    options: ["50010", "50020", "50200", "50543"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "50543 refers to a percutaneous nephrostolithotomy or pyelostolithotomy."
  },
  {
    id: 7,
    question: "Ethan, experiencing persistent flank pain, underwent a diagnostic renal angiography. Which CPT code represents this procedure?",
    options: ["50010", "50220", "50200", "50398"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "50010 refers to renal exploratory surgery."
  },
  {
    id: 8,
    question: "The Relative Value Unit (RVU) associated with a CPT code reflects:",
    options: ["The complexity of the procedure", "The average time a procedure takes", "The cost associated with performing the procedure", "All of the above"],
    correctAnswer: "D",
    category: 'CPT',
    explanation: "RVU reflects complexity, time, and cost associated with performing a procedure."
  },
  {
    id: 9,
    question: "What does the term 'bradycardia' refer to?",
    options: ["Fast heartbeat", "Slow heartbeat", "Irregular heartbeat", "Strong heartbeat"],
    correctAnswer: "B",
    category: "Terminology",
    explanation: "Bradycardia refers to a slower than normal heart rate."
  },
  {
    id: 10,
    question: "After weeks of sinus congestion, Olivia saw an ENT specialist. The doctor decided to perform a nasal endoscopy. Which CPT code describes this procedure?",
    options: ["30000", "30140", "31231", "31237"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "31231 is the CPT code for nasal endoscopy, diagnostic."
  },
  {
    id: 11,
    question: "During her yoga class, Claire felt a sharp pain in her thigh. The doctor diagnosed her with a seroma that needed drainage. Which CPT code should be used for the drainage of a seroma?",
    options: ["20005", "20055", "20010", "20016"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "20010 is the CPT code for incision and drainage of hematoma, seroma or fluid collection."
  },
  {
    id: 12,
    question: "Jackson has been feeling pain and pressure in his sinuses. The ENT decided to perform a sinusotomy to improve drainage. Which CPT code represents this procedure?",
    options: ["31020", "31256", "31287", "31288"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "31256 is the CPT code for nasal/sinus endoscopy, surgical with maxillary antrostomy."
  },
    {
      id: 13,
      text: "During a routine check-up, Mark was diagnosed with essential (primary) hypertension. Which ICD-10-CM code represents this condition?",
      options: { A: "I10", B: "I11.9", C: "I12.9", D: "I13.10" },
      correct: "A",
      category: "ICD10",
      explanation: "I10 is the ICD-10-CM code for essential (primary) hypertension."
    },
      {
    id: 14,
    question: "After tests indicated abnormal parathyroid function, Natalie underwent a parathyroidectomy. Which CPT code represents this procedure?",
    options: ["60212", "60240", "60100", "60500"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "60500 refers to a parathyroidectomy."
  },
    {
      id: 15,
      text: "David uses a manual wheelchair due to his mobility limitations. Which HCPCS Level II code pertains to a standard manual wheelchair?",
      options: { A: "K0001", B: "K0002", C: "K0003", D: "K0004" },
      correct: "A",
      category: "HCPCS",
      explanation: "The HCPCS Level II code K0001 represents a standard manual wheelchair."
    },
    {
    id: 16,
    question: "After a fall, Clara's primary care doctor ordered an X-ray of her wrist. The radiologist took three views of her wrist. Which CPT code pertains to this X-ray?",
    options: ["73110", "73100", "73120", "73115"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "73110 pertains to radiologic examination of the wrist with a minimum of three views."
  },
  {
    id: 17,
    question: "While eating popcorn, Mike felt a sharp pain and found he had bitten the inside of his cheek, causing a mucocele. His dentist performed a removal of the mucocele. Which CPT code pertains to this procedure?",
    options: ["40804", "40812", "41108", "40819"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "40804 pertains to excision of lesion, vestibule of mouth (mucocele)."
  },
  {
    id: 18,
    question: "During a routine check-up, Brian was diagnosed with benign essential hypertension. What ICD-10-CM code should be used for this diagnosis?",
    options: ["I10", "I15.0", "I15.1", "I15.2"],
    correctAnswer: "A",
    category: "ICD10",
    explanation: "I10 is the ICD-10-CM code for essential (primary) hypertension."
  },
  {
    id: 19,
    question: "Megan had been facing difficulty urinating. Her urologist performed a cystourethroscopy to diagnose the issue. Which CPT code describes this procedure?",
    options: ["52000", "50250", "50200", "50395"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "52000 pertains to cystourethroscopy."
  },
  {
    id: 20,
    question: "Ryan has had chronic sinusitis for months. The doctor advised functional endoscopic sinus surgery (FESS) to clear the blockages. Which CPT code should be used for this procedure?",
    options: ["31255", "31256", "31267", "31276"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "31256 is the CPT code for nasal/sinus endoscopy, surgical with maxillary antrostomy."
  },
  {
    id: 21,
    question: "Which part of the brain is responsible for regulating vital functions like heartbeat and breathing?",
    options: ["Cerebellum", "Medulla Oblongata", "Cerebrum", "Pons"],
    correctAnswer: "B",
    category: "Anatomy",
    explanation: "The medulla oblongata regulates vital functions such as heartbeat, breathing, and blood pressure."
  },
    {
      id: 22,
      text: "After a trip to a tropical country, Jessica was diagnosed with Dengue fever without warning signs. Which ICD-10-CM code represents this diagnosis?",
      options: { A: "A90", B: "A91", C: "A92.0", D: "A92.8" },
      correct: "A",
      category: "ICD10",
      explanation: "A90 is the ICD-10-CM code for Dengue fever [classical dengue]."
    },
    {
    id: 23,
    question: "After a car accident, Liam required a retrograde pyelography to assess kidney damage. Which CPT code should be used for this procedure?",
    options: ["50320", "50430", "50200", "50390"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "50430 refers to injection procedure for retrograde pyelography."
  },
  {
    id: 24,
    question: "Olivia went to the pediatrician for her annual checkup. The doctor conducted a comprehensive review covering her past, family, and social history. Which CPT code represents this level of history-taking?",
    options: ["99391", "99382", "99392", "99381"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "99381 is for a comprehensive preventive medicine evaluation and management for new patients."
  },
  {
    id: 25,
    question: "During his physical therapy, John was provided with a therapeutic elastic band. Which HCPCS Level II code represents the supply of this band?",
    options: ["A4450", "A4465", "A4466", "A4470"],
    correctAnswer: "B",
    category: "HCPCS",
    explanation: "A4465 is the correct code for a therapeutic elastic band."
  },
  {
    id: 26,
    question: "Dr. Lewis suspected a liver issue with Lily and ordered a comprehensive metabolic panel. Which CPT code is for a comprehensive metabolic panel?",
    options: ["80053", "80051", "80050", "80055"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "80053 is for a comprehensive metabolic panel."
  },
  {
    id: 27,
    question: "The heart is enclosed in a double-layered sac called the:",
    options: ["Pericardium", "Myocardium", "Endocardium", "Epicardium"],
    correctAnswer: "A",
    category: "Anatomy",
    explanation: "The heart is enclosed by the pericardium, a double-layered sac."
  },
  {
    id: 28,
    question: "'Osteoporosis' describes a condition where:",
    options: ["Bones become soft and bendable", "Bone density is increased", "Bones are broken easily", "Bones become brittle and fragile due to loss of tissue"],
    correctAnswer: "D",
    category: "Terminology",
    explanation: "Osteoporosis is characterized by bones becoming brittle and fragile due to loss of tissue."
  },
  {
    id: 29,
    question: "Leo had been experiencing difficulty breathing and went to a clinic. The doctor performed a procedure to remove nasal polyps. Which CPT code corresponds to this procedure?",
    options: ["30110", "30140", "30220", "31237"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "30110 is the CPT code for excision or surgical planing of nasal polyp(s), simple."
  },
  {
    id: 30,
    question: "For his severe back pain, Dr. Simmons administers an epidural injection to Mike. Which HCPCS Level II code corresponds to the supply of the injection?",
    options: ["J1020", "J1030", "J1040", "J1050"],
    correctAnswer: "C",
    category: "HCPCS",
    explanation: "J1040 is the HCPCS Level II code for injection of methylprednisolone acetate, 80 mg."
  },
  {
    id: 31,
    question: "Experiencing persistent headaches, Daniel was sent for an MRI of his brain. Which CPT code covers an MRI of the brain without contrast?",
    options: ["70551", "70553", "70549", "70550"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "70551 is for an MRI of the brain without contrast."
  },
  {
    id: 32,
    question: "Dr. Johnson saw Sarah in the ER after she experienced a severe asthma attack. After stabilization, he conducted a comprehensive review of her systems and medical history. Which CPT code represents this level of history-taking?",
    options: ["99221", "99218", "99223", "99220"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "99223 is for a comprehensive level of history-taking and examination for patients in hospitals."
  },
  {
    id: 33,
    question: "Ella went to the doctor after experiencing pain from a swollen salivary gland. The doctor performed a sialolithotomy. Which CPT code represents this procedure?",
    options: ["40810", "40812", "40819", "40820"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "40820 pertains to sialolithotomy; by incision into duct."
  },
  {
    id: 34,
    question: "During a follow-up visit, Dr. Allen asked Emily about the progress of her symptoms, her current medications, and performed a limited examination. Which CPT code represents this level of service?",
    options: ["99212", "99214", "99213", "99215"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "99213 is used for an expanded problem-focused history and examination for established patients."
  },
  {
    id: 35,
    question: "In medical terminology, the prefix 'osteo-' relates to which of the following?",
    options: ["Bone", "Heart", "Liver", "Brain"],
    correctAnswer: "A",
    category: "Terminology",
    explanation: "The prefix 'osteo-' in medical terminology refers to bone."
  },
  {
    id: 36,
    question: "Lucas went to the hospital after noticing blood in his urine. The doctor performed a renal biopsy. Which CPT code represents this procedure?",
    options: ["50200", "50220", "50225", "50230"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "50200 refers to a renal biopsy."
  },
  {
    id: 37,
    question: "Ryan had been experiencing chronic chest pain. During a diagnostic procedure, the anesthesiologist administered anesthesia to keep him comfortable. Which CPT code represents anesthesia for intrathoracic procedures?",
    options: ["00520", "00522", "00524", "00526"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "00524 is specific to anesthesia for intrathoracic procedures."
  },
  {
    id: 38,
    question: "While hiking, Alex slipped on a rock and hurt his ankle. At the hospital, they discovered a hematoma that needed to be incised and drained. Which CPT code represents this procedure?",
    options: ["20005", "20055", "20000", "20025"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "20005 is the CPT code for incision and drainage of soft tissue abscess, leg or ankle; superficial."
  },
  {
    id: 39,
    question: "Bianca visited an oral surgeon due to a cyst under her tongue. The surgeon decided to perform a marsupialization of the ranula. Which CPT code is appropriate for this procedure?",
    options: ["40800", "41115", "40801", "40806"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "41115 pertains to marsupialization of ranula."
  },
  {
    id: 40,
    question: "Sarah uses a continuous positive airway pressure (CPAP) device for her sleep apnea. Which HCPCS Level II code pertains to the CPAP device?",
    options: ["E0601", "E0621", "E0631", "E0650"],
    correctAnswer: "A",
    category: "HCPCS",
    explanation: "E0601 is the HCPCS Level II code for a continuous positive airway pressure (CPAP) device."
  },
  {
    id: 41,
    question: "During a hernia repair, Dr. Stevens administered anesthesia to ensure Michael was comfortable and pain-free. Which CPT code represents anesthesia for an inguinal hernia repair?",
    options: ["00102", "00144", "00145", "00148"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "00144 represents anesthesia for an inguinal hernia repair."
  },
  {
    id: 42,
    question: "Sophie, pregnant with her first child, went for an ultrasound in her second trimester. Which CPT code is appropriate for a routine obstetric ultrasound of a fetus?",
    options: ["76805", "76810", "76815", "76816"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "76805 is used for a routine obstetric ultrasound of a fetus."
  },
  {
    id: 43,
    question: "Sophie, after a minor car accident, had a nosebleed that wouldn't stop. The ER doctor performed a nasal endoscopy to control the posterior nosebleed. Which CPT code is appropriate for this procedure?",
    options: ["30000", "31255", "31231", "30903"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "30903 is the CPT code for control nasal hemorrhage, posterior, complex."
  },
  {
    id: 44,
    question: "Ryan had been experiencing chronic chest pain. His cardiologist ordered a chest CT scan with contrast. Which CPT code represents a CT of the chest with contrast?",
    options: ["71250", "71260", "71270", "71275"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "71260 is for a CT of the chest with contrast."
  },
  {
    id: 45,
    question: "Nina, who had been dealing with depression, visited a psychiatrist who prescribed her a 30-minute psychotherapy session. Which CPT code is appropriate for individual psychotherapy for 30 minutes?",
    options: ["90832", "90834", "90837", "90839"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "90832 is used to describe individual psychotherapy for 30 minutes."
  },
    {
      id: 46,
      text: "Tom was diagnosed with bilateral primary osteoarthritis of the knee. Which ICD-10-CM code is suitable for this diagnosis?",
      options: { A: "M17.0", B: "M17.1", C: "M17.2", D: "M17.3" },
      correct: "B",
      category: "ICD10",
      explanation: "M17.1 is the ICD-10-CM code for bilateral primary osteoarthritis of the knee."
    },
    {
    id: 47,
    question: "Samantha was diagnosed with acute sinusitis due to Streptococcus pneumoniae. What ICD-10-CM code corresponds to her condition?",
    options: ["J01.00", "J01.10", "J01.01", "J01.11"],
    correctAnswer: "D",
    category: "ICD10",
    explanation: "J01.11 is the ICD-10-CM code for acute frontal sinusitis due to Streptococcus pneumoniae."
  },
  {
    id: 48,
    question: "Dr. Parker recommended a colonoscopy for Maria due to her family history of colorectal cancer. Which CPT code represents a diagnostic colonoscopy?",
    options: ["45378", "45379", "45380", "45381"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "45378 is the correct CPT code for a diagnostic colonoscopy."
  },
  {
    id: 49,
    question: "Lena, a 28-year-old, was diagnosed with a mild form of endometriosis. Which ICD-10-CM code corresponds to her diagnosis?",
    options: ["N80.0", "N80.1", "N80.2", "N80.3"],
    correctAnswer: "A",
    category: "ICD10",
    explanation: "N80.0 is the code for mild endometriosis."
  },
  {
    id: 50,
    question: "Leo visited a cardiologist due to chest pain. The doctor took an extended history, reviewed multiple systems, and performed a detailed examination. Which CPT code represents this level of service?",
    options: ["99221", "99222", "99223", "99220"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "99223 is for a comprehensive level of history-taking and examination for patients in hospitals."
  },
  {
    id: 51,
    question: "Robert visited an ophthalmologist after experiencing blurry vision. After examination, the doctor diagnosed him with cataracts. Which CPT code corresponds to a cataract removal with intraocular lens insertion?",
    options: ["66982", "66984", "66983", "66985"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "66984 represents extracapsular cataract removal with insertion of intraocular lens prosthesis."
  },
    {
      id: 52,
      text: "The largest bone in the human body is the:",
      options: { A: "Humerus", B: "Femur", C: "Tibia", D: "Fibula" },
      correct: "B",
      category: "Anatomy",
      explanation: "The femur, or thigh bone, is the longest and strongest bone in the human body."
    },
    {
    id: 53,
    question: "Which organ is responsible for producing insulin?",
    options: ["Pancreas", "Liver", "Kidney", "Spleen"],
    correctAnswer: "A",
    category: "Anatomy",
    explanation: "The pancreas is responsible for producing insulin."
  },
  {
    id: 54,
    question: "With symptoms of anemia, Riley's doctor ordered a complete blood count with differential. Which CPT code pertains to this test?",
    options: ["85027", "85025", "85029", "85023"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "85025 is for a complete blood count (CBC) with differential."
  },
  {
    id: 55,
    question: "Sophie, pregnant with her first child, went for an ultrasound in her second trimester. The anesthesiologist administered anesthesia to keep her comfortable during the procedure. Which CPT code represents anesthesia for a routine obstetric ultrasound?",
    options: ["00860", "00864", "00862", "00868"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "00860 is used for anesthesia during lower abdominal procedures, including obstetric ultrasonography."
  },
  {
    id: 56,
    question: "Which U.S. federal regulation protects the privacy and security of patients' medical information?",
    options: ["Affordable Care Act (ACA)", "Clinical Laboratory Improvement Amendments (CLIA)", "Health Information Technology for Economic and Clinical Health (HITECH) Act", "Health Insurance Portability and Accountability Act (HIPAA)"],
    correctAnswer: "D",
    category: "Privacy",
    explanation: "HIPAA is the federal law that provides data privacy and security provisions for safeguarding medical information."
  },
  {
    id: 57,
    question: "After her morning run, Maria noticed a painful abscess on her thigh. She immediately went to the clinic, where the doctor performed an incision and drainage. Which CPT code represents the incision and drainage of an abscess?",
    options: ["10080", "10021", "10060", "10160"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "10080 is the CPT code for incision and drainage of pilonidal cyst; simple."
  },
  {
    id: 58,
    question: "James had difficulty breathing and underwent a pulmonary function test to assess his lung function. Which CPT code represents a simple pulmonary function test?",
    options: ["94010", "94060", "94070", "94015"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "94010 represents a spirometry, including graphic record, total and timed vital capacity."
  },
  {
    id: 59,
    question: "After a minor car accident, Emma was taken to the emergency room. They found a hematoma in her shoulder that needed incision and drainage. Which CPT code pertains to this procedure?",
    options: ["20005", "20010", "20016", "20100"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "20100 is the CPT code for incision and drainage; deep abscess or hematoma, soft tissues of back or flank."
  },
  {
    id: 60,
    question: "For outpatient coding, when coding for a condition that is both acute and chronic and separate subentries exist in the alphabetic index, which code should be sequenced first?",
    options: ["Acute", "Chronic", "Either - based on the severity", "The condition that is being treated during the visit"],
    correctAnswer: "A",
    category: "ICD10",
    explanation: "The acute form is coded first when separate subentries exist for both acute and chronic forms."
  },
    {
      id: 61,
      text: "Alex was diagnosed with type 1 diabetes mellitus without complications. Which ICD-10-CM code represents this diagnosis?",
      options: { A: "E10.9", B: "E11.9", C: "E13.9", D: "E08.9" },
      correct: "A",
      category: "ICD10",
      explanation: "E10.9 is the ICD-10-CM code for type 1 diabetes mellitus without complications."
    },
    {
    id: 62,
    question: "John, an avid gardener, discovered a wart on his finger. Concerned about its appearance, he consulted a physician who recommended its removal. Which CPT code covers the excision of a wart?",
    options: ["10021", "10040", "10060", "10120"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "10040 is the CPT code for acne surgery (removal of multiple milia, comedones, cysts, pustules)."
  },
  {
    id: 63,
    question: "According to CPT guidelines, if a code exists that describes a certain service or procedure, you should:",
    options: ["Use a similar code that might fit", "Use the exact code describing the service", "Use an unspecified code", "Use any code as long as it's from the correct section"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "If there's a code that exactly describes the service or procedure performed, that specific code should be used."
  },
  {
    id: 64,
    question: "Dr. Lewis found a nodule in Chloe's thyroid and decided to perform a core needle biopsy. Which CPT code covers this procedure?",
    options: ["60100", "60240", "60271", "60101"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "60101 represents a core needle biopsy of the thyroid."
  },
  {
    id: 65,
    question: "Grace required a knee replacement. The anesthesiologist administered anesthesia specific to the lower leg procedure. Which CPT code is suitable for anesthesia during a knee replacement?",
    options: ["01402", "01400", "01404", "01406"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "01400 is appropriate for anesthesia during knee joint procedures."
  },
  {
    id: 66,
    question: "During a routine checkup, a physician noticed a suspicious lesion on Peter's back. To ensure it was benign, the doctor performed a punch biopsy. Which CPT code is appropriate for a punch biopsy of the skin?",
    options: ["10040", "10005", "11104", "11100"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "11104 is the CPT code for punch biopsy of skin when the diameter of the lesion is 0.5 cm or less."
  },
  {
    id: 67,
    question: "Elena visited the ER with a severe migraine without aura, not intractable. What ICD-10-CM code corresponds to her condition?",
    options: ["G43.009", "G43.109", "G43.209", "G43.309"],
    correctAnswer: "A",
    category: "ICD10",
    explanation: "G43.009 is the code for a migraine without aura, not intractable, without status migrainosus."
  },
  {
    id: 68,
    question: "Michael had always had a large mole on his arm. However, recently he observed changes in its appearance. On the advice of his friend, he visited a dermatologist who biopsied the mole. Which CPT code pertains to the biopsy of a lesion?",
    options: ["10040", "10005", "10060", "11100"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "11100 is the CPT code for biopsy of skin, subcutaneous tissue and/or mucous membrane; single lesion."
  },
  {
    id: 69,
    question: "What is the purpose of the National Correct Coding Initiative (NCCI)?",
    options: ["Ensure appropriate coding based on the medical record", "Prevent improper payment of procedures that should not be billed together", "Assign specific dollar amounts to procedures", "Monitor fraudulent billing practices across states"],
    correctAnswer: "B",
    category: "NCCI",
    explanation: "NCCI was established to prevent improper payment of procedures that should not be billed together."
  },
  {
    id: 70,
    question: "Peter visited a dermatologist for a persistent rash. The doctor diagnosed him with atopic dermatitis of the hands. What ICD-10-CM code represents this diagnosis?",
    options: ["L20.81", "L20.82", "L20.83", "L20.84"],
    correctAnswer: "B",
    category: "ICD10",
    explanation: "L20.82 is the ICD-10-CM code for atopic dermatitis of the hands."
  },
  {
    id: 71,
    question: "Sophia went to a dermatologist for a facial consultation. The doctor noticed a milia near her eye and removed it. Which CPT code represents the removal of milia?",
    options: ["10021", "10030", "10040", "10120"],
    correctAnswer: "C",
    category: "CPT",
    explanation: "10040 is the CPT code for acne surgery (removal of multiple milia, comedones, cysts, pustules)."
  },
  {
    id: 72,
    question: "Owen was diagnosed with thyroid cancer. His oncologist recommended a total thyroidectomy. Which CPT code should be used for this procedure?",
    options: ["60212", "60240", "60100", "60252"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "60240 pertains to a total thyroidectomy."
  },
  {
    id: 73,
    question: "According to the ICD-10-CM guidelines, when a patient has both an acute and chronic condition, which one should be sequenced first?",
    options: ["Acute condition", "Chronic condition", "Either - based on the severity", "The condition that is being treated during the visit"],
    correctAnswer: "A",
    category: "ICD10",
    explanation: "Per ICD-10-CM coding guidelines, the code for the acute condition is sequenced first."
  },
  {
    id: 74,
    question: "The term 'hepatomegaly' refers to:",
    options: ["Inflammation of the liver", "Enlargement of the liver", "Disease of the liver", "Absence of the liver"],
    correctAnswer: "B",
    category: "Terminology",
    explanation: "Hepatomegaly refers to an enlargement of the liver."
  },
  {
    id: 75,
    question: "Jake came to the clinic for a routine checkup. The doctor asked him basic questions about his current health without going into a detailed history or review of systems. What CPT code represents this level of history-taking?",
    options: ["99201", "99212", "99203", "99204"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "99201 is used for a problem-focused history and examination for new patients."
  },
  {
    id: 76,
    question: "During her beach vacation, Lisa noticed a skin tag on her neck. Wanting to wear her new necklace without any obstructions, she decided to visit a dermatologist to have it removed. Which CPT code represents the removal of a skin tag?",
    options: ["10021", "10030", "10060", "11200"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "11200 is the CPT code for removal of skin tags, multiple fibrocutaneous tags, any area; up to and including 15 lesions."
  },
  {
    id: 77,
    question: "Ava was having persistent nosebleeds. The ENT decided to cauterize the bleeding vessel in her nasal cavity. Which CPT code describes this procedure?",
    options: ["30000", "30901", "31231", "31237"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "30901 is the CPT code for control nasal hemorrhage, anterior, simple."
  },
  {
    id: 78,
    question: "During a dental cleaning, Dr. Adams noticed a white patch inside Hannah's mouth. She suggested a biopsy of the oral mucosa. Which CPT code covers a biopsy of the oral mucosa?",
    options: ["40000", "41105", "40100", "40804"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "41105 pertains to biopsy of oral mucosa and/or lesion; vestibule of mouth."
  },
  {
    id: 79,
    question: "After experiencing rapid heartbeats, Karen underwent an electrophysiology study. Which CPT code pertains to this procedure?",
    options: ["93619", "93620", "93621", "93622"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "93620 represents a comprehensive electrophysiologic evaluation."
  },
  {
    id: 80,
    question: "While gardening, Chloe got a thorn embedded in her hand. She went to a healthcare provider who removed the foreign body. Which CPT code covers the removal of a foreign body from soft tissue?",
    options: ["20005", "20055", "20010", "10120"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "10120 is the CPT code for incision and removal of foreign body, subcutaneous tissues; simple."
  },
  {
    id: 81,
    question: "During a football match, Ethan had a collision and developed a hematoma in his upper arm. The doctor performed an incision to drain it. Which CPT code is appropriate for this procedure?",
    options: ["20005", "20002", "20010", "20100"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "20005 is the CPT code for incision and drainage of soft tissue abscess, leg or ankle; superficial."
  },
    {
      id: 82,
      text: "The term 'hyperglycemia' means:",
      options: { A: "Low blood sugar level", B: "Normal blood sugar level", C: "High blood sugar level", D: "Blood without sugar" },
      correct: "C",
      category: "Terminology",
      explanation: "Hyperglycemia refers to a high blood sugar level."
    },
    {
    id: 83,
    question: "Julie was diagnosed with iron-deficiency anemia secondary to chronic blood loss. Which ICD-10-CM code is appropriate for this diagnosis?",
    options: ["D50.0", "D50.1", "D50.8", "D50.9"],
    correctAnswer: "A",
    category: "ICD10",
    explanation: "D50.0 is the ICD-10-CM code for iron-deficiency anemia secondary to blood loss (chronic)."
  },
  {
    id: 84,
    question: "Nathan visited the clinic with flu-like symptoms. The doctor took a brief history, focusing mainly on the respiratory system. Which CPT code represents this level of history-taking?",
    options: ["99201", "99202", "99203", "99204"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "99202 is used for an expanded problem-focused history and examination for new patients."
  },
  {
    id: 85,
    question: "Dr. Harris diagnosed Grace with hyperthyroidism and recommended a partial thyroidectomy. Which CPT code describes this procedure?",
    options: ["60210", "60212", "60100", "60225"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "60210 refers to a partial thyroidectomy."
  },
  {
    id: 86,
    question: "According to Medicare, the 'Three-Day Payment Window Rule' refers to:",
    options: ["The time frame in which a patient must pay their bill", "Services provided to a patient 3 days prior to their inpatient admission", "The time frame in which Medicare must process a claim", "The period within which a patient can dispute a charge"],
    correctAnswer: "B",
    category: "Insurance",
    explanation: "The '72-hour rule' refers to outpatient services provided within 3 days leading up to inpatient hospital admission."
  },
  {
    id: 87,
    question: "In ICD-10-CM, how should unspecified codes be utilized?",
    options: ["Frequently; as they are easy to use", "Only when the documentation doesn't provide more specific information", "When the coder is unsure about the specifics of the condition", "In any situation where a quick code is needed"],
    correctAnswer: "B",
    category: "ICD10",
    explanation: "Unspecified codes should be used when the medical documentation does not provide enough information for a more specific code."
  },
  {
    id: 88,
    question: "Sophia had recurrent UTIs. To determine the cause, her physician performed a cystography. Which CPT code pertains to this procedure?",
    options: ["50395", "50250", "50200", "51600"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "51600 pertains to cystography."
  },
  {
    id: 89,
    question: "In CPT coding, what does a modifier -25 indicate?",
    options: ["Repeat procedure by the same physician", "Bilateral procedure", "Multiple procedures", "Significant and separately identifiable evaluation and management service by the same physician on the same day of the procedure"],
    correctAnswer: "D",
    category:"CPT",
    explanation: "The -25 modifier indicates a significant, separately identifiable E/M service above and beyond the other service provided."
  },
  {
    id: 90,
    question: "What does the term 'cardiomyopathy' refer to?",
    options: ["Inflammation of the heart muscle", "Enlargement of the heart", "Disease of the heart muscle", "Blockage in the heart's arteries"],
    correctAnswer: "C",
    category: "Terminology",
    explanation: "Cardiomyopathy refers to a disease of the heart muscle."
  },
  {
    id: 91,
    question: "James noticed a lump in his armpit and visited a physician who diagnosed it as an abscess. The doctor performed an incision and drainage. Which CPT code corresponds to this procedure?",
    options: ["20002", "20060", "20000", "20005"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "20002 is the CPT code for incision and drainage of abscess of skin, subcutaneous or accessory structures; arm or leg."
  },
    {
      id: 92,
      text: "George received an infusion of Remicade for his Crohn's disease. What HCPCS Level II code corresponds to the Remicade infusion?",
      options: { A: "J1745", B: "J1750", C: "J1756", D: "J1760" },
      correct: "A",
      category: "HCPCS",
      explanation: "The HCPCS Level II code for an infusion of Remicade (infliximab) is J1745."
    },
     {
    id: 93,
    question: "When it comes to Medicare fraud and abuse, what does 'upcoding' refer to?",
    options: ["Billing for services not rendered", "Billing a higher service code than what was performed", "Billing for unnecessary services", "Assigning a lower code to save the patient money"],
    correctAnswer: "B",
    category: "Insurance",
    explanation: "'Upcoding' refers to billing a higher service code than what was actually performed to receive higher reimbursement."
  },
  {
    id: 94,
    question: "Max complained of fatigue and frequent infections. His doctor ordered an immunoglobulin test to check his immune system's health. Which CPT code corresponds to the immunoglobulin test?",
    options: ["82784", "82782", "82785", "82783"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "82784 is for the immunoglobulin test."
  },
  {
    id: 95,
    question: "When a patient is admitted to the hospital for a high fever and is later diagnosed with sepsis, what should be the primary diagnosis according to ICD-10-CM guidelines?",
    options: ["Fever", "Sepsis", "Both can be primary", "The condition that prompted the admission"],
    correctAnswer: "B",
    category: "ICD10",
    explanation: "According to ICD-10-CM guidelines, if sepsis is present upon admission, it should be coded as the primary diagnosis."
  },
  {
    id: 96,
    question: "Jason went to the clinic after noticing a sore that wouldn't heal inside his mouth. The doctor performed an excision of the oral lesion. Which CPT code represents this procedure?",
    options: ["41108", "41110", "40100", "40819"],
    correctAnswer: "B",
    category: "CPT",
    explanation: "41110 pertains to excision of lesion of oral mucosa without closure."
  },
  {
    id: 97,
    question: "Nancy was fitted with a below-the-knee artificial limb after her leg amputation. Which HCPCS Level II code represents this prosthetic?",
    options: ["L5631", "L5637", "L5645", "L5650"],
    correctAnswer: "B",
    category: "HCPCS",
    explanation: "L5637 is the correct code for a below-the-knee artificial limb."
  },
  {
    id: 98,
    question: "Tyler had a lump on his thyroid. The endocrinologist performed a fine needle aspiration biopsy. Which CPT code pertains to this procedure?",
    options: ["60100", "60240", "60220", "60212"],
    correctAnswer: "A",
    category: "CPT",
    explanation: "60100 refers to a fine needle aspiration biopsy of the thyroid."
  },
  {
    id: 99,
    question: "Lily felt a sudden blockage in her nose. The doctor diagnosed a deviated septum and recommended a septoplasty. Which CPT code pertains to this procedure?",
    options: ["31231", "31000", "31254", "30520"],
    correctAnswer: "D",
    category: "CPT",
    explanation: "30520 is the CPT code for septoplasty or submucous resection."
  },
    {
      id: 100,
      text: "Anna received an injection of Botox for her chronic migraines. Which HCPCS Level II code represents the Botox injection?",
      options: { A: "J0585", B: "J0586", C: "J0587", D: "J0588" },
      correct: "A",
      category: "HCPCS",
      explanation: "The correct HCPCS Level II code for a Botox injection is J0585."
    }
  ];

  return questions;
}

function saveQuestionsToFile() {
  const questions = createFullQuestionBank();
  
  // Save to JSON file
  const filename = 'practice-questions-full.json';
  fs.writeFileSync(filename, JSON.stringify(questions, null, 2));
  
  console.log(`✅ Saved ${questions.length} questions to ${filename}`);
  
  // Show breakdown by category
  const categories = {};
  questions.forEach(q => {
    const cat = q.category || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  
  console.log('\n📊 Question breakdown:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} questions`);
  });
  
  return questions;
}

function createFullTestRunner() {
  const questions = saveQuestionsToFile();
  
  // Create a test runner script
  const testRunnerScript = `
// Full practice test runner
const axios = require('axios');
const fs = require('fs');

async function runFullPracticeTest() {
  console.log('🏥 Medical Coding CPC Practice Test');
  console.log('🎯 Target: 98% accuracy (${Math.ceil(questions.length * 0.98)}/${questions.length} questions)');
  console.log('=' * 50);
  
  // Load questions
  const questions = JSON.parse(fs.readFileSync('practice-questions-full.json', 'utf8'));
  
  try {
    console.log('🚀 Starting full practice test...');
    const response = await axios.post('http://localhost:3000/api/ai-agent/practice-test', {
      questions: questions,
      testName: 'CPC_Practice_Test_Full'
    });
    
    const results = response.data;
    
    console.log('\\n🎊 FINAL RESULTS:');
    console.log('=' * 30);
    console.log(\`Score: \${results.score} (\${results.accuracy.toFixed(1)}%)\`);
    console.log(\`Target: 98% (\${Math.ceil(questions.length * 0.98)} correct)\`);
    console.log(\`Status: \${results.passed ? '🎉 PASSED!' : '📈 Keep optimizing'}\`);
    
    if (results.passed) {
      console.log('\\n🏆 CONGRATULATIONS! You achieved 98%+ accuracy!');
      console.log('Your AI agent is ready for the real CPC exam!');
    } else {
      const needed = Math.ceil(questions.length * 0.98) - parseInt(results.score.split('/')[0]);
      console.log(\`\\n💡 Need \${needed} more correct answers to reach 98%\`);
      
      // Analyze mistakes
      const mistakes = results.results.filter(r => !r.isCorrect);
      console.log(\`\\n❌ Mistakes (\${mistakes.length}):\`);
      mistakes.slice(0, 5).forEach((mistake, i) => {
        console.log(\`\${i + 1}. Q\${mistake.questionId}: Got \${mistake.aiAnswer}, should be \${mistake.correctAnswer}\`);
      });
      
      if (mistakes.length > 5) {
        console.log(\`   ... and \${mistakes.length - 5} more\`);
      }
    }
    
    // Save detailed results
    fs.writeFileSync('test-results-full.json', JSON.stringify(results, null, 2));
    console.log('\\n💾 Detailed results saved to test-results-full.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

runFullPracticeTest().catch(console.error);
`;

  fs.writeFileSync('run-full-test.js', testRunnerScript);
  console.log('✅ Created run-full-test.js script');
  
  return questions;
}

if (require.main === module) {
  createFullTestRunner();
}

module.exports = { createFullQuestionBank, saveQuestionsToFile };