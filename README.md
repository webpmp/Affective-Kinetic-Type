# Kinetic Typography AI Chat

An interactive, highly visual AI chat application that brings conversations to life using dynamic kinetic typography and context-aware environments. Powered by Google's Gemini AI, the application analyzes the sentiment, engagement, and context of the conversation to animate text and change background weather effects in real-time.

## 🌟 Key Features

*   **🤖 Gemini AI Integration:** Powered by Google's Gemini 3.1 Pro for intelligent, context-aware, and emotionally resonant conversations.
*   **✨ Kinetic Typography:** Words dynamically animate, scale, and change color based on the underlying emotional sentiment and engagement levels of the AI's response.
*   **🌦️ Dynamic Weather Backgrounds:** The environment reacts to your conversation. Discussing rain, snow, fog, or sunshine will automatically trigger immersive, animated background effects.
*   **♿ Accessibility First:** Built-in WCAG compliance controls (A, AA, AAA). Strict mode ensures that text contrast remains readable and animations stay within safe, non-distracting limits.
*   **💬 Conversation Mode:** Responses are segmented and delivered sequentially with timed transitions, mimicking a natural conversational flow.
*   **🎛️ Granular Controls:** A comprehensive control panel allows users to tweak fonts, animation intensity, emotional influence, and layout modes.

## 💡 How to Use

1.  **Start a Conversation:** Type a message into the chat input at the bottom of the screen.
2.  **Watch it Come Alive:** Observe how the AI's response is styled. Positive, high-engagement words might bounce and glow, while serious topics might appear more grounded and stable.
3.  **Change the Weather:** Try talking about a snowy winter day or a bright sunny beach to see the background seamlessly transition to match the mood.
4.  **Adjust Settings:** Open the Control Panel on the left to experiment with different fonts, tweak the animation intensity, or adjust the accessibility (WCAG) strictness.

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (Node Package Manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Copy the `.env.example` file to a new file named `.env`.
    *   Add your Google Gemini API key to the `.env` file:
        ```env
        GEMINI_API_KEY=your_api_key_here
        ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://localhost:3000` in your browser to start chatting!

## 🛠️ Technologies Used

*   **React** (with Vite)
*   **Tailwind CSS** (for styling)
*   **Framer Motion** (for smooth transitions and animations)
*   **Google GenAI SDK** (`@google/genai`)
*   **Lucide React** (for iconography)
