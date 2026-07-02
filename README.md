# AI Career & Research Assistant (Frontend)

A stunning, responsive, and highly interactive frontend for the AI Career & Research Assistant platform. Built with Next.js App Router and styled with Tailwind CSS, this application provides users with an intuitive interface to interact with various AI-powered tools.

**Live Frontend Application:** [https://ai-assistant-gamma-sable.vercel.app](https://ai-assistant-gamma-sable.vercel.app)  
**Live Backend API URL:** [https://ai-assistant-backend-01.onrender.com](https://ai-assistant-backend-01.onrender.com)

---

## 🎨 UI & Design Philosophy

This frontend was designed with a heavy focus on **modern aesthetics**, **premium glassmorphism**, and **fluid micro-animations**.
- **Fully Responsive:** Perfectly adapts to desktop, tablet, and mobile views utilizing Dynamic Viewport Height (`dvh`) for flawless mobile browser experiences.
- **Dark Mode Native:** A sleek, deep-space aesthetic (`bg-[#060810]`) with vibrant neon accents (Cyan, Indigo, Fuchsia) powered by Lucide React icons.
- **Creative UI Elements:** Glowing active states, animated Google Sign-In buttons, hover lifts, and custom scrollbars to create a cohesive and professional UX.

---

## 🚀 Key Modules

1. **App Hub / Dashboard:** The central nervous system of the platform where users can access all tools.
2. **General AI Chat:** A multimodal ChatGPT-like interface that streams responses beautifully.
3. **Resume Reviewer:** A drag-and-drop file upload zone that parses resumes and displays a detailed ATS breakdown.
4. **Interview Assistant:** Interactive form to select Job Roles and Experience Levels, followed by a simulated Q&A flow.
5. **PDF Chatbot (RAG):** Upload PDFs and converse directly with the document content.
6. **Research Assistant:** Upload multiple PDFs, perform unified research analysis, and visualize data.
7. **Image Q&A:** A Vision AI interface where users can upload an image and ask contextual questions.
8. **Chat History:** Seamlessly integrated MongoDB history view that persists past conversations across sessions.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS (Vanilla CSS for custom animations/glass effects)
- **Icons:** Lucide React
- **Authentication:** NextAuth.js (Google OAuth Integration)
- **HTTP Client:** Axios (for connecting to the FastAPI backend)
- **Deployment:** Vercel

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
Create a `.env.local` file in the root directory and add the following:
```env
# Connection to the FastAPI Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=generate_a_random_secret_key
NEXTAUTH_SECRET=generate_a_random_secret_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure
```text
├── app/                    # Next.js App Router pages
│   ├── chatbot/
│   ├── general/
│   ├── history/
│   ├── interview/
│   ├── research/
│   ├── resume/
│   ├── vision/
│   ├── layout.tsx          # Global responsive wrapper
│   └── page.tsx            # Main App Hub dashboard
├── components/             # Reusable UI elements
│   ├── Sidebar.tsx         # Responsive glassmorphism navigation
│   ├── UserMenu.tsx        # Authentication & Profile dropdown
│   └── AuthProvider.tsx    # NextAuth Session wrapper
├── lib/
│   ├── api.ts              # Centralized Axios API definitions
│   └── auth.ts             # NextAuth Google provider setup
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind configuration & custom colors
```

---

## 👨‍💻 About The Developer

Developed by Harsh Pariya.
This frontend was meticulously crafted to provide a state-of-the-art user experience, pairing high-performance AI capabilities with a breathtaking visual interface.
