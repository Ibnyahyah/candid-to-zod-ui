import { Github } from 'lucide-react';
import ZodGeneratorComponent from './ZodGeneratorComponent';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="header">
        <h1>Candid to Zod Generator</h1>
        <p>Generate robust TypeScript schemas directly from your Internet Computer Canister definitions.</p>
      </div>

      <ZodGeneratorComponent />

      {/* Footer */}
      <footer className="footer">
        <p>Built by <a href="https://github.com/Ibnyahyah" target="_blank" rel="noopener noreferrer">Ibnyahyah</a></p>
        <a href="https://github.com/Ibnyahyah" target="_blank" rel="noopener noreferrer" className="github-link">
          <Github size={20} />
        </a>
      </footer>
    </div>
  );
}

export default App;
