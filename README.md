# EnableFlow

EnableFlow is a suite of simple, fast, and practical tools designed for everyday corporate work. It offers a collection of utilities across Finance, HR, Productivity, and General Utilities, all wrapped in a modern, clean, and professional SaaS interface.

![EnableFlow](src/assets/enableflow-logo.png)

## Features

EnableFlow provides a centralized hub for essential web-based tools:

### 💰 Finance & Salary
- **Salary Calculator**: Detailed breakdown of CTC to in-hand salary (PF, Tax, Deductions).
- **EMI Calculator**: Calculate monthly EMIs for loans with amortization schedules.
- **GST Calculator**: Quick calculation of GST amounts and total prices.
- **Invoice Generator**: (Coming Soon) Create professional invoices instantly.

### 👥 HR & Management
- **Working Days Calculator**: Calculate business days between dates, excluding weekends/holidays.
- **Notice Period Calculator**: (Coming Soon) Determine exit dates based on resignation and notice period.
- **Leave Calculator**: (Coming Soon) Track and plan leave balances.

### ⚡ Productivity
- **Pomodoro Timer**: Stay focused with customizable work/break intervals.
- **Time Zone Converter**: (Coming Soon) Coordinate meetings across different time zones.

### 🛠️ Utilities
- **Word & Character Counter**: Real-time analysis of text content.
- **JSON Formatter**: Validate, format, and beautify JSON data.
- **URL Encoder/Decoder**: Encode or decode URLs for web development.
- **UUID Generator**: (Coming Soon) Generate unique identifiers.

## Tech Stack

This project is built with a modern frontend stack ensuring performance and maintainability:

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd enable_flow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080` (or similar).

### Building for Production

To create a production-ready build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets (images, logos)
├── components/      # Reusable React components
│   ├── ui/          # shadcn/ui primitive components
│   ├── Header.tsx   # Main navigation bar
│   ├── Hero.tsx     # Homepage hero section
│   └── ...
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and tool definitions
├── pages/           # Application pages
│   ├── tools/       # Individual tool pages
│   └── Index.tsx    # Homepage
├── App.tsx          # Main application component with routing
└── main.tsx         # Application entry point
```

## License

This project is open-source and available for personal and commercial use.
