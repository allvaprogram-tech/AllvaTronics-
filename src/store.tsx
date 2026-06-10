import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SchemaElement, ToolType, Point, WireEntity, ComponentEntity, PcbElement, TraceEntity, PcbComponentEntity, PcbBoardEntity, EditorMode, PcbToolType, AnyElement } from './types';
import { v4 as uuidv4 } from 'uuid';

type AddElementPayload = Omit<WireEntity, 'id'> | Omit<ComponentEntity, 'id'> | Omit<TraceEntity, 'id'> | Omit<PcbComponentEntity, 'id'> | Omit<PcbBoardEntity, 'id'>;

interface EditorContextType {
  mode: EditorMode;
  setMode: (m: EditorMode) => void;
  elements: SchemaElement[];
  setElements: React.Dispatch<React.SetStateAction<SchemaElement[]>>;
  pcbElements: PcbElement[];
  setPcbElements: React.Dispatch<React.SetStateAction<PcbElement[]>>;
  activePcbLayer: 'top' | 'bottom';
  setActivePcbLayer: (layer: 'top' | 'bottom') => void;
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  pcbTool: PcbToolType;
  setPcbTool: (tool: PcbToolType) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pan: Point;
  setPan: (p: Point) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  addElement: (el: AddElementPayload) => void;
  updateElement: (id: string, updates: Partial<AnyElement>) => void;
  updateElements: (updates: {id: string, updates: Partial<AnyElement>}[]) => void;
  removeElement: (id: string) => void;
  clearElements: () => void;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  boardTheme: 'dark' | 'light';
  setBoardTheme: (theme: 'dark' | 'light') => void;
  isSimulating: boolean;
  setIsSimulating: (s: boolean) => void;
  activeWireColor: string;
  setActiveWireColor: (c: string) => void;
  is3DView: boolean;
  setIs3DView: (s: boolean) => void;
  code: string;
  setCode: (c: string) => void;
  isCodePanelOpen: boolean;
  setIsCodePanelOpen: (s: boolean) => void;
  undo: () => void;
  takeSnapshot: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EditorMode>('schematic');
  const [elements, setElements] = useState<SchemaElement[]>([]);
  const [pcbElements, setPcbElements] = useState<PcbElement[]>([]);
  const [activePcbLayer, setActivePcbLayer] = useState<'top' | 'bottom'>('top');
  const [tool, setTool] = useState<ToolType>('select');
  const [pcbTool, setPcbTool] = useState<PcbToolType>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [boardTheme, setBoardTheme] = useState<'dark' | 'light'>('dark');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeWireColor, setActiveWireColor] = useState<string>('#bcc2c2');
  const [is3DView, setIs3DView] = useState(false);
  const [code, setCode] = useState('// Write your C++ code here for microcontrollers...\nvoid setup() {\n  \n}\n\nvoid loop() {\n  \n}\n');
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);

  const [history, setHistory] = useState<{ elements: SchemaElement[], pcbElements: PcbElement[] }[]>([]);
  
  const takeSnapshot = () => {
    setHistory(prev => [...prev, { elements, pcbElements }]);
  };

  const undo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setHistory(prev => prev.slice(0, prev.length - 1));
      setElements(lastState.elements);
      setPcbElements(lastState.pcbElements);
      setSelectedIds([]);
    }
  };

  const addElement = (el: AddElementPayload) => {
    takeSnapshot();
    const id = uuidv4();
    if (el.type === 'wire') {
      setElements(prev => [...prev, { ...el, id } as WireEntity]);
    } else if (el.type === 'component') {
      setElements(prev => [...prev, { ...el, id } as ComponentEntity]);
      setTool('select');
    } else if (el.type === 'trace') {
      setPcbElements(prev => [...prev, { ...el, id } as TraceEntity]);
    } else if (el.type === 'pcb_component') {
      setPcbElements(prev => [...prev, { ...el, id } as PcbComponentEntity]);
      setPcbTool('select');
    } else if (el.type === 'board') {
      setPcbElements(prev => [...prev, { ...el, id } as PcbBoardEntity]);
      setPcbTool('select');
    }
  };

  const updateElement = (id: string, updates: Partial<AnyElement>) => {
    takeSnapshot();
    if (mode === 'schematic') {
      setElements(prev =>
        prev.map(el => (el.id === id ? ({ ...el, ...updates } as SchemaElement) : el))
      );
    } else {
      setPcbElements(prev =>
        prev.map(el => (el.id === id ? ({ ...el, ...updates } as PcbElement) : el))
      );
    }
  };

  const updateElements = (updateList: {id: string, updates: Partial<AnyElement>}[]) => {
    takeSnapshot();
    if (mode === 'schematic') {
      setElements(prev =>
        prev.map(el => {
          const u = updateList.find(ul => ul.id === el.id);
          return u ? ({ ...el, ...u.updates } as SchemaElement) : el;
        })
      );
    } else {
      setPcbElements(prev =>
        prev.map(el => {
          const u = updateList.find(ul => ul.id === el.id);
          return u ? ({ ...el, ...u.updates } as PcbElement) : el;
        })
      );
    }
  };

  const removeElement = (id: string) => {
    takeSnapshot();
    if (mode === 'schematic') {
      setElements(prev => prev.filter(el => el.id !== id));
    } else {
      setPcbElements(prev => prev.filter(el => el.id !== id));
    }
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const clearElements = () => {
    takeSnapshot();
    if (mode === 'schematic') {
      setElements([]);
    } else {
      setPcbElements([]);
    }
    setSelectedIds([]);
  };

  return (
    <EditorContext.Provider
      value={{
        mode, setMode,
        elements, setElements,
        pcbElements, setPcbElements,
        activePcbLayer, setActivePcbLayer,
        tool, setTool,
        pcbTool, setPcbTool,
        zoom, setZoom,
        pan, setPan,
        selectedIds, setSelectedIds,
        addElement, updateElement, updateElements, removeElement, clearElements,
        currentProjectId, setCurrentProjectId,
        boardTheme, setBoardTheme,
        isSimulating, setIsSimulating,
        activeWireColor, setActiveWireColor,
        is3DView, setIs3DView,
        code, setCode,
        isCodePanelOpen, setIsCodePanelOpen,
        undo, takeSnapshot
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
