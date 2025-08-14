# AI Learning Portal

A modern learning management system built with React and TypeScript that integrates with multiple AI providers (Ollama, OpenAI, Gemini) to enhance your learning experience.

## Features

- 📚 **Course Management**: Browse and track progress across multiple courses
- 🤖 **AI Integration**: Get explanations and answers using Ollama, OpenAI, or Gemini
- 📊 **Progress Tracking**: Monitor completion status for each topic and course
- 💾 **Local Storage**: All data persists in your browser's local storage
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔄 **Data Export/Import**: Backup and restore your learning progress
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- For Ollama: Install [Ollama](https://ollama.ai) locally
- For OpenAI: API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- For Gemini: API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with static files ready for deployment to GitHub Pages or any static hosting service.

## Usage

### Setting up LLM Providers

1. Go to **Settings** in the navigation
2. Choose your preferred LLM provider:
   - **Ollama**: Requires local installation and model download
   - **OpenAI**: Requires API key
   - **Gemini**: Requires API key
3. Configure the necessary settings and test the connection

### Learning Flow

1. Browse available courses from the main dashboard
2. Select a course to view its daily schedule
3. Click on any topic to dive deeper
4. Ask AI questions about the topic
5. Mark topics as complete when finished
6. Track your overall progress

### Data Management

- **Export**: Download your progress and settings as JSON
- **Import**: Restore from a previously exported file
- **Clear**: Reset all data (use with caution)

## Course Structure

Courses are defined in JSON files:

```
public/
├── courses/
│   ├── courses.json          # Course catalog
│   └── [course-id]/
│       └── content.json      # Course schedule and topics
```

### Adding New Courses

1. Add course metadata to `public/courses/courses.json`
2. Create course content at the specified path
3. Follow the existing JSON structure for consistency

## Deployment to GitHub Pages

1. Build the project: `npm run build`
2. Deploy the `dist` folder to GitHub Pages
3. Ensure the repository settings point to the correct branch/folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details