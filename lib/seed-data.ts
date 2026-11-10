/**
 * Rich Sample Seed Data for GapFinder AI
 * Curated Class 10 Life Sciences & Genetics curriculum
 * Pre-seeded for Demo Student and Demo Teacher.
 */

export const SAMPLE_SYLLABUS = `# Class 10 Life Sciences & Genetics Syllabus

## Unit 1: Photosynthesis & Plant Nutrition
- Light-dependent reactions and chlorophyll absorption in thylakoids
- Calvin cycle and glucose synthesis in stroma
- Environmental factors affecting photosynthetic rate (CO2 concentration, light intensity, temperature)

## Unit 2: Human Circulatory System
- Four-chambered heart anatomy and double circulation (pulmonary and systemic circuits)
- Structural differences between arteries, veins, and capillaries
- Blood composition and lymphatic system transport

## Unit 3: Cellular Respiration & Energy Production
- Glycolysis in cytoplasm (anaerobic breakdown of glucose to pyruvate)
- Aerobic respiration in mitochondria (Krebs cycle and ATP yield)
- Anaerobic fermentation in yeast and human muscle cells (lactic acid buildup)

## Unit 4: Mendelian Genetics & Heredity
- Mendel's laws of inheritance: Law of Segregation and Law of Independent Assortment
- Monohybrid crosses and 3:1 phenotypic ratios
- Dihybrid crosses (9:3:3:1 ratio) and Punnett square probability
- Sex determination in humans (XX/XY chromosomal mechanism)

## Unit 5: Excretion & Nephron Physiology
- Structure of the human urinary system and anatomy of the nephron
- Glomerular ultrafiltration and selective reabsorption in renal tubules
- Dialysis and artificial kidney filtration mechanisms
`;

export const SAMPLE_NOTES = `# Comprehensive Revision Notes: Life Sciences

### Chapter 1: Photosynthesis & Chloroplast Dynamics
Section 1.1: Photosynthesis takes place in chloroplasts. In thylakoid membranes, chlorophyll traps photons to split water molecules (photolysis), releasing oxygen gas and generating ATP and NADPH.
Section 1.2: The dark reaction (Calvin cycle) occurs in the stroma. Ribulose bisphosphate (RuBisCO) fixes carbon dioxide into glyceraldehyde-3-phosphate, which converts into glucose. Light intensity and carbon dioxide saturation reach plateaus at optimum levels.

### Chapter 2: Human Circulatory Mechanics
Section 2.1: Humans possess a double circulatory system consisting of pulmonary circulation (right ventricle to lungs to left atrium) and systemic circulation (left ventricle to body tissues to right atrium). The left ventricle possesses thicker muscular walls because it pumps against higher systemic resistance.
Section 2.2: Arteries have thick, elastic muscular walls with no valves to withstand high pressure. Veins have thin walls and one-way pocket valves to prevent blood backflow under low venous pressure.

### Chapter 3: Cellular Respiration & ATP Synthase
Section 3.1: Respiration begins with glycolysis in the cytoplasm, yielding 2 ATP and 2 pyruvate without requiring oxygen. In the presence of oxygen, pyruvate enters the mitochondrial matrix for the Krebs cycle and oxidative phosphorylation, generating up to 36-38 net ATP molecules per glucose molecule.
Section 3.2: When oxygen is deficient, human muscles perform lactic acid fermentation, creating an oxygen debt and localized fatigue.

### Chapter 4: Genetics & Punnett Square Analysis
Section 4.1: Gregor Mendel discovered inherited factors (genes). In a monohybrid cross of heterozygous pea plants (Tt x Tt), the genotype ratio is 1 TT : 2 Tt : 1 tt, resulting in a 3:1 tall-to-dwarf phenotypic ratio.
Section 4.2: Human sex determination is strictly determined by the father's gamete. Females produce only X gametes, while males produce 50% X and 50% Y sperm cells. Fertilization by Y sperm yields a male (XY).

### Chapter 5: Excretory Regulation & The Nephron
Section 5.1: Each kidney contains approximately 1 million functional units called nephrons. High hydrostatic pressure in the glomerulus forces water, glucose, amino acids, and urea into Bowman's capsule (ultrafiltration).
Section 5.2: In the proximal convoluted tubule and Loop of Henle, essential nutrients and 99% of filtered water are selectively reabsorbed into peritubular capillaries, while concentrated urea is directed to the collecting duct.
`;

export const SAMPLE_PAST_PAPERS = `# Board Examination Past Papers: 2021-2024 Collection

### Question 1 (2021, 3 Marks)
Explain why the left ventricle of the heart has a thicker muscular wall than the right ventricle. Reference systemic circulation.

### Question 2 (2022, 5 Marks)
Diagram the light-dependent stage of photosynthesis. What are the two primary energy carriers produced, and where does photolysis occur?

### Question 3 (2023, 4 Marks)
A homozygous dominant purple flower (PP) is crossed with a recessive white flower (pp). Determine the F1 and F2 generation phenotypic and genotypic ratios.

### Question 4 (2024, 3 Marks)
Contrast ultrafiltration with selective reabsorption in the nephron. Which blood vessel creates the pressure needed for glomerular filtration?

### Question 5 (2024, 2 Marks)
Why is anaerobic respiration in muscles less efficient than aerobic respiration in terms of ATP generation?
`;

export const SAMPLE_TOPICS = [
  {
    id: "topic_photo",
    title: "Photosynthesis & Plant Nutrition",
    description: "Light reactions, Calvin cycle, photolysis, and rate-limiting factors",
    examImportance: 9,
    examFrequency: 8,
    orderIndex: 1,
    citation: "Life Sciences Notes, Chapter 1, Section 1.1, p.4",
  },
  {
    id: "topic_circ",
    title: "Human Circulatory System",
    description: "Double circulation, heart anatomy, blood vessel histology, and valves",
    examImportance: 8,
    examFrequency: 7,
    orderIndex: 2,
    citation: "Life Sciences Notes, Chapter 2, Section 2.1, p.12",
  },
  {
    id: "topic_resp",
    title: "Cellular Respiration & Energy",
    description: "Glycolysis, mitochondria, ATP yield, and fermentation pathways",
    examImportance: 7,
    examFrequency: 5,
    orderIndex: 3,
    citation: "Life Sciences Notes, Chapter 3, Section 3.1, p.19",
  },
  {
    id: "topic_gene",
    title: "Mendelian Genetics & Inheritance",
    description: "Monohybrid/dihybrid crosses, Punnett squares, and sex determination",
    examImportance: 9,
    examFrequency: 9,
    orderIndex: 4,
    citation: "Life Sciences Notes, Chapter 4, Section 4.1, p.26",
  },
  {
    id: "topic_excr",
    title: "Excretion & Nephron Physiology",
    description: "Glomerular ultrafiltration, selective reabsorption, and dialysis",
    examImportance: 6,
    examFrequency: 4,
    orderIndex: 5,
    citation: "Life Sciences Notes, Chapter 5, Section 5.1, p.33",
  },
];

export const DEMO_CLASS_STUDENTS = [
  { id: "stu_1", name: "Aarav Sharma", email: "aarav@school.edu", readinessScore: 84, attemptsCount: 5, weakTopic: "Excretion & Nephron Physiology" },
  { id: "stu_2", name: "Diya Patel", email: "diya@school.edu", readinessScore: 92, attemptsCount: 6, weakTopic: "None (Mastered)" },
  { id: "stu_3", name: "Rohan Verma", email: "rohan@school.edu", readinessScore: 58, attemptsCount: 3, weakTopic: "Photosynthesis & Plant Nutrition" },
  { id: "stu_4", name: "Ananya Iyer", email: "ananya@school.edu", readinessScore: 78, attemptsCount: 4, weakTopic: "Cellular Respiration & Energy" },
  { id: "stu_5", name: "Kabir Singh", email: "kabir@school.edu", readinessScore: 61, attemptsCount: 2, weakTopic: "Mendelian Genetics & Inheritance" },
  { id: "stu_6", name: "Meera Nair", email: "meera@school.edu", readinessScore: 88, attemptsCount: 5, weakTopic: "Excretion & Nephron Physiology" },
  { id: "stu_7", name: "Zaid Khan", email: "zaid@school.edu", readinessScore: 52, attemptsCount: 2, weakTopic: "Human Circulatory System" },
  { id: "stu_8", name: "Tanvi Deshmukh", email: "tanvi@school.edu", readinessScore: 74, attemptsCount: 4, weakTopic: "Cellular Respiration & Energy" },
];
