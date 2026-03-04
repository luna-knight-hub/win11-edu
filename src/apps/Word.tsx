import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '../store/useFileSystemStore';
import { useOSStore } from '../store/useOSStore';
import { 
  Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Palette, X, Minus, Square, FileText, Image as ImageIcon, 
  Box, MousePointer, Printer, FilePlus, FolderOpen, LogOut, Download,
  Scissors, Copy, Clipboard, Undo, Redo, List, ListOrdered,
  Heading1, Heading2, Pilcrow, Search, Highlighter, Strikethrough,
  Subscript, Superscript, AlignJustify, Folder, Crop, Move, Maximize, Circle, Layout
} from 'lucide-react';
import { clsx } from 'clsx';

export const Word: React.FC<{ windowId: string }> = ({ windowId }) => {
  const { windows, updateWindow, closeWindow, addNotification } = useOSStore();
  const appWindow = windows.find(w => w.id === windowId);
  const fileId = appWindow?.data?.fileId;

  const { getItem, updateFileContent, createItem, getChildren } = useFileSystemStore();
  
  const [content, setContent] = useState(''); // HTML content
  const [fileName, setFileName] = useState('Document1.docx');
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelection.current = range;
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // UI State
  const [activeTab, setActiveTab] = useState<'File' | 'Home' | 'Insert' | 'Picture Format'>('Home');
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [fontColor, setFontColor] = useState('#000000');
  const [selectedImageElement, setSelectedImageElement] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageDialogTab, setImageDialogTab] = useState<'Stock' | 'Device'>('Stock');
  const [currentBrowsePath, setCurrentBrowsePath] = useState<string | null>('root');
  const [saveAsName, setSaveAsName] = useState('');
  const [currentSavePath, setCurrentSavePath] = useState<string | null>('desktop');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const stockImages = [
    { url: 'https://picsum.photos/seed/nature/300/200', title: 'Nature', category: 'Nature' },
    { url: 'https://picsum.photos/seed/tech/300/200', title: 'Technology', category: 'Technology' },
    { url: 'https://picsum.photos/seed/people/300/200', title: 'People', category: 'People' },
    { url: 'https://picsum.photos/seed/arch/300/200', title: 'Architecture', category: 'Architecture' },
    { url: 'https://picsum.photos/seed/art/300/200', title: 'Art', category: 'Art' },
  ];

  useEffect(() => {
    if (fileId) {
      const item = getItem(fileId);
      if (item) {
        setContent(item.content || '');
        setFileName(item.name);
        if (editorRef.current) {
          editorRef.current.innerHTML = item.content || '';
        }
      }
    }
  }, [fileId, getItem]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    restoreSelection();
    document.execCommand(command, false, value);
    checkFormats();
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
    saveSelection();
  };

  const checkFormats = () => {
    const formats = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('strikeThrough')) formats.push('strikeThrough');
    if (document.queryCommandState('subscript')) formats.push('subscript');
    if (document.queryCommandState('superscript')) formats.push('superscript');
    if (document.queryCommandState('justifyLeft')) formats.push('justifyLeft');
    if (document.queryCommandState('justifyCenter')) formats.push('justifyCenter');
    if (document.queryCommandState('justifyRight')) formats.push('justifyRight');
    if (document.queryCommandState('justifyFull')) formats.push('justifyFull');
    if (document.queryCommandState('insertUnorderedList')) formats.push('insertUnorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.push('insertOrderedList');
    setActiveFormats(formats);
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setSelectedImageElement(img);
      setImageSize({ width: img.width, height: img.height });
      setActiveTab('Picture Format');
      
      // Visual feedback for selection (optional, but good for UX)
      // Remove outline from all other images first
      if (editorRef.current) {
        const images = editorRef.current.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
          images[i].style.outline = 'none';
          images[i].style.cursor = 'default';
        }
      }
      img.style.outline = '2px solid #2b579a';
      img.style.cursor = 'move';
    } else {
      // Deselect if clicking elsewhere
      if (selectedImageElement) {
        selectedImageElement.style.outline = 'none';
        selectedImageElement.style.cursor = 'default';
        setSelectedImageElement(null);
        if (activeTab === 'Picture Format') {
          setActiveTab('Home');
        }
      }
    }
    editorRef.current?.focus();
  };

  const handleImageContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      const img = target as HTMLImageElement;
      setSelectedImageElement(img);
      setImageSize({ width: img.width, height: img.height });
      setActiveTab('Picture Format');
      
      // Visual selection
      if (editorRef.current) {
        const images = editorRef.current.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
          images[i].style.outline = 'none';
        }
      }
      img.style.outline = '2px solid #2b579a';
      
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  // --- File Operations ---

  const handleNew = () => {
    setContent('');
    setFileName('Document1.docx');
    if (editorRef.current) editorRef.current.innerHTML = '';
    updateWindow(windowId, { title: 'Document1.docx', data: { ...appWindow?.data, fileId: undefined } });
    setActiveTab('Home');
  };

  const handleOpen = (id: string) => {
    const item = getItem(id);
    if (item) {
      setContent(item.content || '');
      setFileName(item.name);
      if (editorRef.current) editorRef.current.innerHTML = item.content || '';
      updateWindow(windowId, { title: item.name, data: { ...appWindow?.data, fileId: id } });
      setIsOpenDialogOpen(false);
      setActiveTab('Home');
    }
  };

  const handleSave = () => {
    if (fileId) {
      updateFileContent(fileId, content);
      addNotification('Word', 'Document saved.');
    } else {
      setSaveAsName(fileName);
      setIsSaveAsOpen(true);
    }
  };

  const handleSaveAsConfirm = () => {
    if (saveAsName.trim() && currentSavePath) {
      const name = saveAsName.trim().endsWith('.docx') ? saveAsName.trim() : `${saveAsName.trim()}.docx`;
      const newFileId = createItem(currentSavePath, name, 'file', content);
      
      addNotification('Word', `Saved as ${name}.`);
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
    addNotification('Word', 'Exporting to PDF... (Simulation)');
    setTimeout(() => addNotification('Word', 'Export Complete: Document.pdf'), 1500);
    setActiveTab('Home');
  };

  const handleClose = () => {
    closeWindow(windowId);
  };

  // --- Insert Operations ---

  const handleInsertImage = (url: string) => {
    execCommand('insertImage', url);
    setIsImageDialogOpen(false);
    setActiveTab('Home');
  };

  const insertShape = (shape: string) => {
    let html = '';
    if (shape === 'rectangle') html = '<div style="width: 100px; height: 100px; background-color: #3b82f6; display: inline-block; margin: 10px;"></div>';
    if (shape === 'circle') html = '<div style="width: 100px; height: 100px; background-color: #ef4444; border-radius: 50%; display: inline-block; margin: 10px;"></div>';
    execCommand('insertHTML', html);
  };

  const insertIcon = () => {
    // Simulating icon insertion as an SVG image or character
    execCommand('insertHTML', '<span style="font-size: 24px;">⭐</span>');
  };

  const insertTextBox = () => {
    const html = '<div style="border: 1px solid black; padding: 10px; width: 200px; background: #fff; display: inline-block;">Text Box</div>';
    execCommand('insertHTML', html);
  };

  // --- Image Operations ---

  const updateImageDimension = (dim: 'width' | 'height', value: number) => {
    if (selectedImageElement) {
      if (dim === 'width') {
        selectedImageElement.style.width = `${value}px`;
        setImageSize(prev => ({ ...prev, width: value }));
      } else {
        selectedImageElement.style.height = `${value}px`;
        setImageSize(prev => ({ ...prev, height: value }));
      }
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const updateImageFloat = (float: 'left' | 'right' | 'none') => {
    if (selectedImageElement) {
      selectedImageElement.style.float = float;
      selectedImageElement.style.margin = float === 'none' ? '0' : '10px';
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const updateImageBorder = (style: string) => {
     if (selectedImageElement) {
        // Reset specific styles
        selectedImageElement.style.border = '';
        selectedImageElement.style.borderRadius = '';
        selectedImageElement.style.boxShadow = '';
        
        if (style === 'border-simple') {
           selectedImageElement.style.border = '4px solid #000';
        } else if (style === 'border-rounded') {
           selectedImageElement.style.borderRadius = '12px';
        } else if (style === 'shadow') {
           selectedImageElement.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        } else if (style === 'circle') {
           selectedImageElement.style.borderRadius = '50%';
           selectedImageElement.style.aspectRatio = '1/1';
           selectedImageElement.style.objectFit = 'cover';
        }
        if (editorRef.current) setContent(editorRef.current.innerHTML);
     }
  }

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
      <Icon size={20} className={clsx("mb-0.5", active ? "text-blue-600" : "text-gray-700")} />
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

  const ColorPicker = ({ icon: Icon, command, defaultColor }: any) => (
    <div className="flex flex-col items-center justify-center px-1 h-full gap-0.5">
      <button onClick={() => execCommand(command, defaultColor)} className="p-1 hover:bg-gray-200 rounded">
        <Icon size={18} />
      </button>
      <div className="h-1 w-6 bg-red-500 rounded-full" />
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#f3f3f3] relative font-sans">
      
      {/* File Menu Overlay (Backstage View) */}
      {activeTab === 'File' && (
        <div className="absolute inset-0 z-50 flex">
          <div className="w-64 bg-[#2b579a] text-white flex flex-col py-4 gap-1">
            <button onClick={() => setActiveTab('Home')} className="p-4 hover:bg-[#1e3e6f] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"><ChevronLeft size={16} /></div>
              <span className="font-bold">Back</span>
            </button>
            <div className="h-px bg-white/20 my-2 mx-4" />
            <button onClick={handleNew} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><FilePlus size={20} /> New</button>
            <button onClick={() => setIsOpenDialogOpen(true)} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><FolderOpen size={20} /> Open</button>
            <button onClick={handleSave} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><Save size={20} /> Save</button>
            <button onClick={() => { setSaveAsName(fileName); setIsSaveAsOpen(true); }} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><Save size={20} /> Save As</button>
            <button onClick={handlePrint} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><Printer size={20} /> Print</button>
            <button onClick={handleExport} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><Download size={20} /> Export</button>
            <div className="flex-1" />
            <button onClick={handleClose} className="px-6 py-3 text-left hover:bg-[#1e3e6f] flex items-center gap-3"><LogOut size={20} /> Close</button>
          </div>
          <div className="flex-1 bg-gray-100 p-12">
            <h1 className="text-4xl font-light text-gray-600 mb-8">Good morning</h1>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={handleNew} className="bg-white p-6 shadow hover:shadow-md transition-shadow flex flex-col items-center gap-4 h-48 justify-center">
                <div className="w-16 h-20 border border-gray-200 bg-white relative">
                  <div className="absolute top-0 right-0 w-4 h-4 bg-gray-100 border-b border-l border-gray-200" />
                </div>
                <span className="font-medium">Blank document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {isSaveAsOpen && (
        <div className="absolute inset-0 bg-black/20 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 w-96">
            <h3 className="font-semibold mb-4">Save Document</h3>
            <input 
              value={saveAsName}
              onChange={e => setSaveAsName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Filename.docx"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsSaveAsOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveAsConfirm} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {isOpenDialogOpen && (
        <div className="absolute inset-0 bg-black/20 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 w-[500px] max-h-[80vh] flex flex-col">
            <h3 className="font-semibold mb-4">Open Document</h3>
            <div className="flex-1 overflow-y-auto border rounded mb-4 p-2">
              {getChildren('desktop').filter(f => f.name.endsWith('.docx')).map(file => (
                <div 
                  key={file.id} 
                  onClick={() => handleOpen(file.id)}
                  className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded"
                >
                  <FileText className="text-blue-600" size={20} />
                  <span>{file.name}</span>
                </div>
              ))}
              {getChildren('desktop').filter(f => f.name.endsWith('.docx')).length === 0 && (
                <div className="text-gray-400 text-center py-4">No Word documents found on Desktop</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpenDialogOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isImageDialogOpen && (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded shadow-2xl w-[800px] h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Insert Pictures</h3>
              <button onClick={() => setIsImageDialogOpen(false)} className="hover:bg-gray-100 p-1 rounded">
                <X size={16} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 bg-gray-50 border-r p-2 flex flex-col gap-1">
                 <button onClick={() => setImageDialogTab('Stock')} className={clsx("text-left px-3 py-2 text-sm rounded", imageDialogTab === 'Stock' ? "bg-white border shadow-sm font-medium text-blue-600" : "hover:bg-gray-200 text-gray-600")}>Stock Images</button>
                 <button onClick={() => setImageDialogTab('Device')} className={clsx("text-left px-3 py-2 text-sm rounded", imageDialogTab === 'Device' ? "bg-white border shadow-sm font-medium text-blue-600" : "hover:bg-gray-200 text-gray-600")}>This Device</button>
                 <button className="text-left px-3 py-2 text-sm hover:bg-gray-200 rounded text-gray-600">Online Pictures</button>
                 <button className="text-left px-3 py-2 text-sm hover:bg-gray-200 rounded text-gray-600">Icons</button>
              </div>

              {/* Main Area */}
              <div className="flex-1 flex flex-col bg-white">
                {imageDialogTab === 'Stock' ? (
                  <>
                    {/* Search Bar */}
                    <div className="p-4 border-b flex items-center gap-2">
                       <div className="relative flex-1">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                         <input type="text" placeholder="Search stock images..." className="w-full pl-9 pr-4 py-1.5 border rounded text-sm focus:outline-none focus:border-blue-500" />
                       </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="grid grid-cols-3 gap-4">
                        {stockImages.map((img, index) => (
                          <div 
                            key={index} 
                            onClick={() => setSelectedImage(img.url)}
                            className={clsx(
                              "cursor-pointer border-2 rounded overflow-hidden relative group h-40",
                              selectedImage === img.url ? "border-blue-600" : "border-transparent hover:border-gray-300"
                            )}
                          >
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                              {img.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col">
                     <div className="p-2 border-b bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Current:</span>
                        <span>{currentBrowsePath === 'root' ? 'This PC' : getItem(currentBrowsePath!)?.name || 'Unknown'}</span>
                        {currentBrowsePath !== 'root' && (
                           <button 
                             onClick={() => {
                               const parent = getItem(currentBrowsePath!)?.parentId;
                               setCurrentBrowsePath(parent || 'root');
                             }} 
                             className="ml-auto px-2 py-1 hover:bg-gray-200 rounded flex items-center gap-1"
                           >
                             <ChevronLeft size={14} /> Up
                           </button>
                        )}
                     </div>
                     <div className="flex-1 overflow-y-auto p-2">
                        {getChildren(currentBrowsePath).map(item => (
                          <div 
                            key={item.id}
                            onClick={() => {
                              if (item.type === 'folder') {
                                setCurrentBrowsePath(item.id);
                              } else {
                                setSelectedImage(item.content || '');
                              }
                            }}
                            className={clsx(
                              "flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded border border-transparent",
                              selectedImage === item.content ? "bg-blue-100 border-blue-300" : ""
                            )}
                          >
                            {item.type === 'folder' ? <Folder className="text-yellow-500" size={20} /> : <ImageIcon className="text-blue-500" size={20} />}
                            <span className="text-sm">{item.name}</span>
                          </div>
                        ))}
                        {getChildren(currentBrowsePath).length === 0 && (
                          <div className="text-gray-400 text-center py-8 text-sm">Folder is empty</div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2 items-center">
              <div className="text-xs text-gray-500 mr-auto">
                {selectedImage ? '1 image selected' : 'No image selected'}
              </div>
              <button onClick={() => setIsImageDialogOpen(false)} className="px-6 py-1.5 border bg-white hover:bg-gray-50 rounded text-sm">Cancel</button>
              <button 
                onClick={() => {
                  if (selectedImage) {
                    execCommand('insertImage', selectedImage);
                    setIsImageDialogOpen(false);
                    setSelectedImage(null);
                    setActiveTab('Home');
                  }
                }} 
                disabled={!selectedImage}
                className={clsx(
                  "px-6 py-1.5 rounded text-sm text-white transition-colors",
                  selectedImage ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                )}
              >
                Insert {selectedImage && '(1)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div className="bg-[#2b579a] text-white h-8 flex items-center px-2 text-xs select-none justify-between">
        <div className="flex items-center gap-2">
          <Save size={14} className="cursor-pointer hover:opacity-80" onClick={handleSave} />
          <Undo size={14} className="cursor-pointer hover:opacity-80" onClick={() => execCommand('undo')} />
          <Redo size={14} className="cursor-pointer hover:opacity-80" onClick={() => execCommand('redo')} />
          <div className="w-px h-4 bg-white/30 mx-1" />
          <span className="font-medium">AutoSave On</span>
        </div>
        <span className="font-semibold opacity-90">{fileName} - Word</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">User</div>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div className="bg-[#2b579a] text-white flex px-2 text-sm gap-1 pt-1">
        <button 
          onClick={() => setActiveTab('File')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'File' && "bg-white text-[#2b579a] font-medium")}
        >
          File
        </button>
        <button 
          onClick={() => setActiveTab('Home')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'Home' && "bg-white text-[#2b579a] font-medium")}
        >
          Home
        </button>
        <button 
          onClick={() => setActiveTab('Insert')}
          className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'Insert' && "bg-white text-[#2b579a] font-medium")}
        >
          Insert
        </button>
        {selectedImageElement && (
          <button 
            onClick={() => setActiveTab('Picture Format')}
            className={clsx("px-4 py-1 rounded-t hover:bg-white/10", activeTab === 'Picture Format' && "bg-white text-[#2b579a] font-medium")}
          >
            Picture Format
          </button>
        )}
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
                    .then(t => execCommand('insertText', t))
                    .catch(err => {
                      console.error('Failed to read clipboard:', err);
                      addNotification('Word', 'Please use Ctrl+V (or Cmd+V) to paste.');
                    });
                }} 
              />
              <div className="flex flex-col justify-center gap-1">
                <button onClick={() => execCommand('cut')} className="flex items-center gap-1 px-1 hover:bg-gray-100 rounded text-xs"><Scissors size={14} /> Cut</button>
                <button onClick={() => execCommand('copy')} className="flex items-center gap-1 px-1 hover:bg-gray-100 rounded text-xs"><Copy size={14} /> Copy</button>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Font">
              <div className="flex flex-col gap-1 p-1">
                <div className="flex gap-1">
                  <select 
                    className="h-6 border border-gray-300 rounded text-xs w-28"
                    onChange={(e) => execCommand('fontName', e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                  <select 
                    className="h-6 border border-gray-300 rounded text-xs w-14"
                    onChange={(e) => execCommand('fontSize', e.target.value)}
                    defaultValue="3"
                    title="Font Size"
                  >
                    <option value="1">8</option>
                    <option value="2">10</option>
                    <option value="3">12</option>
                    <option value="4">14</option>
                    <option value="5">18</option>
                    <option value="6">24</option>
                    <option value="7">36</option>
                  </select>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => execCommand('bold')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('bold') && "bg-gray-300")}><Bold size={16} /></button>
                  <button onClick={() => execCommand('italic')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('italic') && "bg-gray-300")}><Italic size={16} /></button>
                  <button onClick={() => execCommand('underline')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('underline') && "bg-gray-300")}><Underline size={16} /></button>
                  <button onClick={() => execCommand('strikeThrough')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('strikeThrough') && "bg-gray-300")}><Strikethrough size={16} /></button>
                  <button onClick={() => execCommand('subscript')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('subscript') && "bg-gray-300")}><Subscript size={16} /></button>
                  <button onClick={() => execCommand('superscript')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('superscript') && "bg-gray-300")}><Superscript size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <div className="relative p-1 rounded hover:bg-gray-200 flex flex-col items-center justify-center w-7 h-7 cursor-pointer" title="Font Color">
                    <Type size={16} className="text-black" />
                    <div className="h-1 w-4 mt-0.5 rounded-full" style={{ backgroundColor: fontColor }} />
                    <input 
                      type="color" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        setFontColor(e.target.value);
                        execCommand('foreColor', e.target.value);
                      }}
                    />
                  </div>
                  <button onClick={() => execCommand('hiliteColor', 'yellow')} className="p-1 rounded hover:bg-gray-200 bg-yellow-100"><Highlighter size={16} /></button>
                </div>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Paragraph">
              <div className="flex flex-col gap-1 p-1">
                <div className="flex gap-0.5">
                  <button onClick={() => execCommand('insertUnorderedList')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('insertUnorderedList') && "bg-gray-300")}><List size={16} /></button>
                  <button onClick={() => execCommand('insertOrderedList')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('insertOrderedList') && "bg-gray-300")}><ListOrdered size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button onClick={() => execCommand('outdent')} className="p-1 rounded hover:bg-gray-200"><AlignLeft size={16} className="transform rotate-180" /></button>
                  <button onClick={() => execCommand('indent')} className="p-1 rounded hover:bg-gray-200"><AlignRight size={16} className="transform rotate-180" /></button>
                  <button onClick={() => execCommand('formatBlock', 'P')} className="p-1 rounded hover:bg-gray-200"><Pilcrow size={16} /></button>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => execCommand('justifyLeft')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('justifyLeft') && "bg-gray-300")}><AlignLeft size={16} /></button>
                  <button onClick={() => execCommand('justifyCenter')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('justifyCenter') && "bg-gray-300")}><AlignCenter size={16} /></button>
                  <button onClick={() => execCommand('justifyRight')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('justifyRight') && "bg-gray-300")}><AlignRight size={16} /></button>
                  <button onClick={() => execCommand('justifyFull')} className={clsx("p-1 rounded hover:bg-gray-200", activeFormats.includes('justifyFull') && "bg-gray-300")}><AlignJustify size={16} /></button>
                </div>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Styles">
              <div className="flex gap-1 h-full items-center">
                <button onClick={() => execCommand('formatBlock', 'P')} className="px-2 py-1 border border-gray-200 hover:bg-blue-50 rounded text-xs text-left w-16 h-16 overflow-hidden">
                  <span className="block font-normal">Normal</span>
                  <span className="text-[8px] text-gray-400">AaBbCc</span>
                </button>
                <button onClick={() => execCommand('formatBlock', 'H1')} className="px-2 py-1 border border-gray-200 hover:bg-blue-50 rounded text-xs text-left w-16 h-16 overflow-hidden">
                  <span className="block font-bold text-blue-600">Heading 1</span>
                  <span className="text-[8px] text-gray-400">AaBbCc</span>
                </button>
                <button onClick={() => execCommand('formatBlock', 'H2')} className="px-2 py-1 border border-gray-200 hover:bg-blue-50 rounded text-xs text-left w-16 h-16 overflow-hidden">
                  <span className="block font-bold text-blue-600">Heading 2</span>
                  <span className="text-[8px] text-gray-400">AaBbCc</span>
                </button>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Editing">
              <RibbonButton icon={Search} label="Find" onClick={() => addNotification('Word', 'Find feature not implemented')} />
              <RibbonButton icon={MousePointer} label="Select" onClick={() => execCommand('selectAll')} />
            </RibbonGroup>
          </>
        )}

        {activeTab === 'Insert' && (
          <>
            <RibbonGroup label="Pages">
              <RibbonButton icon={FilePlus} label="Cover Page" disabled />
              <RibbonButton icon={FileText} label="Blank Page" onClick={() => execCommand('insertHTML', '<div style="page-break-before: always;"></div>')} />
            </RibbonGroup>

            <RibbonGroup label="Illustrations">
              <RibbonButton icon={ImageIcon} label="Pictures" onClick={() => setIsImageDialogOpen(true)} />
              <RibbonButton icon={Square} label="Shapes" onClick={() => insertShape('rectangle')} />
              <RibbonButton icon={Box} label="Icons" onClick={insertIcon} />
            </RibbonGroup>

            <RibbonGroup label="Text">
              <RibbonButton icon={Box} label="Text Box" onClick={insertTextBox} />
            </RibbonGroup>
          </>
        )}

        {activeTab === 'Picture Format' && (
          <>
             <RibbonGroup label="Adjust">
                <RibbonButton icon={Crop} label="Crop" onClick={() => addNotification('Word', 'Crop tool not implemented yet')} />
                <div className="flex flex-col gap-1 justify-center h-full px-2">
                   <button onClick={() => updateImageBorder('border-simple')} className="text-xs hover:bg-gray-100 p-1 rounded text-left flex items-center gap-2"><Square size={12} /> Simple Frame</button>
                   <button onClick={() => updateImageBorder('border-rounded')} className="text-xs hover:bg-gray-100 p-1 rounded text-left flex items-center gap-2"><Square size={12} className="rounded-sm" /> Rounded</button>
                   <button onClick={() => updateImageBorder('shadow')} className="text-xs hover:bg-gray-100 p-1 rounded text-left flex items-center gap-2"><Box size={12} /> Shadow</button>
                   <button onClick={() => updateImageBorder('circle')} className="text-xs hover:bg-gray-100 p-1 rounded text-left flex items-center gap-2"><Circle size={12} /> Circle</button>
                </div>
             </RibbonGroup>

             <RibbonGroup label="Arrange">
                <RibbonButton icon={Layout} label="Wrap Text" onClick={() => {}} />
                <div className="flex flex-col gap-1 justify-center h-full px-2">
                   <button onClick={() => updateImageFloat('left')} className="text-xs hover:bg-gray-100 p-1 rounded text-left">Align Left</button>
                   <button onClick={() => updateImageFloat('right')} className="text-xs hover:bg-gray-100 p-1 rounded text-left">Align Right</button>
                   <button onClick={() => updateImageFloat('none')} className="text-xs hover:bg-gray-100 p-1 rounded text-left">No Wrap</button>
                </div>
             </RibbonGroup>

             <RibbonGroup label="Size">
                <div className="flex flex-col gap-2 justify-center h-full px-2">
                   <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Height:</span>
                      <input 
                        type="number" 
                        value={imageSize.height} 
                        onChange={(e) => updateImageDimension('height', parseInt(e.target.value))}
                        className="w-16 border rounded px-1 text-xs" 
                      />
                      <span className="text-xs">px</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Width:</span>
                      <input 
                        type="number" 
                        value={imageSize.width} 
                        onChange={(e) => updateImageDimension('width', parseInt(e.target.value))}
                        className="w-16 border rounded px-1 text-xs" 
                      />
                      <span className="text-xs">px</span>
                   </div>
                </div>
             </RibbonGroup>
          </>
        )}

      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8 flex justify-center cursor-text bg-[#e3e3e3]" onClick={handleEditorClick}>
        <div className="relative">
          <div 
            ref={editorRef}
            contentEditable
            className="bg-white shadow-lg w-[816px] min-h-[1056px] p-12 outline-none text-gray-900"
            style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '1.5' }}
            onInput={() => {
              if (editorRef.current) setContent(editorRef.current.innerHTML);
              checkFormats();
            }}
            onKeyUp={() => { checkFormats(); saveSelection(); }}
            onMouseUp={() => { checkFormats(); saveSelection(); }}
            onBlur={saveSelection}
            onContextMenu={handleImageContextMenu}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                  case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    break;
                  case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    break;
                  case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    break;
                }
              }
            }}
          />
          
          {/* Resize Handles Overlay */}
          {selectedImageElement && (
            <div 
              className="absolute pointer-events-none"
              style={{
                top: selectedImageElement.offsetTop,
                left: selectedImageElement.offsetLeft,
                width: selectedImageElement.offsetWidth,
                height: selectedImageElement.offsetHeight,
                border: '2px solid #2b579a',
                display: editorRef.current?.contains(selectedImageElement) ? 'block' : 'none'
              }}
            >
              {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'].map((pos) => (
                <div
                  key={pos}
                  className="absolute w-3 h-3 bg-white border border-[#2b579a] rounded-full pointer-events-auto"
                  style={{
                    top: pos.includes('top') ? -6 : pos.includes('bottom') ? '100%' : '50%',
                    left: pos.includes('left') ? -6 : pos.includes('right') ? '100%' : '50%',
                    transform: `translate(${pos.includes('top') ? 0 : pos.includes('bottom') ? 0 : '-50%'}, ${pos.includes('left') ? 0 : pos.includes('right') ? 0 : '-50%'})`,
                    marginTop: pos.includes('bottom') ? -6 : 0,
                    cursor: pos.includes('top-left') || pos.includes('bottom-right') ? 'nwse-resize' : 
                            pos.includes('top-right') || pos.includes('bottom-left') ? 'nesw-resize' :
                            pos.includes('top') || pos.includes('bottom') ? 'ns-resize' : 'ew-resize'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = selectedImageElement.width;
                    const startHeight = selectedImageElement.height;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const dx = moveEvent.clientX - startX;
                      const dy = moveEvent.clientY - startY;
                      
                      let newWidth = startWidth;
                      let newHeight = startHeight;
                      
                      if (pos.includes('right')) newWidth = startWidth + dx;
                      if (pos.includes('left')) newWidth = startWidth - dx;
                      if (pos.includes('bottom')) newHeight = startHeight + dy;
                      if (pos.includes('top')) newHeight = startHeight - dy;
                      
                      if (newWidth > 20) {
                        selectedImageElement.style.width = `${newWidth}px`;
                        setImageSize(prev => ({ ...prev, width: newWidth }));
                      }
                      if (newHeight > 20) {
                        selectedImageElement.style.height = `${newHeight}px`;
                        setImageSize(prev => ({ ...prev, height: newHeight }));
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      if (editorRef.current) setContent(editorRef.current.innerHTML);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="absolute bg-white border border-gray-200 shadow-lg rounded py-1 z-[9999] min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
            onClick={() => {
              execCommand('cut');
              setContextMenu(null);
            }}
          >
            <Scissors size={14} /> Cut
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
            onClick={() => {
              execCommand('copy');
              setContextMenu(null);
            }}
          >
            <Copy size={14} /> Copy
          </button>
          <div className="h-px bg-gray-200 my-1" />
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
            onClick={() => {
              setActiveTab('Picture Format');
              setContextMenu(null);
            }}
          >
            <ImageIcon size={14} /> Format Picture...
          </button>
        </div>
      )}
      
      {/* Status Bar */}
      <div className="h-6 bg-[#2b579a] text-white flex items-center px-2 text-xs gap-4 select-none">
        <span>Page 1 of 1</span>
        <span>{content.replace(/<[^>]*>/g, '').length} words</span>
        <div className="flex-1" />
        <span>Focus</span>
        <span>100%</span>
      </div>
    </div>
  );
};

// Helper Icon for Back button
const ChevronLeft = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
