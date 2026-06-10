import { useState, useEffect } from 'react';
import { EditorProvider, useEditor } from './store';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CanvasEditor } from './components/CanvasEditor';
import { CanvasViewer3D } from './components/CanvasViewer3D';
import { RealTimeOscilloscope } from './components/RealTimeOscilloscope';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dashboard } from './components/Dashboard';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function EditorLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [inEditor, setInEditor] = useState(false);
  
  const { is3DView, isCodePanelOpen, code, setCode, elements, pcbElements } = useEditor();

  const hasMCU = [...elements, ...pcbElements].some((e) => e.type === 'component' && ['arduino_uno', 'esp32', 'esp32_cam', 'raspberry_pi'].includes((e as any).componentType));

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (auth && auth.isDummy) {
          // Dummy auth
          unsubscribe = (auth as any).onAuthStateChanged((user: any) => {
            if (!(window as any).guestAuthBypass) {
              setIsAuthenticated(!!user);
            }
          });
      } else {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!(window as any).guestAuthBypass) {
            setIsAuthenticated(!!user);
          }
        });
      }
    } catch (e) {
       console.warn("Auth state error", e);
       setIsAuthenticated(false);
    }
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="fixed inset-0 bg-[#0f0f13] flex items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <WelcomeScreen onComplete={() => {
      (window as any).guestAuthBypass = true;
      setIsAuthenticated(true);
    }} />;
  }

  if (!inEditor) {
    return <Dashboard onLaunchEditor={() => setInEditor(true)} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0f0f13] text-white font-sans overflow-hidden relative">
      <Toolbar 
        toggleLeft={() => setShowProperties(!showProperties)} 
        toggleRight={() => setShowSidebar(!showSidebar)} 
        onExit={() => setInEditor(false)}
      />
      <div className="flex flex-1 overflow-hidden relative w-full h-full">
        {/* Mobile Overlays */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300 md:hidden ${showSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setShowSidebar(false)}
        />
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300 md:hidden ${showProperties ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setShowProperties(false)}
        />

        {/* Properties Panel (Left) */}
        <div className={`absolute md:relative z-30 h-full transition-transform duration-300 md:translate-x-0 ${showProperties ? 'translate-x-0' : '-translate-x-full'}`}>
          <PropertiesPanel />
        </div>
        
        {/* Center Area Container */}
        <div className="flex-1 h-full relative overflow-hidden flex bg-[#0f0f13]">
          
          {/* Main 2D Canvas OR 3D Canvas */}
          <div className="flex-1 relative flex flex-col min-w-0">
             {is3DView ? <CanvasViewer3D /> : <CanvasEditor />}
             <RealTimeOscilloscope />
          </div>

          {/* C++ Code Editor Panel */}
          {isCodePanelOpen && hasMCU && (
            <div className="w-1/3 md:w-96 min-w-[300px] h-full border-l border-[#2d2d33] bg-[#16161a] flex flex-col z-10 shrink-0">
              <div className="h-10 border-b border-[#2d2d33] flex items-center px-4 shrink-0 bg-[#121215]">
                <h3 className="text-sm font-semibold text-gray-300">C++ Microcontroller Code</h3>
              </div>
              <div className="flex-1 relative">
                <textarea
                  className="w-full h-full bg-transparent text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
                  placeholder="void setup() { ... }"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
          )}

        </div>
        
        {/* Sidebar (Right) */}
        <div className={`absolute right-0 md:relative z-30 h-full transition-transform duration-300 md:translate-x-0 ${showSidebar ? 'translate-x-0' : 'translate-x-[100%]'}`}>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}

