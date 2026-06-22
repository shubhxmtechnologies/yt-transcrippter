# TranscriptAI Frontend (Client)

This is the React frontend for the TranscriptAI application. It provides a beautiful, premium "Aura AI" dark-mode UI with glassmorphism effects to interact with YouTube transcripts and the AI Chat.

## Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (No Tailwind) using CSS Variables for Design Tokens.
- **Icons**: Lucide React
- **Markdown Rendering**: `react-markdown` + `react-syntax-highlighter`

## Design System

The application uses the **Aura AI Design System**. It relies heavily on:
- Deep indigo and charcoal backgrounds (`#051424`)
- Glassmorphism (backdrop blurs and translucent background cards)
- Glowing interactions (focus states, neon borders)
- CSS Grid/Flexbox layouts that are responsive for mobile.

### Key CSS Classes
- `.glass-card`: A translucent container with a backdrop blur and a subtle white border.
- `.glass-input`: A floating text input container used in the chat.
- `.glow-indigo`: A subtle indigo box shadow used to highlight elements or show focus states.

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### `npm run build`
Compiles TypeScript and builds the app for production to the `dist` folder.
