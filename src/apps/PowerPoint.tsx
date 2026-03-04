import React, { useState, useEffect, useRef } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useFileSystemStore } from '../store/useFileSystemStore';
import { 
  Play, Plus, Square, Circle, Triangle, Image as ImageIcon, Type, Save, X, 
  ChevronLeft, ChevronRight, LayoutTemplate, Monitor, FilePlus, FolderOpen, 
  Printer, LogOut, Download, Clipboard, Scissors, Copy, Undo, Redo, 
  Box, MousePointer, PaintBucket, Type as TypeIcon, Presentation
} from 'lucide-react';
import { clsx } from 'clsx';

interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'icon';
  content: string; // Text content or shape type/color or icon name
  src?: string; // For images
  x: number;
  y: number;
  width: number;
  height: number;
  style?: React.CSSProperties;
}

interface Slide {
  id: string;
  layout: 'title' | 'content';
  title: string;
  elements: SlideElement[];
}

export const PowerPoint: React.FC<{ windowId: string }> = ({ windowId }) => {
  const { windows, updateWindow, closeWindow, addNotification } = useOSStore();
  const appWindow = windows.find(w => w.id === windowId);
  const fileId = appWindow?.data?.fileId;

  const { getItem, updateFileContent, createItem, getChildren } = useFileSystemStore();

  // State
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', layout: 'title', title: 'Click to add title', elements: [] }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [fileName, setFileName] = useState('Presentation1.pptx');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'File' | 'Home' | 'Insert' | 'Slide Show'>('Home');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Dialog States
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [currentSavePath, setCurrentSavePath] = useState<string | null>('desktop');

  const stockImages = [
    'https://picsum.photos/seed/nature/300/200',
    'https://picsum.photos/seed/tech/300/200',
    'https://picsum.photos/seed/people/300/200',
    'https://picsum.photos/seed/arch/300/200',
    'https://picsum.photos/seed/art/300/200',
  ];

  useEffect(() => {
    if (fileId) {
      const item = getItem(fileId);
      if (item && item.content) {
        try {
          const data = JSON.parse(item.content);
          setSlides(data.slides || []);
          setFileName(item.name);
        } catch (e) {
          console.error("Failed to parse PPTX content", e);
        }
      }
    }
  }, [fileId, getItem]);

  // --- File Operations ---

  const handleNew = () => {
    setSlides([{ id: Date.now().toString(), layout: 'title', title: 'Click to add title', elements: [] }]);
    setCurrentSlideIndex(0);
    setFileName('Presentation1.pptx');
    updateWindow(windowId, { title: 'Presentation1.pptx', data: { ...appWindow?.data, fileId: undefined } });
    setActiveTab('Home');
  };

  const handleOpen = (id: string) => {
    const item = getItem(id);
    if (item && item.content) {
      try {
        const data = JSON.parse(item.content);
        setSlides(data.slides || []);
        setFileName(item.name);
        setCurrentSlideIndex(0);
        updateWindow(windowId, { title: item.name, data: { ...appWindow?.data, fileId: id } });
        setIsOpenDialogOpen(false);
        setActiveTab('Home');
      } catch (e) {
        console.error("Failed to parse PPTX content", e);
      }
    }
  };

  const handleSave = () => {
    if (fileId) {
      const content = JSON.stringify({ slides });
      updateFileContent(fileId, content);
      addNotification('PowerPoint', 'Presentation saved.');
    } else {
      setSaveAsName(fileName);
      setIsSaveAsOpen(true);
    }
  };

  const handleSaveAsConfirm = () => {
    if (saveAsName.trim() && currentSavePath) {
      const name = saveAsName.trim().endsWith('.pptx') ? saveAsName.trim() : `${saveAsName.trim()}.pptx`;
      const content = JSON.stringify({ slides });
      const newFileId = createItem(currentSavePath, name, 'file', content);
      
      addNotification('PowerPoint', `Saved as ${name}.`);
      setIsSaveAsOpen(false);
      
      updateWindow(windowId, { 
        title: name,
        data: { ...appWindow?.data, fileId: newFileId }
      });
      setFileName(name);
      setActiveTab('Home');
    }
  };

  const handlePrint = () => {
    window.print();
    setActiveTab('Home');
  };

  const handleExport = () => {
    addNotification('PowerPoint', 'Exporting to PDF... (Simulation)');
    setTimeout(() => addNotification('PowerPoint', 'Export Complete: Presentation.pdf'), 1500);
    setActiveTab('Home');
  };

  const handleClose = () => {
    closeWindow(windowId);
  };

  // --- Slide Operations ---

  const addSlide = (layout: 'title' | 'content' = 'content') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      layout,
      title: layout === 'title' ? 'Click to add title' : 'Click to add title',
      elements: []
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const updateSlideTitle = (title: string) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex].title = title;
    setSlides(newSlides);
  };

  // --- Element Operations ---

  const addElement = (type: SlideElement['type'], content: string, src?: string, width?: number, height?: number) => {
    const newElement: SlideElement = {
      id: Date.now().toString(),
      type,
      content,
      src,
      x: 100,
      y: 100,
      width: width || (type === 'text' ? 300 : 150),
      height: height || (type === 'text' ? 50 : 150),
      style: type === 'shape' ? { backgroundColor: '#3b82f6' } : undefined
    };
    const newSlides = [...slides];
    newSlides[currentSlideIndex].elements.push(newElement);
    setSlides(newSlides);
  };

  const handleInsertImage = (url: string) => {
    // Create an image to get dimensions
    const img = new Image();
    img.onload = () => {
      // Calculate aspect ratio and fit within a reasonable box (e.g., 400x400)
      const maxWidth = 400;
      const maxHeight = 400;
      let w = img.width;
      let h = img.height;
      
      if (w > maxWidth || h > maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w *= ratio;
        h *= ratio;
      }
      
      addElement('image', 'image', url, w, h);
      addNotification('PowerPoint', 'Image inserted successfully.');
    };
    img.src = url;
    setIsImageDialogOpen(false);
    setActiveTab('Home');
  };

  // --- Presentation Mode ---

  const startPresentation = (fromBeginning: boolean = false) => {
    if (fromBeginning) setCurrentSlideIndex(0);
    setIsPresenting(true);
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      setIsPresenting(false); // End show
      setCurrentSlideIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Keyboard navigation for presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setIsPresenting(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, currentSlideIndex, slides.length]);

  // Task Verification (Sample)
  const checkTask = () => {
    // Task: 2 slides, first slide title 'Giới thiệu về bản thân'
    const has2Slides = slides.length >= 2;
    const firstSlideTitle = slides[0].title.toLowerCase();
    const hasCorrectTitle = firstSlideTitle.includes('giới thiệu về bản thân');

    if (has2Slides && hasCorrectTitle) {
      addNotification('Task Assistant', 'Great job! You created the presentation correctly.');
    } else {
      addNotification('Task Assistant', 'Task incomplete. Need 2 slides and correct title on first slide.');
    }
  };

  // --- Render Helpers ---

  const RibbonButton = ({ icon: Icon, label, onClick, active, disabled }: any) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex flex-col items-center justify-center px-2 py-1 h-full min-w-[50px] gap-1 rounded hover:bg-gray-100 transition-colors",
        active && "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon size={20} className={clsx("mb-0.5", active ? "text-[#d24726]" : "text-gray-700")} />
      <span className="text-[10px] text-gray-600 font-medium leading-tight text-center">{label}</span>
    </button>
  );

  const RibbonGroup = ({ label, children }: any) => (
    <div className="flex items-center px-2 border-r border-gray-300 h-full relative group">
      <div className="flex gap-1 h-full pb-4">
        {children}
      </div>
      <div className="absolute bottom-0.5 left-0 w-full text-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  if (isPresenting) {
    const slide = slides[currentSlideIndex];
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center text-white cursor-none" onClick={nextSlide}>
        <div className="w-[80%] h-[80%] bg-white text-black relative p-10 flex flex-col items-center justify-center select-none">
          <h1 className="text-6xl font-bold mb-8 text-center">{slide.title}</h1>
          <div className="flex gap-4">
            {slide.elements.map(el => (
              <div 
                key={el.id}
                style={{ 
                  width: el.width * 2, 
                  height: el.height * 2, 
                  backgroundColor: el.style?.backgroundColor,
                  ...el.style 
                }}
                className="flex items-center justify-center relative"
              >
                {el.type === 'shape' && el.content === 'square' && <div className="w-full h-full bg-blue-500" />}
                {el.type === 'shape' && el.content === 'circle' && <div className="w-full h-full bg-red-500 rounded-full" />}
                {el.type === 'image' && el.src && <img src={el.src} className="w-full h-full object-contain" alt="slide content" />}
                {el.type === 'text' && <div className="text-2xl">{el.content}</div>}
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
            Slide {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#f3f3f3] relative font-sans">
      
      {/* File Menu Overlay */}
      {activeTab === 'File' && (
        <div className="absolute inset-0 z-50 flex">
          <div className="w-64 bg-[#d24726] text-white flex flex-col py-4 gap-1">
            <button onClick={() => setActiveTab('Home')} className="p-4 hover:bg-[#b03a1e] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"><ChevronLeft size={16} /></div>
              <span className="font-bold">Back</span>
            </button>
            <div className="h-px bg-white/20 my-2 mx-4" />
            <button onClick={handleNew} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><FilePlus size={20} /> New</button>
            <button onClick={() => setIsOpenDialogOpen(true)} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><FolderOpen size={20} /> Open</button>
            <button onClick={handleSave} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><Save size={20} /> Save</button>
            <button onClick={() => { setSaveAsName(fileName); setIsSaveAsOpen(true); }} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><Save size={20} /> Save As</button>
            <button onClick={handlePrint} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><Printer size={20} /> Print</button>
            <button onClick={handleExport} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><Download size={20} /> Export</button>
            <div className="flex-1" />
            <button onClick={handleClose} className="px-6 py-3 text-left hover:bg-[#b03a1e] flex items-center gap-3"><LogOut size={20} /> Close</button>
          </div>
          <div className="flex-1 bg-gray-100 p-12">
            <h1 className="text-4xl font-light text-gray-600 mb-8">Good morning</h1>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={handleNew} className="bg-white p-6 shadow hover:shadow-md transition-shadow flex flex-col items-center gap-4 h-48 justify-center">
                <div className="w-16 h-20 border border-gray-200 bg-white relative">
                  <div className="absolute top-0 right-0 w-4 h-4 bg-gray-100 border-b border-l border-gray-200" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 bg-[#d24726] rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
                </div>
                <span className="font-medium">Blank Presentation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {isSaveAsOpen && (
        <div className="absolute inset-0 bg-black/20 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 w-96">
            <h3 className="font-semibold mb-4">Save Presentation</h3>
            <input 
              value={saveAsName}
              onChange={e => setSaveAsName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Presentation.pptx"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsSaveAsOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveAsConfirm} className="px-4 py-2 bg-[#d24726] text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {isOpenDialogOpen && (
        <div className="absolute inset-0 bg-black/20 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 w-[500px] max-h-[80vh] flex flex-col">
            <h3 className="font-semibold mb-4">Open Presentation</h3>
            <div className="flex-1 overflow-y-auto border rounded mb-4 p-2">
              {getChildren('desktop').filter(f => f.name.endsWith('.pptx')).map(file => (
                <div 
                  key={file.id} 
                  onClick={() => handleOpen(file.id)}
                  className="flex items-center gap-2 p-2 hover:bg-orange-50 cursor-pointer rounded"
                >
                  <Presentation className="text-[#d24726]" size={20} />
                  <span>{file.name}</span>
                </div>
              ))}
              {getChildren('desktop').filter(f => f.name.endsWith('.pptx')).length === 0 && (
                <div className="text-gray-400 text-center py-4">No PowerPoint presentations found on Desktop</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpenDialogOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isImageDialogOpen && (
        <div className="absolute inset-0 bg-black/20 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 w-[600px] max-h-[80vh] flex flex-col">
            <h3 className="font-semibold mb-4">Insert Picture</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {stockImages.map((url, index) => (
                <div 
                  key={index} 
                  onClick={() => handleInsertImage(url)}
                  className="cursor-pointer border rounded hover:border-orange-500 hover:shadow-md transition-all group relative"
                >
                  <img src={url} alt={`Stock ${index + 1}`} className="w-full h-32 object-cover rounded" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsImageDialogOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div className="bg-[#d24726] text-white h-8 flex items-center px-2 text-xs select-none justify-between">
        <div className="flex items-center gap-2">
          <Save size={14} className="cursor-pointer hover:opacity-80" onClick={handleSave} />
          <Undo size={14} className="cursor-pointer hover:opacity-80" />
          <Redo size={14} className="cursor-pointer hover:opacity-80" />
          <div className="w-px h-4 bg-white/30 mx-1" />
          <span className="font-medium">AutoSave On</span>
        </div>
        <span className="font-semibold opacity-90">{fileName} - PowerPoint</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">User</div>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div className="bg-[#d24726] text-white flex px-2 text-sm gap-1 pt-1">
        <button 
          onClick={() => setActiveTab('File')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'File' && "bg-white text-[#d24726] font-medium")}
        >
          File
        </button>
        <button 
          onClick={() => setActiveTab('Home')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'Home' && "bg-white text-[#d24726] font-medium")}
        >
          Home
        </button>
        <button 
          onClick={() => setActiveTab('Insert')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'Insert' && "bg-white text-[#d24726] font-medium")}
        >
          Insert
        </button>
        <button 
          onClick={() => setActiveTab('Slide Show')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'Slide Show' && "bg-white text-[#d24726] font-medium")}
        >
          Slide Show
        </button>
      </div>

      {/* Ribbon Toolbar */}
      <div className="bg-white border-b border-gray-300 h-28 flex shadow-sm overflow-x-auto">
        
        {activeTab === 'Home' && (
          <>
            <RibbonGroup label="Clipboard">
              <RibbonButton 
                icon={Clipboard} 
                label="Paste" 
                onClick={() => {
                  navigator.clipboard.readText()
                    .then(t => {
                      if (t) addElement('text', t);
                    })
                    .catch(err => {
                      console.error('Failed to read clipboard:', err);
                      addNotification('PowerPoint', 'Please use Ctrl+V (or Cmd+V) to paste.');
                    });
                }}
              />
              <div className="flex flex-col justify-center gap-1">
                <button className="flex items-center gap-1 px-1 hover:bg-gray-100 rounded text-xs"><Scissors size={14} /> Cut</button>
                <button className="flex items-center gap-1 px-1 hover:bg-gray-100 rounded text-xs"><Copy size={14} /> Copy</button>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Slides">
              <RibbonButton icon={Plus} label="New Slide" onClick={() => addSlide('content')} />
              <RibbonButton icon={LayoutTemplate} label="Layout" />
            </RibbonGroup>

            <RibbonGroup label="Font">
               <div className="flex flex-col gap-1 p-1">
                <div className="flex gap-1">
                  <select className="h-6 border border-gray-300 rounded text-xs w-28"><option>Arial</option></select>
                  <select className="h-6 border border-gray-300 rounded text-xs w-12"><option>18</option></select>
                </div>
                <div className="flex gap-0.5">
                  <button className="p-1 rounded hover:bg-gray-200"><TypeIcon size={16} /></button>
                  <button className="p-1 rounded hover:bg-gray-200 font-bold">B</button>
                  <button className="p-1 rounded hover:bg-gray-200 italic">I</button>
                  <button className="p-1 rounded hover:bg-gray-200 underline">U</button>
                </div>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Drawing">
              <div className="grid grid-cols-3 gap-1 p-1">
                <button onClick={() => addElement('shape', 'square')} className="p-1 hover:bg-gray-200 rounded"><Square size={16} /></button>
                <button onClick={() => addElement('shape', 'circle')} className="p-1 hover:bg-gray-200 rounded"><Circle size={16} /></button>
                <button onClick={() => addElement('shape', 'triangle')} className="p-1 hover:bg-gray-200 rounded"><Triangle size={16} /></button>
              </div>
            </RibbonGroup>
          </>
        )}

        {activeTab === 'Insert' && (
          <>
            <RibbonGroup label="Slides">
              <RibbonButton icon={Plus} label="New Slide" onClick={() => addSlide('content')} />
            </RibbonGroup>

            <RibbonGroup label="Images">
              <RibbonButton icon={ImageIcon} label="Pictures" onClick={() => setIsImageDialogOpen(true)} />
            </RibbonGroup>

            <RibbonGroup label="Illustrations">
              <RibbonButton icon={Square} label="Shapes" onClick={() => addElement('shape', 'square')} />
              <RibbonButton icon={Box} label="Icons" onClick={() => addElement('icon', 'star')} />
            </RibbonGroup>

            <RibbonGroup label="Text">
              <RibbonButton icon={Box} label="Text Box" onClick={() => addElement('text', 'Text Box')} />
            </RibbonGroup>
          </>
        )}

        {activeTab === 'Slide Show' && (
          <>
            <RibbonGroup label="Start Slide Show">
              <RibbonButton icon={Play} label="From Beginning" onClick={() => startPresentation(true)} />
              <RibbonButton icon={Play} label="From Current Slide" onClick={() => startPresentation(false)} />
            </RibbonGroup>
          </>
        )}

        <div className="flex-1" />
        <div className="flex items-center px-4">
          <button onClick={checkTask} className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded border border-green-200 hover:bg-green-200 font-medium">
            Check Task
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Thumbnails */}
        <div className="w-48 bg-gray-100 border-r border-gray-300 overflow-y-auto p-4 flex flex-col gap-4">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={clsx(
                "aspect-video bg-white shadow-sm border-2 rounded cursor-pointer relative flex items-center justify-center text-[8px] overflow-hidden select-none transition-all",
                currentSlideIndex === idx ? "border-[#d24726]" : "border-transparent hover:border-gray-300"
              )}
            >
              <span className="absolute top-1 left-1 text-gray-400 font-bold">{idx + 1}</span>
              <div className="scale-[0.2] origin-center w-full text-center">
                {slide.title || "Untitled Slide"}
              </div>
            </div>
          ))}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-gray-200 p-8 flex items-center justify-center overflow-auto">
          <div className="aspect-video w-full max-w-4xl bg-white shadow-xl flex flex-col p-12 relative">
            {/* Title Area */}
            <div className="mb-8 border border-dashed border-transparent hover:border-gray-300 p-2 rounded">
              <input 
                value={slides[currentSlideIndex].title}
                onChange={(e) => updateSlideTitle(e.target.value)}
                className="w-full text-4xl font-bold text-center outline-none bg-transparent placeholder-gray-300"
                placeholder="Click to add title"
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 border border-dashed border-transparent hover:border-gray-300 p-4 rounded relative">
              {slides[currentSlideIndex].layout === 'content' ? (
                <textarea 
                  className="w-full h-full resize-none outline-none text-xl bg-transparent placeholder-gray-300"
                  placeholder="Click to add text"
                />
              ) : (
                <div className="text-center text-gray-300 mt-10">Subtitle Area</div>
              )}

              {/* Elements Layer */}
              {slides[currentSlideIndex].elements.map(el => (
                <div 
                  key={el.id}
                  style={{ 
                    position: 'absolute', 
                    left: el.x, 
                    top: el.y, 
                    width: el.width, 
                    height: el.height, 
                    backgroundColor: el.style?.backgroundColor 
                  }}
                  className="cursor-move shadow-sm group"
                  onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                >
                  {el.type === 'shape' && el.content === 'square' && <div className="w-full h-full bg-blue-500" />}
                  {el.type === 'shape' && el.content === 'circle' && <div className="w-full h-full bg-red-500 rounded-full" />}
                  {el.type === 'shape' && el.content === 'triangle' && <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[100px] border-b-green-500" />}
                  {el.type === 'image' && el.src && <img src={el.src} className="w-full h-full object-contain pointer-events-none" alt="slide element" />}
                  {el.type === 'text' && (
                    <div 
                      contentEditable 
                      className="w-full h-full p-2 outline-none bg-white/50 border border-gray-300"
                      suppressContentEditableWarning
                    >
                      {el.content}
                    </div>
                  )}
                  {el.type === 'icon' && <div className="w-full h-full flex items-center justify-center text-6xl">⭐</div>}
                  
                  {/* Selection Indicator */}
                  {selectedElementId === el.id && (
                    <div className="absolute inset-0 border-2 border-[#d24726] pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-[#d24726] text-white flex items-center px-2 text-xs gap-4 select-none">
        <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
        <span>English (US)</span>
        <div className="flex-1" />
        <span>Notes</span>
        <span>Comments</span>
        <span>100%</span>
      </div>
    </div>
  );
};
