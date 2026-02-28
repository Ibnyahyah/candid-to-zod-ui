import { useState } from 'react';
import { Code2, ArrowRight, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
// @ts-ignore
import { generateZod } from 'candid-to-zod/dist/generator';
import * as ts from 'typescript';
import './ZodGenerator.css';

export default function ZodGeneratorComponent() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setError(null);
    setOutputCode('');
    
    if (!inputCode.trim()) {
      setError("Please paste a .did.js file content first.");
      return;
    }

    try {
      // 1. Transpile the user's TypeScript or JavaScript string natively
      // This strips ALL types (`: typeof IDL`, interfaces) and converts imports/exports to CommonJS
      const jsCode = ts.transpileModule(inputCode, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
      }).outputText;

      // 2. Mock a CommonJS environment to evaluate the transpiled function safely
      const mockExports: any = {};
      const mockRequire = () => {
         return { IDL: undefined }; // Mocks imports like @dfinity/candid
      };
      
      // new Function securely creates an isolated execution scope
      const factoryEvaluator = new Function('exports', 'require', jsCode);
      factoryEvaluator(mockExports, mockRequire);
      
      let factoryFn = mockExports.idlFactory;
      
      // If dfx generated a uniquely named export (e.g. `export const socio_mainIdlFactory`)
      if (!factoryFn) {
        for (const key in mockExports) {
          if (key.endsWith('IdlFactory') && typeof mockExports[key] === 'function') {
             factoryFn = mockExports[key];
             break;
          }
        }
      }
      
      if (typeof factoryFn !== 'function') {
         throw new Error("Could not find a valid '*IdlFactory' function in the provided code.");
      }

      // 3. Pass to our core engine!
      const generatedSchema = generateZod(factoryFn, { inferTypes: true });
      setOutputCode(generatedSchema);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse Candid structure. Ensure you pasted a valid .did.js file.");
    }
  };

  const copyToClipboard = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="generator-container">
      <div className="generator-header">
         <h2>Candid {'->'} Zod Generator</h2>
         <p>Paste the contents of your Dfinity generated <code>.did.js</code> file below</p>
      </div>

      <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          🚀 <strong>Did you know?</strong> This generator is available as an NPM library for your CI/CD! 
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Run <code>npm install -D candid-to-zod</code> to use the CLI directly in your project.
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', marginTop: '0.5rem' }}>
          💖 <a href="http://socio.kim/donate" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 500 }}>Support this project</a>
        </p>
      </div>
      
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="editor-panes">
        {/* Left Pane - Input */}
        <div className="pane">
          <div className="pane-header">
            <Code2 size={16} />
            <span>example.did.js</span>
          </div>
          <textarea 
            className="code-editor"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={"export const idlFactory = ({ IDL }) => {\n  return IDL.Service({\n    'getUser': IDL.Func([IDL.Principal], [UserRecord], ['query'])\n  });\n};\nexport const init = ({ IDL }) => { return []; };"}
            spellCheck={false}
          />
        </div>

        {/* Action Column */}
        <div className="action-column">
          <button className="generate-btn" onClick={handleGenerate}>
            Generate
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Right Pane - Output */}
        <div className="pane">
          <div className="pane-header">
            <Code2 size={16} className="text-blue-400" />
            <span>schema.ts</span>
            {outputCode && (
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            )}
          </div>
          <textarea 
            className="code-editor output-editor"
            value={outputCode}
            readOnly
            placeholder="// Zod schemas will appear here"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="instructions-section">
        <h3>Why do I need this?</h3>
        <p>
          The standard TypeScript definitions generated by <code>dfx</code> only provide static compile-time checking. They <strong>do not</strong> protect your application from runtime crashes or unexpected data structures sent from the blockchain.
        </p>
        <p>
          Zod guarantees <strong>end-to-end type safety</strong> across the IC boundary by strictly validating incoming canister data at runtime. If the data from the internet computer doesn't perfectly match your Candid interface, Zod will catch it before it enters your application state!
        </p>

        <h3 style={{ marginTop: '2rem' }}>How to use generated Zod schemas?</h3>
        <p>Zod is a TypeScript-first schema declaration and validation library. It allows you to strictly validate data coming from your canister, ensuring runtime type safety.</p>
        
        <div className="instruction-step">
          <h4>1. Install Dependencies</h4>
          <code>npm install zod @dfinity/principal</code>
        </div>
        
        <div className="instruction-step">
          <h4>2. Validate Incoming Data</h4>
          <pre><code>{`import { getUserRetSchema } from './schema';

// When calling your canister, validate the response:
const response = await actor.getUser(principal);

// Ensures the response exactly matches your Candid types:
const safeData = getUserRetSchema.parse(response);

// Now safeData is structurally verified and inferred!
console.log(safeData.name);`}</code></pre>
        </div>
      </div>
    </div>
  );
}
