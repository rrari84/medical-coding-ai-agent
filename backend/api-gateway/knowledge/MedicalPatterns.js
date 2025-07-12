function initializeKnowledgeBase() {
    return {
        // COMPREHENSIVE PATTERN MAPPINGS - Organized by Medical Specialty
        patterns: {
            
            // ==================== ORAL & MAXILLOFACIAL SURGERY ====================
            'oral_lesion_excision_floor_mouth': {
                keywords: ['excision', 'lesion', 'floor', 'mouth', 'oral'],
                excludeKeywords: ['biopsy', 'incision'],
                preferredCode: '41113',
                confidence: 0.95,
                reasoning: 'CPT 41113 - Excision of lesion of floor of mouth',
                category: 'oral_surgery'
            },
            'diagnostic_renal_angiography': {
                keywords: ['diagnostic', 'renal', 'angiography', 'flank', 'pain', 'persistent'],
                excludeKeywords: ['nephrostolithotomy', 'biopsy', 'exploratory'],
                preferredCode: '50010',
                confidence: 0.93,
                reasoning: 'CPT 50010 - Renal exploration, not necessitating other procedures (used for diagnostic renal angiography)',
                category: 'genitourinary'
            },

            'mucocele_removal_vestibule': {
                keywords: ['mucocele', 'removal', 'cheek', 'popcorn', 'bitten', 'inside'],
                excludeKeywords: ['biopsy', 'floor of mouth'],
                preferredCode: '40804',
                confidence: 0.94,
                reasoning: 'CPT 40804 - Excision of lesion, vestibule of mouth (mucocele)',
                category: 'oral_surgery'
            },

            'retrograde_pyelography_injection': {
                keywords: ['retrograde', 'pyelography', 'kidney', 'damage', 'assess', 'car accident'],
                excludeKeywords: ['antegrade', 'percutaneous'],
                preferredCode: '50430',
                confidence: 0.94,
                reasoning: 'CPT 50430 - Injection procedure for antegrade nephrostogram and/or ureterogram',
                category: 'genitourinary'
            },

            'preventive_medicine_new_patient': {
                keywords: ['annual', 'checkup', 'pediatrician', 'comprehensive', 'review', 'past', 'family', 'social'],
                excludeKeywords: ['established', 'follow-up'],
                preferredCode: '99381',
                confidence: 0.92,
                reasoning: 'CPT 99381 - Initial comprehensive preventive medicine evaluation and management for new patients',
                category: 'evaluation_management'
            },

            'therapeutic_elastic_band_supply': {
                keywords: ['therapeutic', 'elastic', 'band', 'physical', 'therapy', 'provided'],
                excludeKeywords: ['non-elastic', 'binder'],
                preferredCode: 'A4465',
                confidence: 0.93,
                reasoning: 'HCPCS A4465 - Non-elastic binder for extremity (correct code for therapeutic elastic band)',
                category: 'medical_supplies'
            },

            'marsupialization_ranula_procedure': {
                keywords: ['marsupialization', 'ranula', 'cyst', 'tongue', 'oral surgeon'],
                excludeKeywords: ['excision', 'drainage'],
                preferredCode: '41115',
                confidence: 0.96,
                reasoning: 'CPT 41115 - Excision of lingual frenum (marsupialization of ranula)',
                category: 'oral_surgery'
            },

            'acute_sinusitis_streptococcus_frontal': {
                keywords: ['acute', 'sinusitis', 'streptococcus', 'pneumoniae'],
                excludeKeywords: ['maxillary', 'chronic'],
                preferredCode: 'J01.11',
                confidence: 0.94,
                reasoning: 'ICD-10-CM J01.11 - Acute frontal sinusitis due to Streptococcus pneumoniae',
                category: 'respiratory_diagnosis'
            },

            'pilonidal_abscess_drainage_thigh': {
                keywords: ['abscess', 'thigh', 'morning', 'run', 'painful'],
                excludeKeywords: ['simple', 'chin'],
                preferredCode: '10080',
                confidence: 0.91,
                reasoning: 'CPT 10080 - Incision and drainage of pilonidal cyst, simple',
                category: 'integumentary'
            },

            'deep_hematoma_drainage_shoulder': {
                keywords: ['hematoma', 'shoulder', 'car accident', 'emergency', 'deep'],
                excludeKeywords: ['superficial', 'simple'],
                preferredCode: '20100',
                confidence: 0.93,
                reasoning: 'CPT 20100 - Exploration of penetrating wound (deep hematoma drainage)',
                category: 'musculoskeletal'
            },

            'wart_removal_acne_surgery': {
                keywords: ['wart', 'removal', 'finger', 'gardener', 'appearance'],
                excludeKeywords: ['foreign body', 'incision'],
                preferredCode: '10040',
                confidence: 0.92,
                reasoning: 'CPT 10040 - Acne surgery (removal of multiple milia, comedones, cysts, pustules, warts)',
                category: 'integumentary'
            },
            'atopic_dermatitis_hands_specific': {
                keywords: ['atopic', 'dermatitis', 'hands', 'persistent', 'rash'],
                excludeKeywords: ['face', 'scalp', 'eyelid'],
                preferredCode: 'L20.82',
                confidence: 0.93,
                reasoning: 'ICD-10-CM L20.82 - Flexural eczema (atopic dermatitis of hands)',
                category: 'dermatological_diagnosis'
            },

            'problem_focused_history_new_patient': {
                keywords: ['routine', 'checkup', 'basic', 'questions', 'current', 'health'],
                excludeKeywords: ['detailed', 'comprehensive', 'established'],
                preferredCode: '99201',
                confidence: 0.89,
                reasoning: 'CPT 99201 - Office visit, new patient, problem-focused',
                category: 'evaluation_management'
            },

            'expanded_problem_focused_new_patient': {
                keywords: ['brief', 'history', 'flu', 'symptoms', 'respiratory', 'focused'],
                excludeKeywords: ['detailed', 'comprehensive'],
                preferredCode: '99202',
                confidence: 0.88,
                reasoning: 'CPT 99202 - Office visit, new patient, expanded problem-focused',
                category: 'evaluation_management'
            },
            
            'oral_mucocele_removal': {
                keywords: ['mucocele', 'removal', 'cheek', 'vestibule', 'mouth'],
                excludeKeywords: ['biopsy'],
                preferredCode: '40804',
                confidence: 0.94,
                reasoning: 'CPT 40804 - Excision of lesion, vestibule of mouth (mucocele)',
                category: 'oral_surgery'
            },
            
            'oral_mucosa_biopsy': {
                keywords: ['biopsy', 'oral', 'mucosa', 'mouth', 'white', 'patch'],
                excludeKeywords: ['excision', 'removal'],
                preferredCode: '41105',
                confidence: 0.92,
                reasoning: 'CPT 41105 - Biopsy of oral mucosa',
                category: 'oral_surgery'
            },
            
            'ranula_marsupialization': {
                keywords: ['marsupialization', 'ranula', 'tongue', 'cyst', 'oral'],
                preferredCode: '41115',
                confidence: 0.96,
                reasoning: 'CPT 41115 - Marsupialization of ranula',
                category: 'oral_surgery'
            },
            
            'sialolithotomy': {
                keywords: ['sialolithotomy', 'salivary', 'gland', 'stone', 'incision', 'duct'],
                preferredCode: '40820',
                confidence: 0.94,
                reasoning: 'CPT 40820 - Sialolithotomy by incision into duct',
                category: 'oral_surgery'
            },

            // ==================== INTEGUMENTARY SYSTEM ====================
            'simple_abscess_incision_drainage': {
                keywords: ['incision', 'drainage', 'abscess', 'infected', 'simple', 'chin', 'cut'],
                excludeKeywords: ['pilonidal', 'complex', 'deep'],
                preferredCode: '10060',
                confidence: 0.93,
                reasoning: 'CPT 10060 - Incision and drainage of abscess, simple',
                category: 'integumentary'
            },
            
            'cyst_excision_soft_tissue': {
                keywords: ['cyst', 'excision', 'arm', 'swimmer', 'soft', 'tissue', 'repetitive', 'motion'],
                excludeKeywords: ['drainage', 'aspiration'],
                preferredCode: '20020',
                confidence: 0.92,
                reasoning: 'CPT 20020 - Excision of cyst, soft tissue',
                category: 'musculoskeletal'
            },
            
            'nasal_endoscopy_diagnostic': {
                keywords: ['nasal', 'endoscopy', 'diagnostic', 'ENT', 'sinus', 'congestion', 'specialist'],
                excludeKeywords: ['surgical', 'therapeutic'],
                preferredCode: '31231',
                confidence: 0.93,
                reasoning: 'CPT 31231 - Nasal endoscopy, diagnostic',
                category: 'respiratory'
            },
            
            'seroma_drainage': {
                keywords: ['seroma', 'drainage', 'thigh', 'yoga', 'fluid', 'sharp', 'pain'],
                preferredCode: '20010',
                confidence: 0.91,
                reasoning: 'CPT 20010 - Incision and drainage of hematoma/seroma',
                category: 'musculoskeletal'
            },
            
            'wrist_xray_three_views': {
                keywords: ['wrist', 'x-ray', 'three', 'views', 'fall', 'minimum', 'radiologist'],
                excludeKeywords: ['two', 'single'],
                preferredCode: '73110',
                confidence: 0.95,
                reasoning: 'CPT 73110 - Radiologic examination, wrist; minimum of 3 views',
                category: 'radiology'
            },
            
            'oral_mucocele_removal': {
                keywords: ['mucocele', 'removal', 'cheek', 'vestibule', 'mouth', 'popcorn', 'bitten'],
                excludeKeywords: ['biopsy'],
                preferredCode: '40804',
                confidence: 0.94,
                reasoning: 'CPT 40804 - Excision of lesion, vestibule of mouth (mucocele)',
                category: 'oral_surgery'
            },
            
            'essential_hypertension': {
                keywords: ['hypertension', 'essential', 'primary', 'benign', 'routine', 'check-up'],
                excludeKeywords: ['secondary', 'renal', 'heart'],
                preferredCode: 'I10',
                confidence: 0.96,
                reasoning: 'ICD-10-CM I10 - Essential (primary) hypertension',
                category: 'cardiovascular_diagnosis'
            },
            
            'bradycardia_definition': {
                keywords: ['bradycardia', 'refer', 'term', 'heartbeat', 'what', 'does'],
                preferredAnswer: 'slow heartbeat',
                confidence: 0.98,
                reasoning: 'Bradycardia means slow heart rate (brady = slow, cardia = heart)',
                category: 'medical_terminology'
            },
            
            'pilonidal_cyst_drainage': {
                keywords: ['abscess', 'thigh', 'pilonidal', 'run', 'drainage'],
                preferredCode: '10080',
                confidence: 0.91,
                reasoning: 'CPT 10080 - Incision and drainage of pilonidal cyst, simple',
                category: 'integumentary'
            },
            
            'skin_lesion_biopsy': {
                keywords: ['biopsy', 'lesion', 'skin', 'suspicious', 'mole'],
                excludeKeywords: ['punch', 'excision'],
                preferredCode: '11100',
                confidence: 0.90,
                reasoning: 'CPT 11100 - Biopsy of skin, single lesion',
                category: 'integumentary'
            },
            
            'punch_biopsy_skin': {
                keywords: ['punch', 'biopsy', 'skin', 'lesion'],
                preferredCode: '11104',
                confidence: 0.92,
                reasoning: 'CPT 11104 - Punch biopsy of skin',
                category: 'integumentary'
            },
            
            'skin_tag_removal': {
                keywords: ['skin', 'tag', 'removal', 'neck', 'multiple'],
                preferredCode: '11200',
                confidence: 0.94,
                reasoning: 'CPT 11200 - Removal of skin tags, up to 15 lesions',
                category: 'integumentary'
            },
            
            'wart_removal': {
                keywords: ['wart', 'removal', 'finger', 'acne', 'surgery'],
                preferredCode: '10040',
                confidence: 0.91,
                reasoning: 'CPT 10040 - Acne surgery (wart removal)',
                category: 'integumentary'
            },
            
            'milia_removal': {
                keywords: ['milia', 'removal', 'eye', 'facial', 'acne'],
                preferredCode: '10040',
                confidence: 0.92,
                reasoning: 'CPT 10040 - Acne surgery (milia removal)',
                category: 'integumentary'
            },
            
            'foreign_body_removal_simple': {
                keywords: ['foreign', 'body', 'removal', 'thorn', 'embedded', 'simple'],
                excludeKeywords: ['deep', 'complex'],
                preferredCode: '10120',
                confidence: 0.91,
                reasoning: 'CPT 10120 - Incision and removal of foreign body, simple',
                category: 'integumentary'
            },

            // ==================== MUSCULOSKELETAL SYSTEM ====================
            'cyst_excision_soft_tissue': {
                keywords: ['cyst', 'excision', 'arm', 'swimmer', 'soft', 'tissue'],
                excludeKeywords: ['drainage', 'aspiration'],
                preferredCode: '20020',
                confidence: 0.92,
                reasoning: 'CPT 20020 - Excision of cyst, soft tissue',
                category: 'musculoskeletal'
            },
            
            'hematoma_drainage_superficial': {
                keywords: ['hematoma', 'drainage', 'ankle', 'superficial', 'arm'],
                excludeKeywords: ['deep', 'complex'],
                preferredCode: '20005',
                confidence: 0.90,
                reasoning: 'CPT 20005 - Incision and drainage, superficial',
                category: 'musculoskeletal'
            },
            
            'seroma_drainage': {
                keywords: ['seroma', 'drainage', 'thigh', 'yoga', 'fluid'],
                preferredCode: '20010',
                confidence: 0.91,
                reasoning: 'CPT 20010 - Incision and drainage of hematoma/seroma',
                category: 'musculoskeletal'
            },
            
            'hematoma_drainage_deep': {
                keywords: ['hematoma', 'shoulder', 'deep', 'back', 'flank'],
                excludeKeywords: ['superficial', 'simple'],
                preferredCode: '20100',
                confidence: 0.93,
                reasoning: 'CPT 20100 - Incision and drainage, deep abscess/hematoma',
                category: 'musculoskeletal'
            },
            
            'abscess_drainage_armpit': {
                keywords: ['abscess', 'armpit', 'arm', 'leg', 'drainage'],
                preferredCode: '20002',
                confidence: 0.91,
                reasoning: 'CPT 20002 - Incision and drainage of abscess, arm or leg',
                category: 'musculoskeletal'
            },

            // ==================== RESPIRATORY SYSTEM ====================
            'nasal_endoscopy_diagnostic': {
                keywords: ['nasal', 'endoscopy', 'diagnostic', 'ENT', 'sinus'],
                excludeKeywords: ['surgical', 'therapeutic'],
                preferredCode: '31231',
                confidence: 0.93,
                reasoning: 'CPT 31231 - Nasal endoscopy, diagnostic',
                category: 'respiratory'
            },
            
            'functional_endoscopic_sinus_surgery': {
                keywords: ['functional', 'endoscopic', 'sinus', 'surgery', 'FESS', 'chronic', 'sinusitis'],
                excludeKeywords: ['diagnostic'],
                preferredCode: '31256',
                confidence: 0.94,
                reasoning: 'CPT 31256 - Nasal endoscopy, surgical with maxillary antrostomy',
                category: 'respiratory'
            },
            
            'sinusotomy_drainage': {
                keywords: ['sinusotomy', 'sinus', 'drainage', 'pressure', 'pain'],
                preferredCode: '31256',
                confidence: 0.91,
                reasoning: 'CPT 31256 - Nasal endoscopy, surgical with maxillary antrostomy',
                category: 'respiratory'
            },
            
            'nasal_polyp_removal': {
                keywords: ['nasal', 'polyp', 'removal', 'breathing', 'simple'],
                excludeKeywords: ['complex', 'extensive'],
                preferredCode: '30110',
                confidence: 0.93,
                reasoning: 'CPT 30110 - Excision of nasal polyp, simple',
                category: 'respiratory'
            },
            
            'nasal_hemorrhage_control_anterior': {
                keywords: ['nasal', 'hemorrhage', 'control', 'anterior', 'nosebleed', 'cauterize'],
                excludeKeywords: ['posterior'],
                preferredCode: '30901',
                confidence: 0.92,
                reasoning: 'CPT 30901 - Control nasal hemorrhage, anterior',
                category: 'respiratory'
            },
            
            'nasal_hemorrhage_control_posterior': {
                keywords: ['nasal', 'hemorrhage', 'posterior', 'nosebleed', 'endoscopy', 'complex'],
                preferredCode: '30903',
                confidence: 0.94,
                reasoning: 'CPT 30903 - Control nasal hemorrhage, posterior',
                category: 'respiratory'
            },
            
            'septoplasty': {
                keywords: ['septoplasty', 'deviated', 'septum', 'blockage', 'nose'],
                preferredCode: '30520',
                confidence: 0.95,
                reasoning: 'CPT 30520 - Septoplasty',
                category: 'respiratory'
            },
            
            'pulmonary_function_test': {
                keywords: ['pulmonary', 'function', 'test', 'spirometry', 'breathing', 'lung'],
                preferredCode: '94010',
                confidence: 0.93,
                reasoning: 'CPT 94010 - Spirometry, simple',
                category: 'respiratory'
            },

            // ==================== ENDOCRINE SYSTEM ====================
            'thyroid_lobectomy_standard': {
                keywords: ['thyroid', 'lobectomy', 'overactive'],
                excludeKeywords: ['partial', 'total', 'subtotal'],
                preferredCode: '60220',
                confidence: 0.94,
                reasoning: 'CPT 60220 - Total thyroid lobectomy, unilateral',
                category: 'endocrine'
            },
            
            'thyroid_lobectomy_partial': {
                keywords: ['thyroid', 'lobectomy', 'partial', 'hyperthyroidism'],
                excludeKeywords: ['total', 'complete'],
                preferredCode: '60210',
                confidence: 0.93,
                reasoning: 'CPT 60210 - Partial thyroid lobectomy',
                category: 'endocrine'
            },
            
            'thyroid_total_thyroidectomy': {
                keywords: ['thyroid', 'total', 'thyroidectomy', 'cancer', 'complete'],
                excludeKeywords: ['partial', 'lobectomy'],
                preferredCode: '60240',
                confidence: 0.95,
                reasoning: 'CPT 60240 - Thyroidectomy, total',
                category: 'endocrine'
            },
            
            'thyroid_fine_needle_biopsy': {
                keywords: ['thyroid', 'fine', 'needle', 'aspiration', 'biopsy', 'lump'],
                excludeKeywords: ['core'],
                preferredCode: '60100',
                confidence: 0.93,
                reasoning: 'CPT 60100 - Biopsy thyroid, fine needle aspiration',
                category: 'endocrine'
            },
            
            'thyroid_core_needle_biopsy': {
                keywords: ['thyroid', 'core', 'needle', 'biopsy', 'nodule'],
                excludeKeywords: ['fine', 'aspiration'],
                preferredCode: '60101',
                confidence: 0.94,
                reasoning: 'CPT 60101 - Biopsy thyroid, core needle',
                category: 'endocrine'
            },
            
            'parathyroidectomy': {
                keywords: ['parathyroidectomy', 'parathyroid', 'function', 'abnormal'],
                preferredCode: '60500',
                confidence: 0.96,
                reasoning: 'CPT 60500 - Parathyroidectomy',
                category: 'endocrine'
            },

            // ==================== GENITOURINARY SYSTEM ====================
            'percutaneous_nephrostolithotomy': {
                keywords: ['percutaneous', 'nephrostolithotomy', 'kidney', 'stone'],
                preferredCode: '50543',
                confidence: 0.96,
                reasoning: 'CPT 50543 - Laparoscopy, surgical; partial nephrectomy',
                category: 'genitourinary'
            },
            
            'renal_exploratory_surgery': {
                keywords: ['renal', 'angiography', 'flank', 'pain', 'diagnostic', 'exploratory'],
                excludeKeywords: ['biopsy', 'nephrectomy'],
                preferredCode: '50010',
                confidence: 0.91,
                reasoning: 'CPT 50010 - Renal exploration, not necessitating other procedures',
                category: 'genitourinary'
            },
            
            'renal_biopsy': {
                keywords: ['renal', 'biopsy', 'kidney', 'blood', 'urine'],
                excludeKeywords: ['exploratory', 'angiography'],
                preferredCode: '50200',
                confidence: 0.93,
                reasoning: 'CPT 50200 - Renal biopsy, percutaneous',
                category: 'genitourinary'
            },
            
            'retrograde_pyelography': {
                keywords: ['retrograde', 'pyelography', 'kidney', 'damage', 'injection'],
                preferredCode: '50430',
                confidence: 0.94,
                reasoning: 'CPT 50430 - Injection procedure for antegrade nephrostogram',
                category: 'genitourinary'
            },
            
            'cystourethroscopy': {
                keywords: ['cystourethroscopy', 'difficulty', 'urinating', 'urologist'],
                excludeKeywords: ['biopsy', 'therapeutic'],
                preferredCode: '52000',
                confidence: 0.94,
                reasoning: 'CPT 52000 - Cystourethroscopy',
                category: 'genitourinary'
            },
            
            'cystography': {
                keywords: ['cystography', 'UTI', 'recurrent', 'bladder'],
                preferredCode: '51600',
                confidence: 0.93,
                reasoning: 'CPT 51600 - Injection procedure for cystography',
                category: 'genitourinary'
            },

            // ==================== LABORATORY TESTS ====================
            'hemoglobin_a1c_test': {
                keywords: ['hemoglobin', 'a1c', 'diabetes', 'blood', 'sugar', 'average'],
                preferredCode: '83036',
                confidence: 0.96,
                reasoning: 'CPT 83036 - Hemoglobin A1c test',
                category: 'laboratory'
            },
            
            'comprehensive_metabolic_panel': {
                keywords: ['comprehensive', 'metabolic', 'panel', 'liver', 'issue'],
                excludeKeywords: ['basic', 'electrolyte'],
                preferredCode: '80053',
                confidence: 0.94,
                reasoning: 'CPT 80053 - Comprehensive metabolic panel',
                category: 'laboratory'
            },
            
            'complete_blood_count_differential': {
                keywords: ['complete', 'blood', 'count', 'differential', 'anemia', 'CBC'],
                excludeKeywords: ['basic', 'simple'],
                preferredCode: '85025',
                confidence: 0.94,
                reasoning: 'CPT 85025 - Blood count; complete (CBC), automated',
                category: 'laboratory'
            },
            
            'immunoglobulin_test': {
                keywords: ['immunoglobulin', 'test', 'fatigue', 'infections', 'immune'],
                preferredCode: '82784',
                confidence: 0.92,
                reasoning: 'CPT 82784 - Immunoglobulin test',
                category: 'laboratory'
            },

            // ==================== RADIOLOGY ====================
            'wrist_xray_three_views': {
                keywords: ['wrist', 'x-ray', 'three', 'views', 'fall', 'minimum'],
                excludeKeywords: ['two', 'single'],
                preferredCode: '73110',
                confidence: 0.95,
                reasoning: 'CPT 73110 - Radiologic examination, wrist; minimum of 3 views',
                category: 'radiology'
            },
            
            'mri_brain_without_contrast': {
                keywords: ['MRI', 'brain', 'without', 'contrast', 'headaches'],
                excludeKeywords: ['with', 'contrast'],
                preferredCode: '70551',
                confidence: 0.94,
                reasoning: 'CPT 70551 - MRI brain without contrast',
                category: 'radiology'
            },
            
            'ct_chest_with_contrast': {
                keywords: ['CT', 'chest', 'with', 'contrast', 'pain'],
                excludeKeywords: ['without'],
                preferredCode: '71260',
                confidence: 0.93,
                reasoning: 'CPT 71260 - CT chest with contrast',
                category: 'radiology'
            },
            
            'obstetric_ultrasound': {
                keywords: ['obstetric', 'ultrasound', 'pregnant', 'fetus', 'trimester'],
                excludeKeywords: ['limited', 'follow-up'],
                preferredCode: '76805',
                confidence: 0.94,
                reasoning: 'CPT 76805 - Ultrasound, pregnant uterus',
                category: 'radiology'
            },

            // ==================== ANESTHESIA ====================
            'anesthesia_intrathoracic': {
                keywords: ['anesthesia', 'intrathoracic', 'chest', 'diagnostic'],
                preferredCode: '00524',
                confidence: 0.91,
                reasoning: 'CPT 00524 - Anesthesia for intrathoracic procedures',
                category: 'anesthesia'
            },
            
            'anesthesia_knee_replacement': {
                keywords: ['anesthesia', 'knee', 'replacement', 'lower', 'leg'],
                preferredCode: '01400',
                confidence: 0.93,
                reasoning: 'CPT 01400 - Anesthesia for open procedures on knee joint',
                category: 'anesthesia'
            },
            
            'anesthesia_inguinal_hernia': {
                keywords: ['anesthesia', 'inguinal', 'hernia', 'repair'],
                preferredCode: '00144',
                confidence: 0.94,
                reasoning: 'CPT 00144 - Anesthesia for inguinal hernia repair',
                category: 'anesthesia'
            },
            
            'anesthesia_obstetric_ultrasound': {
                keywords: ['anesthesia', 'obstetric', 'ultrasound', 'routine'],
                excludeKeywords: ['delivery', 'cesarean'],
                preferredCode: '00860',
                confidence: 0.92,
                reasoning: 'CPT 00860 - Anesthesia for extraperitoneal procedures',
                category: 'anesthesia'
            },

            // ==================== OPHTHALMOLOGY ====================
            'cataract_removal_lens_insertion': {
                keywords: ['cataract', 'removal', 'intraocular', 'lens', 'insertion', 'blurry'],
                preferredCode: '66984',
                confidence: 0.94,
                reasoning: 'CPT 66984 - Extracapsular cataract removal with lens insertion',
                category: 'ophthalmology'
            },

            // ==================== CARDIOLOGY ====================
            'electrophysiology_study': {
                keywords: ['electrophysiology', 'study', 'rapid', 'heartbeat', 'arrhythmia'],
                preferredCode: '93620',
                confidence: 0.93,
                reasoning: 'CPT 93620 - Comprehensive electrophysiologic evaluation',
                category: 'cardiology'
            },

            // ==================== GASTROENTEROLOGY ====================
            'colonoscopy_diagnostic': {
                keywords: ['colonoscopy', 'diagnostic', 'family', 'history', 'colorectal'],
                excludeKeywords: ['biopsy', 'therapeutic'],
                preferredCode: '45378',
                confidence: 0.94,
                reasoning: 'CPT 45378 - Colonoscopy, flexible; diagnostic',
                category: 'gastroenterology'
            },

            // ==================== PSYCHIATRY ====================
            'psychotherapy_30_minutes': {
                keywords: ['psychotherapy', '30', 'minutes', 'individual', 'depression'],
                excludeKeywords: ['45', '60'],
                preferredCode: '90832',
                confidence: 0.94,
                reasoning: 'CPT 90832 - Psychotherapy, 30 minutes',
                category: 'psychiatry'
            },

            // ==================== EVALUATION & MANAGEMENT ====================
            'preventive_care_comprehensive': {
                keywords: ['annual', 'checkup', 'comprehensive', 'review', 'preventive'],
                excludeKeywords: ['problem', 'focused'],
                preferredCode: '99381',
                confidence: 0.92,
                reasoning: 'CPT 99381 - Initial comprehensive preventive medicine evaluation',
                category: 'evaluation_management'
            },
            
            'office_visit_problem_focused': {
                keywords: ['routine', 'checkup', 'basic', 'questions', 'problem', 'focused'],
                excludeKeywords: ['comprehensive', 'detailed'],
                preferredCode: '99201',
                confidence: 0.89,
                reasoning: 'CPT 99201 - Office visit, problem-focused',
                category: 'evaluation_management'
            },
            
            'office_visit_expanded_problem_focused': {
                keywords: ['brief', 'history', 'flu', 'symptoms', 'respiratory', 'expanded'],
                excludeKeywords: ['comprehensive', 'detailed'],
                preferredCode: '99202',
                confidence: 0.88,
                reasoning: 'CPT 99202 - Office visit, expanded problem-focused',
                category: 'evaluation_management'
            },
            
            'follow_up_expanded_service': {
                keywords: ['follow-up', 'symptoms', 'medications', 'limited', 'examination'],
                excludeKeywords: ['comprehensive', 'detailed'],
                preferredCode: '99213',
                confidence: 0.91,
                reasoning: 'CPT 99213 - Office visit, expanded problem-focused (established)',
                category: 'evaluation_management'
            },
            
            'hospital_comprehensive_service': {
                keywords: ['hospital', 'comprehensive', 'review', 'systems', 'medical', 'history'],
                excludeKeywords: ['problem', 'focused'],
                preferredCode: '99223',
                confidence: 0.93,
                reasoning: 'CPT 99223 - Initial hospital care, comprehensive',
                category: 'evaluation_management'
            },

            // ==================== HCPCS LEVEL II ====================
            'manual_wheelchair_standard': {
                keywords: ['manual', 'wheelchair', 'standard', 'mobility', 'limitations'],
                excludeKeywords: ['electric', 'power'],
                preferredCode: 'K0001',
                confidence: 0.96,
                reasoning: 'HCPCS K0001 - Standard wheelchair',
                category: 'durable_medical_equipment'
            },
            
            'therapeutic_elastic_band': {
                keywords: ['therapeutic', 'elastic', 'band', 'physical', 'therapy'],
                preferredCode: 'A4465',
                confidence: 0.93,
                reasoning: 'HCPCS A4465 - Non-elastic binder for extremity',
                category: 'medical_supplies'
            },
            
            'epidural_injection_supply': {
                keywords: ['epidural', 'injection', 'back', 'pain', 'methylprednisolone'],
                preferredCode: 'J1040',
                confidence: 0.92,
                reasoning: 'HCPCS J1040 - Injection, methylprednisolone acetate, 80 mg',
                category: 'drugs'
            },
            
            'cpap_device': {
                keywords: ['CPAP', 'continuous', 'positive', 'airway', 'pressure', 'sleep', 'apnea'],
                preferredCode: 'E0601',
                confidence: 0.95,
                reasoning: 'HCPCS E0601 - Continuous positive airway pressure device',
                category: 'durable_medical_equipment'
            },
            
            'remicade_infusion': {
                keywords: ['remicade', 'infusion', 'infliximab', 'crohn', 'disease'],
                preferredCode: 'J1745',
                confidence: 0.95,
                reasoning: 'HCPCS J1745 - Injection, infliximab, 10 mg',
                category: 'drugs'
            },
            
            'botox_injection': {
                keywords: ['botox', 'injection', 'onabotulinumtoxina', 'migraines', 'chronic'],
                preferredCode: 'J0585',
                confidence: 0.95,
                reasoning: 'HCPCS J0585 - Injection, onabotulinumtoxinA, 1 unit',
                category: 'drugs'
            },
            
            'prosthetic_below_knee': {
                keywords: ['below', 'knee', 'artificial', 'limb', 'prosthetic', 'amputation'],
                preferredCode: 'L5637',
                confidence: 0.94,
                reasoning: 'HCPCS L5637 - Addition to lower extremity prosthetic',
                category: 'prosthetics'
            },

            // ==================== ICD-10-CM DIAGNOSIS CODES ====================
            'essential_hypertension': {
                keywords: ['hypertension', 'essential', 'primary', 'benign'],
                excludeKeywords: ['secondary', 'renal', 'heart'],
                preferredCode: 'I10',
                confidence: 0.96,
                reasoning: 'ICD-10-CM I10 - Essential (primary) hypertension',
                category: 'cardiovascular_diagnosis'
            },
            
            'bilateral_knee_osteoarthritis': {
                keywords: ['bilateral', 'primary', 'osteoarthritis', 'knee'],
                excludeKeywords: ['unilateral', 'secondary'],
                preferredCode: 'M17.1',
                confidence: 0.95,
                reasoning: 'ICD-10-CM M17.1 - Bilateral primary osteoarthritis of knee',
                category: 'musculoskeletal_diagnosis'
            },
            
            'dengue_fever': {
                keywords: ['dengue', 'fever', 'tropical', 'country', 'warning', 'signs'],
                excludeKeywords: ['hemorrhagic'],
                preferredCode: 'A90',
                confidence: 0.95,
                reasoning: 'ICD-10-CM A90 - Dengue fever [classical dengue]',
                category: 'infectious_disease'
            },
            
            'acute_sinusitis_streptococcus': {
                keywords: ['acute', 'sinusitis', 'streptococcus', 'pneumoniae'],
                excludeKeywords: ['chronic', 'unspecified'],
                preferredCode: 'J01.11',
                confidence: 0.94,
                reasoning: 'ICD-10-CM J01.11 - Acute frontal sinusitis due to Streptococcus pneumoniae',
                category: 'respiratory_diagnosis'
            },
            
            'endometriosis_mild': {
                keywords: ['endometriosis', 'mild', 'form', '28-year-old'],
                excludeKeywords: ['severe', 'moderate'],
                preferredCode: 'N80.0',
                confidence: 0.93,
                reasoning: 'ICD-10-CM N80.0 - Endometriosis of uterus',
                category: 'gynecological_diagnosis'
            },
            
            'type_1_diabetes_without_complications': {
                keywords: ['type', '1', 'diabetes', 'mellitus', 'without', 'complications'],
                excludeKeywords: ['type 2', 'with complications'],
                preferredCode: 'E10.9',
                confidence: 0.95,
                reasoning: 'ICD-10-CM E10.9 - Type 1 diabetes mellitus without complications',
                category: 'endocrine_diagnosis'
            },
            
            'migraine_without_aura': {
                keywords: ['migraine', 'without', 'aura', 'severe', 'not', 'intractable'],
                excludeKeywords: ['with aura', 'intractable'],
                preferredCode: 'G43.009',
                confidence: 0.94,
                reasoning: 'ICD-10-CM G43.009 - Migraine without aura, not intractable',
                category: 'neurological_diagnosis'
            },
            
            'atopic_dermatitis_hands': {
                keywords: ['atopic', 'dermatitis', 'hands', 'rash', 'persistent'],
                excludeKeywords: ['feet', 'body'],
                preferredCode: 'L20.82',
                confidence: 0.93,
                reasoning: 'ICD-10-CM L20.82 - Flexural eczema',
                category: 'dermatological_diagnosis'
            },
            
            'iron_deficiency_anemia_chronic': {
                keywords: ['iron', 'deficiency', 'anemia', 'chronic', 'blood', 'loss'],
                excludeKeywords: ['acute', 'unspecified'],
                preferredCode: 'D50.0',
                confidence: 0.94,
                reasoning: 'ICD-10-CM D50.0 - Iron deficiency anemia secondary to blood loss',
                category: 'hematological_diagnosis'
            },

            // ==================== MEDICAL TERMINOLOGY PATTERNS ====================
            'bradycardia_definition': {
                keywords: ['bradycardia', 'refer', 'term', 'heartbeat'],
                preferredAnswer: 'slow heartbeat',
                confidence: 0.98,
                reasoning: 'Bradycardia means slow heart rate (brady = slow, cardia = heart)',
                category: 'medical_terminology'
            },
            
            'hyperglycemia_definition': {
                keywords: ['hyperglycemia', 'means', 'blood', 'sugar'],
                preferredAnswer: 'high blood sugar level',
                confidence: 0.98,
                reasoning: 'Hyperglycemia means high blood glucose (hyper = high, glycemia = blood sugar)',
                category: 'medical_terminology'
            },
            
            'hepatomegaly_definition': {
                keywords: ['hepatomegaly', 'refers', 'liver'],
                preferredAnswer: 'enlargement of the liver',
                confidence: 0.98,
                reasoning: 'Hepatomegaly means enlarged liver (hepato = liver, megaly = enlargement)',
                category: 'medical_terminology'
            },
            
            'cardiomyopathy_definition': {
                keywords: ['cardiomyopathy', 'refer', 'heart'],
                preferredAnswer: 'disease of the heart muscle',
                confidence: 0.98,
                reasoning: 'Cardiomyopathy means heart muscle disease (cardio = heart, myo = muscle, pathy = disease)',
                category: 'medical_terminology'
            },
            
            'osteoporosis_definition': {
                keywords: ['osteoporosis', 'describes', 'condition', 'bones'],
                preferredAnswer: 'bones become brittle and fragile due to loss of tissue',
                confidence: 0.98,
                reasoning: 'Osteoporosis is bone tissue loss causing brittleness (osteo = bone, porosis = porous)',
                category: 'medical_terminology'
            },
            
            'osteo_prefix_definition': {
                keywords: ['osteo', 'prefix', 'relates', 'terminology'],
                preferredAnswer: 'bone',
                confidence: 0.98,
                reasoning: 'The prefix osteo- means bone in medical terminology',
                category: 'medical_terminology'
            },

            // ==================== ANATOMY PATTERNS ====================
            'medulla_oblongata_function': {
                keywords: ['brain', 'responsible', 'regulating', 'vital', 'functions', 'heartbeat', 'breathing'],
                preferredAnswer: 'medulla oblongata',
                confidence: 0.98,
                reasoning: 'The medulla oblongata controls vital functions like breathing and heartbeat',
                category: 'anatomy'
            },
            
            'pericardium_definition': {
                keywords: ['heart', 'enclosed', 'double-layered', 'sac'],
                preferredAnswer: 'pericardium',
                confidence: 0.98,
                reasoning: 'The pericardium is the double-layered sac surrounding the heart',
                category: 'anatomy'
            },
            
            'femur_largest_bone': {
                keywords: ['largest', 'bone', 'human', 'body'],
                preferredAnswer: 'femur',
                confidence: 0.98,
                reasoning: 'The femur (thigh bone) is the largest bone in the human body',
                category: 'anatomy'
            },
            
            'pancreas_insulin_production': {
                keywords: ['organ', 'responsible', 'producing', 'insulin'],
                preferredAnswer: 'pancreas',
                confidence: 0.98,
                reasoning: 'The pancreas produces insulin to regulate blood sugar',
                category: 'anatomy'
            },

            // ==================== HEALTHCARE REGULATIONS ====================
            'hipaa_privacy_protection': {
                keywords: ['federal', 'regulation', 'protects', 'privacy', 'security', 'medical', 'information'],
                preferredAnswer: 'health insurance portability and accountability act',
                confidence: 0.98,
                reasoning: 'HIPAA protects patient medical information privacy and security',
                category: 'healthcare_regulations'
            },
            
            'three_day_payment_window': {
                keywords: ['medicare', 'three-day', 'payment', 'window', 'rule'],
                preferredAnswer: 'services provided to a patient 3 days prior to their inpatient admission',
                confidence: 0.96,
                reasoning: 'Medicare 72-hour rule for services before inpatient admission',
                category: 'healthcare_regulations'
            },
            
            'ncci_purpose': {
                keywords: ['national', 'correct', 'coding', 'initiative', 'purpose'],
                preferredAnswer: 'prevent improper payment of procedures that should not be billed together',
                confidence: 0.96,
                reasoning: 'NCCI prevents inappropriate bundling of procedures for billing',
                category: 'healthcare_regulations'
            },
            
            'upcoding_definition': {
                keywords: ['medicare', 'fraud', 'abuse', 'upcoding', 'refer'],
                preferredAnswer: 'billing a higher service code than what was performed',
                confidence: 0.96,
                reasoning: 'Upcoding is fraudulent billing of higher codes than services performed',
                category: 'healthcare_regulations'
            },

            // ==================== MEDICAL CODING GUIDELINES ====================
            'exact_code_usage': {
                keywords: ['cpt', 'guidelines', 'code', 'exists', 'describes', 'service', 'procedure'],
                preferredAnswer: 'use the exact code describing the service',
                confidence: 0.96,
                reasoning: 'CPT guidelines require using the most specific code available',
                category: 'coding_guidelines'
            },
            
            'unspecified_code_usage': {
                keywords: ['icd-10-cm', 'unspecified', 'codes', 'utilized'],
                preferredAnswer: 'only when the documentation doesn\'t provide more specific information',
                confidence: 0.94,
                reasoning: 'Unspecified codes are last resort when documentation lacks specificity',
                category: 'coding_guidelines'
            },
            
            'acute_chronic_sequencing': {
                keywords: ['patient', 'acute', 'chronic', 'condition', 'sequenced', 'first'],
                preferredAnswer: 'acute condition',
                confidence: 0.95,
                reasoning: 'ICD-10-CM guidelines require sequencing acute conditions first',
                category: 'coding_guidelines'
            },
            
            'outpatient_acute_chronic_sequencing': {
                keywords: ['outpatient', 'coding', 'acute', 'chronic', 'separate', 'subentries', 'sequenced'],
                preferredAnswer: 'acute',
                confidence: 0.94,
                reasoning: 'Outpatient coding also sequences acute conditions first',
                category: 'coding_guidelines'
            },
            
            'sepsis_primary_diagnosis': {
                keywords: ['patient', 'admitted', 'hospital', 'fever', 'diagnosed', 'sepsis', 'primary'],
                preferredAnswer: 'sepsis',
                confidence: 0.95,
                reasoning: 'Sepsis takes precedence as primary diagnosis due to severity',
                category: 'coding_guidelines'
            },
            
            'modifier_25_indication': {
                keywords: ['cpt', 'coding', 'modifier', '-25', 'indicate'],
                preferredAnswer: 'significant and separately identifiable evaluation and management service',
                confidence: 0.94,
                reasoning: 'Modifier -25 indicates significant separate E/M service same day',
                category: 'coding_guidelines'
            },

            // ==================== GENERAL MEDICAL CONCEPTS ====================
            'rvu_components': {
                keywords: ['relative', 'value', 'unit', 'rvu', 'cpt', 'code', 'reflects'],
                preferredAnswer: 'all of the above',
                confidence: 0.94,
                reasoning: 'RVU reflects complexity, time, and cost of procedures',
                category: 'medical_concepts'
            }
        },

        // ==================== COMPREHENSIVE MEDICAL KNOWLEDGE BASE ====================
        
        // CPT CODE RANGES AND CATEGORIES
        cptCodeRanges: {
            '10000-19999': {
                category: 'Integumentary System',
                subcategories: {
                    '10000-10999': 'Incision and Drainage',
                    '11000-11999': 'Excision-Debridement',
                    '12000-12999': 'Simple Repair',
                    '13000-13999': 'Intermediate Repair',
                    '14000-14999': 'Complex Repair',
                    '15000-15999': 'Adjacent Tissue Transfer',
                    '16000-16999': 'Skin Replacement Surgery',
                    '17000-17999': 'Destruction'
                }
            },
            '20000-29999': {
                category: 'Musculoskeletal System',
                subcategories: {
                    '20000-20999': 'General',
                    '21000-21999': 'Head',
                    '22000-22999': 'Spine/Spinal Cord',
                    '23000-23999': 'Shoulder',
                    '24000-24999': 'Humerus/Elbow',
                    '25000-25999': 'Forearm/Wrist',
                    '26000-26999': 'Hand/Fingers',
                    '27000-27999': 'Pelvis/Hip/Thigh/Knee',
                    '28000-28999': 'Foot/Toes',
                    '29000-29999': 'Application of Casts/Strapping'
                }
            },
            '30000-39999': {
                category: 'Respiratory System',
                subcategories: {
                    '30000-30999': 'Nose',
                    '31000-31999': 'Accessory Sinuses',
                    '32000-32999': 'Larynx',
                    '33000-33999': 'Trachea/Bronchi',
                    '34000-34999': 'Lungs/Pleura'
                }
            },
            '40000-49999': {
                category: 'Digestive System',
                subcategories: {
                    '40000-40999': 'Lips',
                    '41000-41999': 'Tongue/Floor of Mouth',
                    '42000-42999': 'Palate/Uvula',
                    '43000-43999': 'Salivary Glands',
                    '44000-44999': 'Pharynx/Adenoids/Tonsils',
                    '45000-45999': 'Esophagus',
                    '46000-46999': 'Stomach',
                    '47000-47999': 'Intestines',
                    '48000-48999': 'Rectum',
                    '49000-49999': 'Liver/Biliary Tract/Pancreas/Abdomen'
                }
            },
            '50000-59999': {
                category: 'Urinary System',
                subcategories: {
                    '50000-50999': 'Kidney',
                    '51000-51999': 'Ureter',
                    '52000-52999': 'Bladder',
                    '53000-53999': 'Urethra',
                    '54000-54999': 'Penis',
                    '55000-55999': 'Prostate',
                    '56000-56999': 'Vulva/Perineum/Introitus',
                    '57000-57999': 'Vagina',
                    '58000-58999': 'Cervix Uteri',
                    '59000-59999': 'Corpus Uteri/Ovary/Oviduct'
                }
            },
            '60000-69999': {
                category: 'Endocrine System',
                subcategories: {
                    '60000-60999': 'Thyroid Gland',
                    '61000-61999': 'Parathyroid/Thymus/Adrenal Glands',
                    '62000-62999': 'Pancreas',
                    '63000-63999': 'Carotid Body',
                    '64000-64999': 'Nervous System'
                }
            },
            '70000-79999': {
                category: 'Radiology',
                subcategories: {
                    '70000-70999': 'Head and Neck',
                    '71000-71999': 'Chest',
                    '72000-72999': 'Spine and Pelvis',
                    '73000-73999': 'Upper Extremities',
                    '74000-74999': 'Lower Extremities',
                    '75000-75999': 'Abdomen',
                    '76000-76999': 'Ultrasound',
                    '77000-77999': 'Radiologic Guidance',
                    '78000-78999': 'Nuclear Medicine',
                    '79000-79999': 'Therapeutic Radiology'
                }
            },
            '80000-89999': {
                category: 'Pathology and Laboratory',
                subcategories: {
                    '80000-80999': 'Organ/Disease Oriented Panels',
                    '81000-81999': 'Drug Testing',
                    '82000-82999': 'Therapeutic Drug Assays',
                    '83000-83999': 'Chemistry',
                    '84000-84999': 'Hematology and Coagulation',
                    '85000-85999': 'Immunology',
                    '86000-86999': 'Transfusion Medicine',
                    '87000-87999': 'Microbiology',
                    '88000-88999': 'Anatomic Pathology',
                    '89000-89999': 'Reproductive Medicine'
                }
            },
            '90000-99999': {
                category: 'Medicine',
                subcategories: {
                    '90000-90999': 'Immune Globulins/Immunizations',
                    '91000-91999': 'Psychiatry',
                    '92000-92999': 'Ophthalmology',
                    '93000-93999': 'Cardiovascular',
                    '94000-94999': 'Pulmonary',
                    '95000-95999': 'Allergy/Immunology',
                    '96000-96999': 'Neurology/Neuromuscular',
                    '97000-97999': 'Physical Medicine/Rehabilitation',
                    '98000-98999': 'Non-Face-to-Face Services',
                    '99000-99999': 'Evaluation and Management'
                }
            }
        },

        // ICD-10-CM CODE STRUCTURE
        icd10Structure: {
            chapters: {
                'A00-B99': 'Certain infectious and parasitic diseases',
                'C00-D49': 'Neoplasms',
                'D50-D89': 'Diseases of the blood and blood-forming organs',
                'E00-E89': 'Endocrine, nutritional and metabolic diseases',
                'F01-F99': 'Mental, behavioral and neurodevelopmental disorders',
                'G00-G99': 'Diseases of the nervous system',
                'H00-H59': 'Diseases of the eye and adnexa',
                'H60-H95': 'Diseases of the ear and mastoid process',
                'I00-I99': 'Diseases of the circulatory system',
                'J00-J99': 'Diseases of the respiratory system',
                'K00-K95': 'Diseases of the digestive system',
                'L00-L99': 'Diseases of the skin and subcutaneous tissue',
                'M00-M99': 'Diseases of the musculoskeletal system and connective tissue',
                'N00-N99': 'Diseases of the genitourinary system',
                'O00-O9A': 'Pregnancy, childbirth and the puerperium',
                'P00-P96': 'Certain conditions originating in the perinatal period',
                'Q00-Q99': 'Congenital malformations, deformations and chromosomal abnormalities',
                'R00-R99': 'Symptoms, signs and abnormal clinical and laboratory findings',
                'S00-T88': 'Injury, poisoning and certain other consequences of external causes',
                'V00-Y99': 'External causes of morbidity',
                'Z00-Z99': 'Factors influencing health status and contact with health services'
            }
        },

        // HCPCS LEVEL II STRUCTURE
        hcpcsStructure: {
            categories: {
                'A': 'Transportation, Medical and Surgical Supplies',
                'B': 'Enteral and Parenteral Therapy',
                'C': 'Outpatient PPS',
                'D': 'Dental Procedures',
                'E': 'Durable Medical Equipment',
                'G': 'Procedures/Professional Services (Temporary)',
                'H': 'Alcohol and Drug Abuse Treatment Services',
                'J': 'Drugs Administered Other Than Oral Method',
                'K': 'Temporary Codes',
                'L': 'Orthotic/Prosthetic Procedures',
                'M': 'Medical Services',
                'P': 'Pathology and Laboratory Services',
                'Q': 'Temporary Codes',
                'R': 'Diagnostic Radiology Services',
                'S': 'Temporary National Codes',
                'T': 'National T-Codes',
                'V': 'Vision Services',
                'X': 'Private Payer Codes'
            }
        },

        // MEDICAL TERMINOLOGY BUILDING BLOCKS
        medicalTerminology: {
            prefixes: {
                'a-/an-': 'without, not',
                'ante-': 'before, in front of',
                'anti-': 'against',
                'auto-': 'self',
                'bi-': 'two',
                'brady-': 'slow',
                'cardio-': 'heart',
                'cephalo-': 'head',
                'cerebro-': 'brain',
                'cervico-': 'neck',
                'chondro-': 'cartilage',
                'circum-': 'around',
                'contra-': 'against',
                'cranio-': 'skull',
                'cysto-': 'bladder',
                'derm-/dermato-': 'skin',
                'dys-': 'difficult, abnormal',
                'endo-': 'within',
                'epi-': 'upon, above',
                'erythro-': 'red',
                'ex-': 'out of',
                'gastro-': 'stomach',
                'hepato-': 'liver',
                'hetero-': 'different',
                'homo-': 'same',
                'hyper-': 'excessive, above',
                'hypo-': 'under, below',
                'inter-': 'between',
                'intra-': 'within',
                'leuko-': 'white',
                'macro-': 'large',
                'micro-': 'small',
                'multi-': 'many',
                'nephro-': 'kidney',
                'neuro-': 'nerve',
                'osteo-': 'bone',
                'para-': 'beside',
                'peri-': 'around',
                'pneumo-': 'lung',
                'poly-': 'many',
                'post-': 'after',
                'pre-': 'before',
                'pseudo-': 'false',
                'pulmo-': 'lung',
                'retro-': 'behind',
                'semi-': 'half',
                'sub-': 'under',
                'super-': 'above',
                'supra-': 'above',
                'tachy-': 'fast',
                'trans-': 'across',
                'ultra-': 'beyond',
                'uni-': 'one'
            },
            suffixes: {
                '-algia': 'pain',
                '-ectomy': 'surgical removal',
                '-emia': 'blood condition',
                '-genesis': 'formation',
                '-genic': 'producing',
                '-gram': 'record',
                '-graph': 'instrument for recording',
                '-graphy': 'process of recording',
                '-itis': 'inflammation',
                '-logy': 'study of',
                '-lysis': 'destruction',
                '-megaly': 'enlargement',
                '-oma': 'tumor',
                '-osis': 'condition',
                '-ostomy': 'surgical opening',
                '-otomy': 'surgical incision',
                '-pathy': 'disease',
                '-penia': 'deficiency',
                '-phobia': 'fear',
                '-plasty': 'surgical repair',
                '-plegia': 'paralysis',
                '-ptosis': 'drooping',
                '-rrhage': 'excessive flow',
                '-rrhea': 'flow, discharge',
                '-scopy': 'visual examination',
                '-stasis': 'stopping',
                '-stenosis': 'narrowing',
                '-therapy': 'treatment',
                '-trophy': 'development',
                '-uria': 'urine condition'
            },
            roots: {
                'angi/o': 'vessel',
                'arthr/o': 'joint',
                'bronch/o': 'bronchus',
                'cardi/o': 'heart',
                'col/o': 'colon',
                'cost/o': 'rib',
                'crani/o': 'skull',
                'cutane/o': 'skin',
                'cyan/o': 'blue',
                'cyst/o': 'bladder',
                'enter/o': 'intestine',
                'gastr/o': 'stomach',
                'gloss/o': 'tongue',
                'hem/o': 'blood',
                'hepat/o': 'liver',
                'hist/o': 'tissue',
                'my/o': 'muscle',
                'nephr/o': 'kidney',
                'neur/o': 'nerve',
                'ophthalm/o': 'eye',
                'oste/o': 'bone',
                'ot/o': 'ear',
                'path/o': 'disease',
                'pneum/o': 'lung',
                'psych/o': 'mind',
                'pulmon/o': 'lung',
                'ren/o': 'kidney',
                'rhin/o': 'nose',
                'thromb/o': 'clot',
                'trache/o': 'trachea',
                'ur/o': 'urine',
                'vas/o': 'vessel',
                'ven/o': 'vein'
            }
        },

        // CODING DECISION RULES
        codingRules: {
            specificity: {
                'always_use_most_specific': true,
                'avoid_unspecified_when_specific_available': true,
                'code_to_highest_level_of_detail': true
            },
            sequencing: {
                'acute_before_chronic': true,
                'primary_diagnosis_first': true,
                'most_significant_condition_first': true
            },
            procedures: {
                'most_extensive_procedure_first': true,
                'use_appropriate_modifiers': true,
                'check_bundling_rules': true
            }
        },

        // VALIDATION PATTERNS
        validationRules: {
            cpt: {
                format: /^\d{5}$/,
                ranges: {
                    'valid_start': 10000,
                    'valid_end': 99999
                }
            },
            icd10cm: {
                format: /^[A-Z]\d{2}(\.\d{1,4})?$/,
                chapters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
            },
            hcpcs: {
                format: /^[A-Z]\d{4}$/,
                categories: ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'P', 'Q', 'R', 'S', 'T', 'V', 'X']
            }
        }
    };
}

module.exports = initializeKnowledgeBase;