# AI Career & Research Assistant (Frontend)

A stunning, responsive, and highly interactive frontend for the AI Career & Research Assistant platform. Built entirely from scratch, this application provides users with an intuitive, premium interface to interact with various AI-powered tools.

**Live Frontend Application:** [https://ai-assistant-gamma-sable.vercel.app](https://ai-assistant-gamma-sable.vercel.app)  
**Live Backend API URL:** [https://ai-assistant-backend-01.onrender.com](https://ai-assistant-backend-01.onrender.com)

---

## 🏗️ How It Was Built & Technology Breakdown

Every single line of this frontend was custom-written to ensure a beautiful, flawless, and highly responsive user experience. Here is exactly what is used and why:

- **Core Framework (Next.js 14+ App Router & React 18):** We used the modern Next.js App Router for optimal routing, performance, and server-side capabilities.
- **Styling (Tailwind CSS & Vanilla CSS):** The entire UI was built using Tailwind CSS for rapid utility-based styling. We specifically leveraged deep Tailwind integration mixed with raw Vanilla CSS to achieve stunning, premium **glassmorphism** effects (backdrop blurs, translucent borders, and glowing active states).
- **Responsive Layouts (`dvh`):** We strictly utilized Dynamic Viewport Heights (`100dvh`) to ensure that mobile browser UI bars (like in Safari/Chrome) do not clip or overlap the application interface.
- **Icons & Micro-Animations:** We use `lucide-react` for clean, modern iconography. The application is filled with custom micro-animations (hover lifts, gradient shifts, pulse glows) that make the interface feel alive.
- **Authentication (NextAuth.js):** We integrated `next-auth` to provide secure, one-click Google OAuth Sign-In. User sessions are robustly managed and passed back to the API.
- **API Communication (Axios):** `axios` is used as the HTTP client to handle large multipart form data uploads (for PDFs and Images) with custom timeout handling for heavy AI tasks.

*Note on AI Integrations: This frontend connects to a custom Python backend powered directly by Groq. **We DO NOT use LangChain** anywhere in this stack; we chose a pure, custom-built approach for maximum speed and lower overhead.*

---

## 🚀 Key Modules

1. **App Hub / Dashboard:** The central nervous system of the platform.
2. **General AI Chat:** A multimodal ChatGPT-like interface that streams responses beautifully.
3. **Resume Reviewer:** A drag-and-drop file upload zone that parses resumes and displays a detailed ATS breakdown.
4. **Interview Assistant:** Interactive form to select Job Roles and Experience Levels, followed by a simulated Q&A flow.
5. **PDF Chatbot (Custom RAG):** Upload PDFs and converse directly with the document content.
6. **Research Assistant:** Upload multiple PDFs, perform unified research analysis, and visualize data.
7. **Image Q&A:** A Vision AI interface where users can upload an image and ask contextual questions.
8. **Chat History:** Seamlessly integrated MongoDB history view that persists past conversations across sessions.

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- A [Google Cloud Console](https://console.cloud.google.com/) account (for OAuth Credentials)

### 2. Clone the Repository
```bash
git clone https://github.com/HarshPariya/AI-Assistant-Frontend.git
cd AI-Assistant-Frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=generate_a_random_secret_key
NEXTAUTH_SECRET=generate_a_random_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Run the Application
```bash
npm run dev
```

---

## 👨‍💻 About The Developer

Developed by **Harsh Pariya**.
This frontend was meticulously crafted from a blank slate to provide a state-of-the-art user experience. By combining raw Next.js performance with breathtaking glassmorphism UI/UX design patterns, this application proves that powerful AI tools can also be deeply beautiful and perfectly responsive on any device.
