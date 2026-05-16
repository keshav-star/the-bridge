# The Bridge: Project Documentation & Analysis

## 1. Executive Summary & Main Goal
**The Bridge** is a high-trust, AI-augmented recruitment ecosystem built exclusively for the UIET (University Institute of Engineering and Technology) college community. The main goal of this platform is to solve the "signal-to-noise" problem in university recruitment. By bridging the gap between college students and alumni recruiters, the platform ensures that students are matched with opportunities based on true skill alignment, while recruiters receive highly curated, AI-vetted applications instead of a flood of irrelevant resumes.

## 2. Project Scope
The scope of The Bridge encompasses a full-stack web application featuring dedicated dashboards for both students and recruiters.

**In-Scope:**
*   **Student Portal:** Seamless resume upload, AI-driven skill parsing, automated "Skill Matrix" generation, and an AI pitch generator that personalizes project experiences to match specific job descriptions.
*   **Recruiter Portal:** Job description (JD) submission and instant AI-vetted candidate matching using vector embeddings (Cosine Similarity).
*   **Trust Score System:** A reputation system where alumni ratings influence student visibility, discouraging spam applications and rewarding high-quality submissions.
*   **Automated Apply Agent (Phase 3):** Playwright-driven agents that can automatically map a student's parsed JSON profile to external applicant tracking system (ATS) forms for one-click applying.

**Out-of-Scope (for MVP):**
*   In-app video interviewing or live coding environments.
*   Direct payroll or contract management functionalities.
*   Public access (the platform is strictly gated to the UIET community).

## 3. Analysis of Project & Idea
### The Problem
Current college recruitment relies heavily on mass-apply strategies. Students blindly submit resumes to hundreds of jobs, leading to ATS fatigue. Alumni and recruiters who want to hire from their alma mater are overwhelmed by the sheer volume of low-quality, spray-and-pray applications.

### The Solution: The Bridge
The Bridge introduces **semantic matching and curated trust**. Instead of keyword matching, it uses LLMs to deeply understand the context of a student's experience and maps it directly to the semantic requirements of a JD. 
*   **For Students:** It removes the friction of manual data entry and helps them put their best foot forward with tailored pitches.
*   **For Recruiters:** It reduces the time-to-hire by instantly surfacing the top 5 candidates in the university database whose skills genuinely match the role.

## 4. Business Criteria
To be considered successful, The Bridge must meet the following business criteria:
1.  **Exclusivity & Trust:** Must maintain a closed-loop environment for UIET students and alumni to foster high trust.
2.  **High-Fidelity Matching:** The AI vector search must return highly relevant candidates (target >85% relevance in top 5 results).
3.  **Performance:** Resume parsing and skill matrix generation must occur in under 5 seconds to ensure a premium user experience.
4.  **Aesthetics:** The UI/UX must be modern, dynamic, and visually exceptional ("Product-of-the-Year" quality) to encourage high user adoption and engagement.

## 5. Requirements
### Functional Requirements
*   **Authentication:** Secure login for Students and Alumni/Recruiters (Role-based access).
*   **File Processing:** Ability to securely upload, parse, and store PDF resumes.
*   **Data Processing:** LLM integration to extract structured JSON (Skill Matrix) from unstructured resume text.
*   **Vector Search:** PostgreSQL with `pgvector` to store embeddings and perform semantic similarity queries.
*   **Dashboards:** Real-time data visualization of match scores and candidate profiles.

### Non-Functional Requirements
*   **Scalability:** Must support a concurrent user base of 1,000+ UIET members.
*   **Resilience:** Containerized architecture (Docker) for seamless deployment and environment parity.
*   **Security:** Protection against SQL injection, secure handling of OpenAI API keys, and safe file parsing.

## 6. Resources Needed
### Technology Stack
*   **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, Recharts.
*   **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy (Async).
*   **Database:** PostgreSQL with `pgvector` extension.
*   **AI/ML:** OpenAI SDK, LangChain / LlamaIndex, text-embedding models (e.g., `text-embedding-3-small`).
*   **Automation:** Playwright (for automated job applications).
*   **Infrastructure:** Docker, Docker Compose.

### Personnel / Roles
*   **Full-Stack AI Engineer:** To orchestrate the integration of Next.js, FastAPI, and OpenAI models.
*   **UI/UX Designer:** To ensure the dark-mode, glassmorphic design system is strictly adhered to.
*   **Database Administrator:** To optimize vector similarity searches and handle database migrations.

---
*Prepared for The Bridge MVP Phase.*
