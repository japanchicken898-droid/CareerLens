# CareerLens

> **The Autonomous Technical Telemetry & Verification Intelligence Engine for University Placement Cells and Enterprise Tech Hiring.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015%20%7C%20React%2019-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq LPU](https://img.shields.io/badge/Inference-Groq%20LLaMA%203.3%2070B-f55036?style=for-the-badge&logo=meta)](https://groq.com)
[![Validation F1](https://img.shields.io/badge/Benchmark%20F1--Score-93.3%25-4caf50?style=for-the-badge&logo=scikitlearn)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20%26%20Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)

---

### Navigation Index
- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture & ASCII Topology](#2-system-architecture--ascii-topology)
- [3. The Algorithmic Core & Formulations](#3-the-algorithmic-core--formulations)
- [4. The Four Core Architectural Modules](#4-the-four-core-architectural-modules)
- [5. Two-Tier Verification Strategy](#5-two-tier-verification-strategy)
- [6. Institutional Batch Cohort Analytics](#6-institutional-batch-cohort-analytics)
- [7. Empirical Benchmarks & Validation](#7-empirical-benchmarks--validation)
- [8. Data Contracts & API Specification](#8-data-contracts--api-specification)
- [9. Installation, Local Setup & Docker](#9-installation-local-setup--docker)
- [10. Enterprise Security, Auditing & Privacy](#10-enterprise-security-auditing--privacy)

---

## 1. Executive Summary

### The Core Problem: Resume Inflation & ATS Blindspots
University placement cells and enterprise technical recruiters are confronted with unprecedented **resume inflation**. Static PDF resumes claim mastery over *"Distributed Systems, Microservices, and React"*, yet conceal shallow tutorial forks or zero commit authorship. Traditional Applicant Tracking Systems (ATS) compound this vulnerability: because they operate via naive string matching, candidates who practice aggressive keyword stuffing receive top rankings, while engineering candidates with genuine, deep proof-of-work are filtered out.

```
                    TRADITIONAL RECRUITING PIPELINE (VULNERABLE)
  ┌─────────────────┐       ┌────────────────────┐       ┌─────────────────────┐
  │ Static PDF      │ ----> │ Naive Keyword ATS  │ ----> │ False-Positive      │
  │ "Claims Mastery"│       │ String Pattern RegEx│       │ Interview Pipeline  │
  └─────────────────┘       └────────────────────┘       └─────────────────────┘
                                                                │
                                                                ▼ (80% Rejection at Technical Round)

                       CAREERLENS VERIFICATION PIPELINE (SECURE)
  ┌─────────────────┐       ┌────────────────────┐       ┌─────────────────────┐
  │ PDF Resume +    │ ----> │ Autonomous Code    │ ----> │ Deterministic JRS   │
  │ Git + LeetCode  │       │ Telemetry Engine   │       │ & Audited Roadmaps  │
  └─────────────────┘       └────────────────────┘       └─────────────────────┘
```

### The CareerLens Solution
**CareerLens** is an auditable, stateless analytical intelligence layer that cross-evaluates claimed resume proficiencies against live, asynchronous developer telemetry:
1. **GitHub Repository Trees & Manifests:** Deep inspection of dependency trees (`package.json`, `requirements.txt`, `go.mod`), commit authorship cadence, and infrastructure assets (`Dockerfile`, `.github/workflows`).
2. **LeetCode Problem Distributions:** Algorithmic verification assessing Medium/Hard problem-solving volume to filter out scripted submissions.
3. **Deterministic Job Readiness Score ($JRS$):** A mathematically bounded score ($0 \le JRS \le 100$) calculated independently of generative AI to eliminate hallucination risk.
4. **Diagnostic Sprint Engine:** Groq LPU-accelerated LLaMA 3.3 70B structured via strict Pydantic schemas, translating deterministic skill deficits into personalized 4-week recovery roadmaps.

### Enterprise Positioning: Decoupled Analytical Intelligence
CareerLens is engineered as a **decoupled analytical intelligence layer**. It does not seek to replace institutional ERPs (e.g., SAP Campus Management, Peoplesoft) or enterprise ATS databases (e.g., Greenhouse, Lever, Workday). Instead, it operates downstream via stateless REST APIs and webhooks, ingesting candidate streams, computing proof-of-work telemetry, and emitting deterministic audit payloads directly into existing enterprise data pipelines.

---

## 2. System Architecture & ASCII Topology

The CareerLens pipeline operates across four decoupled processing planes: **Ingestion**, **Telemetry Verification**, **Mathematical Evaluation**, and **Remediation Orchestration**.

```
========================================================================================================================
                                             CAREERLENS SYSTEM TOPOLOGY MAP
========================================================================================================================

    [ CANDIDATE / INSTITUTIONAL INPUTS ]
    ├── Student Resume (PDF)
    ├── Public GitHub Handle / URL
    ├── LeetCode Handle
    └── Target Industry Role Benchmark
                   │
                   ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ MODULE 1: RESUME EXTRACTION LAYER (pdf_extractor.py)                                                             │
  │ ├─ pdfplumber 2D Coordinate Segmentation (x0, top, width, height)                                               │
  │ ├─ Font-Size Weighted Header Ranking & Candidate Identity Disambiguation                                         │
  │ └─ Regex Disambiguation Engine:                                                                                  │
  │    ├── Disambiguated Languages: Java vs. JavaScript/Node.js, C vs. C++, Go vs. Golang                         │
  │    └── Structural Entity Counts: Education (institutions), Internships (companies), Projects (titles)            │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                   │
                   ├───────────────────────────────────────────────┐
                   ▼                                               ▼
  ┌───────────────────────────────────────────────┐ ┌─────────────────────────────────────────────────────────────┐
  │ MODULE 2: CODE PROOF VERIFIER                 │ │ LEETCODE TELEMETRY INGESTION                                │
  │ (github_client.py)                            │ │ ├─ Total Solved Ratio                                       │
  │ ├─ Octokit / GitHub REST Scraper (Async)      │ │ ├─ Algorithmic Distribution (Easy / Med / Hard)             │
  │ ├─ Fork Filter: repo.fork == false            │ │ └─ Active Contest Rating Signal                             │
  │ ├─ Deep Root Tree & Manifest Inspection:     │ └─────────────────────────────────────────────────────────────┘
  │ │  ├── package.json / requirements.txt/go.mod │                                │
  │ │  ├── Dockerfile / docker-compose.yml        │                                │
  │ │  └── .github/workflows CI/CD Actions        │                                │
  │ └─ Language Byte Breakdown & Commit Cadence   │                                │
  └───────────────────────────────────────────────┘                                │
                   │                                                               │
                   └───────────────────────┬───────────────────────────────────────┘
                                           │
                                           ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ MODULE 3: DETERMINISTIC JOB READINESS SCORE ENGINE (jrs_calculator.py & ml_engine.py)                           │
  │ ├─ Role Benchmark Profiles: Backend Developer | Frontend Developer | ML Engineer | SDE-1                         │
  │ ├─ Competency Mapping: Claimed (Resume) vs. Verified (Code Manifests & Commits) vs. Missing (Role Benchmark)    │
  │ ├─ Linear Deterministic Formula: JRS = floor( [Sum(w_i) / S_max] * 100 )                                         │
  │ └─ Scikit-Learn Random Forest Regressor (R² = 0.941, n_estimators = 100):                                        │
  │    └── Top Feature Importances: Verified Ratio (34%), DSA Med/Hard (26%), Commit Cadence (21%)                  │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ DIAGNOSTIC SPRINT & REMEDIATION ENGINE (groq_engine.py)                                                          │
  │ ├─ Inference Acceleration: Groq LPU Cloud (Meta LLaMA 3.3 70B Versatile, sub-600ms latency)                    │
  │ ├─ Fallback Engine: Local Ollama (llama-3.1-8b-instant / llama3.1:8b)                                            │
  │ ├─ Pydantic Schema Enforcement: CareerLensLLMResponse (summary: 2 sentences, roadmap_steps: 3 concrete items)    │
  │ └─ Deterministic Verification Injection: Enforces that LLM cannot hallucinate new scores or override statuses    │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                   │
                   ├───────────────────────────────────────────────┐
                   ▼                                               ▼
  ┌───────────────────────────────────────────────┐ ┌─────────────────────────────────────────────────────────────┐
  │ CANDIDATE DIAGNOSTIC DASHBOARD (Next.js)      │ │ MODULE 4: INSTITUTIONAL BATCH COHORT ANALYZER               │
  │ ├─ Visual Metric Radar & Readiness Meter      │ │ (BatchReadinessDashboard.tsx)                               │
  │ ├─ Verified vs. Unverified Competency Matrix │ │ ├─ Macro Cohort Triage (e.g., 480 Candidate Records)       │
  │ ├─ 4-Week Actionable Sprint Plan              │ │ ├─ Institutional Skill Gap Heatmap (Docker, SQL, Redis)     │
  │ └─ Proctored Assessment & Audio Defense Modal │ │ └─ Placement Tier Breakdown (Tier 1 >75, Tier 2, At-Risk)  │
  └───────────────────────────────────────────────┘ └─────────────────────────────────────────────────────────────┘
========================================================================================================================
```

---

## 3. The Algorithmic Core & Formulations

CareerLens deploys a unified suite of four specialized algorithms operating at distinct phases of the pipeline.

```
+--------------------------------------------------------------------------------------------------------------------+
|                                              ALGORITHMIC SUITE OVERVIEW                                            |
+-------------------+-------------------------------------------+----------------------------------------------------+
| Algorithm         | Core Operational Objective                | Implementation Reference                           |
+-------------------+-------------------------------------------+----------------------------------------------------+
| 1. Cosine         | High-dimensional project alignment        | Vector space projection: Target Job Taxonomy vs.   |
|    Similarity     | against industry role requirements        | Candidate Project Descriptions                     |
+-------------------+-------------------------------------------+----------------------------------------------------+
| 2. Text           | Semantic disambiguation preventing naive  | High-dimensional vector mappings transforming free |
|    Embeddings     | keyword-stuffing manipulations            | text repositories to standardized competency nodes |
+-------------------+-------------------------------------------+----------------------------------------------------+
| 3. Weighted JRS   | Deterministic, unhallucinated readiness   | Bounded discrete scoring over required benchmarks  |
|    Formulation    | metric (0 to 100)                         | and continuous Random Forest Regressor regression  |
+-------------------+-------------------------------------------+----------------------------------------------------+
| 4. Layout-Aware   | 2D spatial coordinate segmentation for    | pdfplumber bounding-box sorting:                   |
|    Parser / NER   | multi-column PDF structural fidelity      | Line(y) = {w in W : |top(w) - y| <= delta_y}       |
+-------------------+-------------------------------------------+----------------------------------------------------+
```

### 3.1. Mathematical Formulation of the Job Readiness Score ($JRS$)

The deterministic Job Readiness Score ($JRS$) evaluates a candidate against a target role profile containing $N_{\text{req}}$ required core competencies $\{C_1, C_2, \dots, C_{N_{\text{req}}}\}$ and $M_{\text{pref}}$ preferred competencies $\{P_1, P_2, \dots, P_{M_{\text{pref}}}\}$.

#### Step 1: Discrete Competency Evidence Function
For each required competency $C_i$, the evidence mapping function $E(C_i)$ evaluates claimed vs. evidenced signals:

$$E(C_i) = \begin{cases} 3 & \text{if } \text{Supported in Code} \lor (\text{DSA} \land \text{LeetCode Active}) \quad &\text{[Verified]} \\ 1 & \text{if } \text{Claimed on Resume} \land \neg \text{Supported in Code} \quad &\text{[Unverified]} \\ 0 & \text{if } \neg \text{Claimed on Resume} \land \neg \text{Supported in Code} \quad &\text{[Missing]} \end{cases}$$

#### Step 2: Maximum Bounded Points
The maximum reachable required point ceiling $S_{\max}$ is defined as:

$$S_{\max} = 3 \times N_{\text{req}}$$

#### Step 3: Base Readiness Index Calculation
The candidate's score is computed as a deterministic ratio clamped between $0$ and $100$:

$$JRS_{\text{base}} = \max\left(0, \min\left(100, \left\lfloor \frac{\sum_{i=1}^{N_{\text{req}}} E(C_i)}{S_{\max}} \times 100 \right\rceil\right)\right)$$

#### Step 4: Continuous Placement Prediction Signal (Machine Learning Engine)
To complement the discrete thresholding with continuous institutional analytics, a trained Scikit-Learn **Random Forest Regressor** ($n_{\text{estimators}} = 100$, $\max_{\text{depth}} = 12$) computes the continuous placement probability $y_{\text{pred}} \in [10.0, 99.0]$:

$$y_{\text{signal}} = w_1 \cdot \hat{R}_{\text{verified}} + w_2 \cdot \hat{D}_{\text{DSA}} + w_3 \cdot \hat{C}_{\text{cadence}} + w_4 \cdot \hat{A}_{\text{CGPA}} + w_5 \cdot \hat{B}_{\text{claimed}}$$

Where the feature weights $w_k$ reflect empirical feature importances:
- $\hat{R}_{\text{verified}} = \frac{R_{\text{verified}} - 0.10}{0.90}$ with weight $w_1 = 34.0\%$ (**Verified Skills Ratio**)
- $\hat{D}_{\text{DSA}} = \frac{D_{\text{med/hard}} - 10}{270.0}$ with weight $w_2 = 26.0\%$ (**LeetCode Depth - Med/Hard**)
- $\hat{C}_{\text{cadence}} = \frac{C_{\text{streak}} - 5}{175.0}$ with weight $w_3 = 21.0\%$ (**90-Day Commit Cadence**)
- $\hat{A}_{\text{CGPA}} = \frac{\text{CGPA} - 6.5}{3.3}$ with weight $w_4 = 14.0\%$ (**Academic Foundation**)
- $\hat{B}_{\text{claimed}} = \frac{B_{\text{claimed}} - 5}{17.0}$ with weight $w_5 = 8.0\%$ (**Resume Claim Breadth**)

```
                                  JRS FEATURE WEIGHT DISTRIBUTION
  Verified Skills Ratio   [██████████████████████████████████] 34.0%
  LeetCode Med/Hard DSA   [██████████████████████████] 26.0%
  Commit Cadence Streak   [█████████████████████] 21.0%
  Academic CGPA Score     [██████████████] 14.0%
  Claimed Breadth Count   [████████] 8.0%
```

### 3.2. Cosine Similarity for Project Alignment
Project descriptions extracted from both resume narratives and repository `README.md` manifests are converted into dense vector representations $\mathbf{u}, \mathbf{v} \in \mathbb{R}^d$. The contextual alignment score is determined via normalized dot product:

$$\text{Sim}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2} = \frac{\sum_{k=1}^d u_k v_k}{\sqrt{\sum_{k=1}^d u_k^2} \sqrt{\sum_{k=1}^d v_k^2}}$$

Candidates whose repositories score $\text{Sim}(\mathbf{u}, \mathbf{v}) < 0.35$ against target job taxonomies are flagged for project irrelevance.

### 3.3. 2D Spatial Layout Segmentation & NER Disambiguation
Traditional text extraction concatenates columns horizontally, causing fatal entity corruptions (e.g., merging an employer in column 1 with a programming language in column 2). 

CareerLens executes bounding-box spatial clustering:
$$\mathcal{L}(y) = \left\{ w \in \mathcal{W} \;\middle|\; |y_{\text{top}}(w) - y| \le \epsilon_y \right\}, \quad \text{ordered by } x_0(w)$$

A candidate header line ranking metric $H(\mathcal{L})$ isolates candidate names from noisy contact rows:

$$H(\mathcal{L}) = \frac{1}{|\mathcal{L}|} \sum_{w \in \mathcal{L}} \text{font\_size}(w) - \alpha \cdot \text{line\_index} - \beta \cdot \mathbb{I}\big(\text{contact\_regex}(\mathcal{L})\big)$$

---

## 4. The Four Core Architectural Modules

```
+---------------------------------------------------------------------------------------------------------------------+
|                                          MODULE 1: RESUME EXTRACTION LAYER                                          |
+---------------------------------------------------------------------------------------------------------------------+
| File: backend/pdf_extractor.py                                                                                      |
| • 2D Coordinate Parsing: Uses pdfplumber to track bounding boxes (x0, top, height, width).                           |
| • Strict Token Disambiguation: Distinguishes Java from JavaScript, C from C++, Go from English "go".                 |
| • Section Triage: Automatically parses and isolates Education, Industry Experience, and Project blocks.             |
| • Entity Filtering: Strips candidate contact boilerplate, URLs, and institutional headers to prevent misnomers.      |
+---------------------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------------------+
|                                          MODULE 2: CODE PROOF VERIFIER                                              |
+---------------------------------------------------------------------------------------------------------------------+
| File: backend/github_client.py                                                                                      |
| • Asynchronous Multi-Repo Scraper: Scans up to 30 public repos via GitHub REST API / Octokit.                       |
| • Fork Exclusion Filter: Enforces repo.fork == false to prevent students claiming third-party open-source repos.    |
| • Manifest Analyzer: Parses package.json (Node), requirements.txt (Python), and go.mod (Go) for true dependencies.  |
| • Infrastructure Inspector: Identifies Dockerfile, docker-compose, and .github/workflows for DevOps claims.         |
| • Byte Breakdown: Evaluates primary programming languages based on GitHub linguistic byte counts.                   |
+---------------------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------------------+
|                                      MODULE 3: JOB READINESS SCORE (JRS) ENGINE                                     |
+---------------------------------------------------------------------------------------------------------------------+
| File: backend/jrs_calculator.py & backend/ml_engine.py                                                               |
| • Zero-Hallucination Calculus: Employs strict integer arithmetic for required and preferred benchmark skills.       |
| • Role Taxonomies: Pre-calibrated benchmarks for Backend Developer, Frontend Developer, ML Engineer, and SDE-1.       |
| • Tri-State Categorization: Categorizes every skill as "Verified" (3 pts), "Unverified" (1 pt), or "Missing" (0 pts)|
| • Random Forest Placement Predictor: 100-tree ensemble trained on 500 cohort samples providing continuous R^2 stats.|
+---------------------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------------------+
|                                      MODULE 4: BATCH COHORT ANALYSIS & HEATMAPS                                     |
+---------------------------------------------------------------------------------------------------------------------+
| File: capfly vit/src/components/BatchReadinessDashboard.tsx & backend/placement_cohort.csv                           |
| • Institutional Macro Dashboard: Triages large student cohorts (e.g., 480 candidates) into actionable score tiers.  |
| • At-Risk Filtering: Instantly isolates students with JRS < 50 requiring urgent remediation.                        |
| • Institutional Deficit Heatmap: Identifies systemic curriculum gaps across Docker, Relational SQL, and Redis.       |
| • CSV Batch Export: Generates audited employability rosters for tier-1 tech recruiters and enterprise job matching.|
+---------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Two-Tier Verification Strategy

To guarantee bulletproof defense against both passive resume inflation and generative AI proxy fraud, CareerLens deploys a synchronized **Two-Tier Verification Strategy**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           TWO-TIER VERIFICATION TAXONOMY                                           │
├─────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┤
│ TIER 1: ASYNCHRONOUS ENGINEERING TELEMETRY      │ TIER 2: SYNCHRONOUS PROCTORED ASSESSMENTS                        │
├─────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ • Execution Mode: Passive, automated background │ • Execution Mode: Active, real-time proctored candidate session  │
│   telemetry harvest.                            │   with live audio defense.                                       │
│ • Telemetry Scraped:                            │ • Assessments Administered:                                      │
│   - Git commit history & cadence (90-day activity)│  - Timed cognitive logic & dynamic DSA exam interface.          │
│   - Dependency manifests (ORM, drivers, tooling)│   - Live webcam feed tracking student focus & presence.          │
│   - LeetCode algorithmic volume & distribution   │   - Speech-to-Text (STT) real-time verbal defense via Whisper.   │
│ • Target Defense: Uncovers shallow claims,      │ • Target Defense: Neutralizes generative AI proxies, outsourced  │
│   tutorial copy-pastes, and static resume lies. │   take-homes, and ghost interviewers.                            │
│ • Output: Deterministic Job Readiness Score     │ • Output: Technical clarity, tradeoff depth, and communication   │
│   (JRS out of 100).                             │   practice scores (isolated from primary JRS baseline).          │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

### The Proctored Verbal Defense Pipeline (`interview_router.py`)
In Tier 2, candidates participate in an interactive technical defense of their projects.
1. **Audio Ingestion:** Candidate audio streams are transmitted via HTTP multi-part chunks directly into the backend.
2. **Sub-Second Speech-to-Text (`faster-whisper`):** A locally hosted `base.en` model running int8 quantization on CPU converts audio into low-latency transcripts without cloud round-trips.
3. **Adaptive Examiner Persona:** Powered by Groq `llama-3.1-8b-instant` (or local Ollama `llama3.1:8b`), the AI asks targeted architectural probing questions based on the candidate's verified GitHub repositories (e.g., *"Explain why you used Redis caching over in-memory dictionaries in SimResus"*).
4. **Architectural Isolation:** Strict isolation rules ensure Tier 2 practice evaluations **never write back to or corrupt** the deterministic JRS baseline.

---

## 6. Institutional Batch Cohort Analytics

Designed specifically for Deans of Engineering, University Placement Directors, and Technical Talent Acquisition Executives, Module 4 scales CareerLens from individual analysis to institutional cohort intelligence.

```
+--------------------------------------------------------------------------------------------------------------------+
|                                      COHORT READINESS TRIAGE MATRIX (N = 480)                                      |
+----------------------+--------------------+-------------------+----------------------------------------------------+
| Placement Tier       | JRS Score Range    | Cohort Percentage | Institutional Action Required                      |
+----------------------+--------------------+-------------------+----------------------------------------------------+
| Tier 1: Day-1 Ready  | JRS >= 75 / 100    | 24.2% (116 studs)  | Direct fast-track dispatch to Tier-1 recruiters.   |
| Tier 2: Adaptable    | 50 <= JRS < 75     | 53.8% (258 studs)  | Enroll in targeted 2-week sprint for gaps.         |
| Tier 3: High Risk    | JRS < 50 / 100     | 22.0% (106 studs)  | Mandatory 4-week diagnostic intervention sprint.   |
+----------------------+--------------------+-------------------+----------------------------------------------------+
```

### Institutional Curriculum Deficit Heatmap
By aggregating individual verification records across hundreds of students, CareerLens surfaces blindspots in university curricula:

```
[Institutional Curriculum Deficit Heatmap - Sample Cohort of 480 Students]
Competency Area                  Market Demand    Cohort Gap Index    Deficit Status
────────────────────────────────────────────────────────────────────────────────────────
Relational Databases (SQL)          92%               62%             [████████████░░░░] Moderate Deficit
Docker / Containerization           86%               81%             [████████████████] CRITICAL DEFICIT
REST APIs & Frameworks              94%               44%             [████████░░░░░░░░] Acceptable Baseline
System Architecture & CI/CD         78%               73%             [██████████████░░] HIGH DEFICIT
Redis / In-Memory Caching           68%               74%             [██████████████░░] HIGH DEFICIT
Git Version Control Workflow        98%               22%             [████░░░░░░░░░░░░] Strong Alignment
```

---

## 7. Empirical Benchmarks & Validation

To validate that CareerLens delivers enterprise-grade verification without random variance, the system was subjected to rigorous empirical evaluation against 25 manually annotated ground-truth candidate instances (`backend/benchmark.py`).

### 7.1. Benchmark Evaluation Metrics

```
+--------------------------------------------------------------------------------------------------------------------+
|                                    EMPIRICAL VALIDATION BENCHMARK RESULTS (N = 25)                                 |
+-----------------------------+-----------------------+--------------------------------------------------------------+
| Metric Parameter            | Observed Value        | Theoretical & Operational Significance                       |
+-----------------------------+-----------------------+--------------------------------------------------------------+
| Sample Size (Cohorts)       | 25 Instances          | Ground-truth annotated resumes and GitHub profiles           |
| Precision                   | 93.3% (0.9333)        | Ultra-low false-positive rate; verified skills reflect proof |
| Recall                      | 93.3% (0.9333)        | Highly sensitive detection of unevidenced resume claims      |
| F1-Score                    | 93.3% (0.9333)        | Harmonious balance between precision and claim recall        |
| Overall Accuracy            | 92.0% (23 / 25)       | Consistent categorization across diverse portfolios          |
| Scikit-Learn Engine         | Active & Verified     | sklearn.metrics (precision_score, recall_score, f1_score)    |
+-----------------------------+-----------------------+--------------------------------------------------------------+
```

### 7.2. Confusion Matrix Breakdown

```
                             PREDICTED CLASS
                         Positive        Negative
                     ┌───────────────┬───────────────┐
       Positive (1)  │    TP = 14    │    FN = 1     │   Recall = 14 / 15 = 93.3%
TRUE                 ├───────────────┼───────────────┤
CLASS  Negative (0)  │    FP = 1     │    TN = 9     │   Specificity = 9 / 10 = 90.0%
                     └───────────────┴───────────────┘
                       Precision = 14 / 15 = 93.3%
```

- **True Positives (TP = 14):** Authenticated candidates whose real code telemetry matched their resume claims.
- **True Negatives (TN = 9):** Inflated resumes successfully caught and flagged for lack of public code proof.
- **False Positives (FP = 1):** Edge case where extensive private repository contributions were unobservable via public API.
- **False Negatives (FN = 1):** Highly specialized custom monorepo structure where dependency files were placed outside standard root directories.

### 7.3. Scikit-Learn Random Forest Regressor Telemetry
Trained on a 500-student dataset (`backend/placement_cohort.csv`) split 80/20 into train and test sets:
- **Model Type:** Scikit-Learn `RandomForestRegressor` (`n_estimators=100`, `max_depth=12`, `random_state=42`)
- **Coefficient of Determination ($R^2$):** **0.941**
- **Root Mean Squared Error (RMSE):** **3.18**
- **Inference Latency:** $< 4\text{ms}$ per candidate vector

---

## 8. Data Contracts & API Specification

CareerLens exposes an asynchronous RESTful API structured around strict Pydantic v2 schemas.

```
========================================================================================================================
                                          REST API ENDPOINT DIRECTORY
========================================================================================================================
Method   Endpoint                 Description                              Response Contract
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
GET      /api/health              Service health & Groq LPU status        HealthStatusResponse
GET      /api/benchmark-metrics   Scikit-Learn benchmark metrics & weights BenchmarkMetricsResponse
GET      /api/ml-model-stats      Random Forest Regressor R^2 & metadata   MLModelMetadataResponse
POST     /api/extract-name        Positional PDF candidate name extractor  NameExtractionResponse
POST     /api/analyze             Full profile verification & JRS scoring  AnalyzeResponse
POST     /api/interview/chat      Proctored technical defense dialogue    InterviewChatResponse
POST     /api/interview/evaluate  Proctored verbal assessment evaluation  InterviewEvaluationResponse
POST     /api/interview/stt       Whisper speech-to-text audio upload     STTTranscriptionResponse
========================================================================================================================
```

### 8.1. Candidate Profile Analysis Contract (`POST /api/analyze`)

#### Request (Multipart Form Data):
- `resume` *(UploadFile, required)*: PDF binary document.
- `github_username` *(str, required)*: Public GitHub handle or profile URL.
- `leetcode_username` *(str, optional)*: LeetCode profile handle.
- `target_role` *(str, default: "Backend Developer")*: Target role benchmark.
- `candidate_name` *(str, optional)*: Overrides auto-detected name if provided.

#### Response Schema (`AnalyzeResponse`):
```json
{
  "candidate_name": "Alex Vance",
  "target_role": "Backend Developer",
  "readiness_score": 78,
  "verdict": "Moderate employability baseline. Resolve 1 unverified claim(s) and 1 core gap(s).",
  "summary": "Candidate demonstrates solid backend foundations with active Python and FastAPI repositories. Lacks observable Docker container configurations and relational database schema migrations.",
  "skills": [
    {
      "name": "Data Structures & Algorithms",
      "status": "Verified",
      "reason": "Demonstrated via active LeetCode DSA profile & problem-solving track"
    },
    {
      "name": "REST APIs / Backend Frameworks",
      "status": "Verified",
      "reason": "Verified backend framework 'FastAPI' in repository code dependencies"
    },
    {
      "name": "Docker / Containerization",
      "status": "Unverified",
      "reason": "Mentioned on resume, but absent from GitHub repos (14 public repos inspected)"
    },
    {
      "name": "Relational Databases (SQL/PostgreSQL)",
      "status": "Missing",
      "reason": "Required benchmark skill omitted from both resume claims and GitHub code."
    }
  ],
  "roadmap_steps": [
    "1. Containerize the existing FastAPI project by authoring a multi-stage Dockerfile and docker-compose.yml configuration.",
    "2. Integrate PostgreSQL with SQLAlchemy and execute alembic schema migrations, publishing code to public repository.",
    "3. Implement Redis caching layers for read-heavy API endpoints with benchmark throughput comparisons."
  ],
  "github_repos_count": 14,
  "repos_sample": ["ecommerce-fastapi", "algo-prep", "redis-cache-layer"],
  "deterministic_score": 78,
  "llm_enhanced": true,
  "education_count": 1,
  "experience_count": 2,
  "project_count": 3,
  "resume_status_text": "1 edu • 2 exp • 3 proj",
  "ml_prediction": {
    "predicted_score": 76.4,
    "confidence": "High",
    "used_ml_model": true,
    "r2_metric": 0.941
  }
}
```

---

## 9. Installation, Local Setup & Docker

### 9.1. Prerequisites
- **Node.js:** v18.17.0+ or v20+
- **Python:** v3.10 or v3.11
- **Docker & Docker Compose:** Latest stable release
- **API Keys:** Groq Cloud API Key (`gsk_...`), GitHub Personal Access Token (optional, for rate limit expansion)

### 9.2. Local Environment Setup

#### Clone the Repository:
```bash
git clone https://github.com/japanchicken898-droid/CareerLens.git
cd CareerLens
```

#### Step A: Configure Backend Service
```bash
cd backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install locked dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
# Groq LPU API Key (Required for LLaMA 3.3 70B inference)
GROQ_API_KEY=gsk_your_groq_api_key_here

# GitHub Personal Access Token (Optional: Increases rate limit from 60 to 5,000 req/hr)
GITHUB_TOKEN=ghp_your_github_token_here

# Service Port
PORT=8000
```

Start the FastAPI application:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs at `http://localhost:8000` (Interactive Swagger docs available at `http://localhost:8000/docs`).*

#### Step B: Configure Frontend Application
```bash
# From repository root
cd "capfly vit"

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

### 9.3. Production Docker Deployment

CareerLens includes multi-stage containerization for seamless enterprise orchestration.

#### Multi-Container `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: careerlens-backend
    ports:
      - "8000:8000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - PORT=8000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./capfly vit
      dockerfile: Dockerfile
    container_name: careerlens-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
```

#### Launch the Stack:
```bash
docker-compose up --build -d
```

Verify service status:
```bash
docker-compose ps
curl http://localhost:8000/api/health
```

---

## 10. Enterprise Security, Auditing & Privacy

CareerLens was engineered with strict adherence to higher-education data compliance, FERPA boundaries, and enterprise privacy standards:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ENTERPRISE COMPLIANCE & GOVERNANCE                                           │
├─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────┤
│ Zero Data Retention    │ Resumes uploaded to CareerLens are parsed strictly in-memory using BytesIO buffers. No    │
│ (Ephemeral Processing)  │ PDF files, parsed text snippets, or student transcripts are persisted to permanent disk. │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────┤
│ Cryptographic Audit     │ Every verification run generates a deterministic SHA-256 telemetry fingerprint of the    │
│ Trail Receipts          │ candidate's public commits and manifests, guaranteeing non-repudiation for recruiters.   │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────┤
│ Rate-Limitation & Abuse │ Token-bucket throttling prevents denial-of-service abuse across both PDF parsing and     │
│ Prevention              │ GitHub API telemetry scraping surfaces.                                                  │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────┤
│ Decoupled LLM Guardrail │ Generative models operate strictly inside bounded Pydantic schemas. The LLM is denied     │
│ Architecture            │ execution rights to alter mathematical JRS scores, eliminating prompt-injection attacks. │
└─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Engineering Contributors & Hackathon Metadata

- **Project Name:** CareerLens
- **Hackathon Track:** AI-Driven Education, Employability Intelligence & Enterprise Hiring
- **Primary Repository:** [japanchicken898-droid/CareerLens](https://github.com/japanchicken898-droid/CareerLens)
- **Architecture Standard:** Decoupled Microservice Topology (Next.js / FastAPI / Groq LPU)
- **License:** Apache License 2.0. Distributed under enterprise open-source licensing.

---
*Built with architectural rigor, deterministic telemetry, and ultra-fast inference for the next generation of technical talent.*