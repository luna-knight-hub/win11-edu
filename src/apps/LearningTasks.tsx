import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useLearningTaskStore, Task, Question } from '../store/useLearningTaskStore';
import { 
  BookOpen, CheckCircle, Plus, User, GraduationCap, 
  ChevronRight, Play, Star, Clock, AlertCircle, ArrowLeft,
  Layout, Type, Image as ImageIcon, Video, Mic, Save, Edit2
} from 'lucide-react';
import { clsx } from 'clsx';

import { TaskGuideEditor } from '../components/education/TaskGuideEditor';

export const LearningTasks: React.FC<{ windowId: string }> = ({ windowId }) => {
  const { closeWindow, addNotification } = useOSStore();
  const { tasks, addTask, updateTask, deleteTask } = useLearningTaskStore();
  
  const [view, setView] = useState<'home' | 'teacher' | 'student' | 'create-task' | 'execute-task' | 'edit-guide'>('home');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  // --- Teacher Views ---

  const TeacherDashboard = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-6 border-b flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h2>
          <p className="text-gray-500">Manage your learning tasks</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('edit-guide')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <Edit2 size={20} /> Edit Task Guide
          </button>
          <button 
            onClick={() => setView('create-task')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} /> Create Task
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Grade {task.grade}
                </span>
                <span className="text-gray-400 text-xs">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1"><BookOpen size={16} /> {task.subject}</div>
                <div className="flex items-center gap-1"><Clock size={16} /> {task.content.length} Qs</div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">Edit</button>
                <button onClick={() => deleteTask(task.id)} className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TaskCreator = () => {
    const [newTask, setNewTask] = useState<Partial<Task>>({
      title: '',
      description: '',
      grade: 1,
      subject: 'Math',
      type: 'quiz',
      content: [],
      settings: { points: 10 }
    });

    const addQuestion = () => {
      const q: Question = {
        id: Date.now().toString(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      };
      setNewTask({ ...newTask, content: [...(newTask.content || []), q] });
    };

    const handleSaveTask = () => {
      if (!newTask.title || !newTask.content?.length) {
        addNotification('Error', 'Please fill in title and at least one question');
        return;
      }
      
      addTask({
        ...newTask,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      } as Task);
      
      addNotification('Success', 'Task created successfully!');
      setView('teacher');
    };

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 border-b flex items-center gap-4 shadow-sm">
          <button onClick={() => setView('teacher')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Create New Task</h2>
          <div className="flex-1" />
          <button onClick={handleSaveTask} className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
            <Save size={20} /> Save Task
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Layout size={20} className="text-blue-500" /> Basic Info</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Fun with Fractions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    value={newTask.subject}
                    onChange={e => setNewTask({...newTask, subject: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option>Math</option>
                    <option>Science</option>
                    <option>Literature</option>
                    <option>History</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border rounded-lg p-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe the learning objectives..."
                />
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle size={20} className="text-green-500" /> Questions</h3>
                <button onClick={addQuestion} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium">+ Add Question</button>
              </div>
              
              <div className="space-y-6">
                {newTask.content?.map((q, idx) => (
                  <div key={q.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-500">Question {idx + 1}</span>
                      <button className="text-red-500 hover:text-red-700"><AlertCircle size={16} /></button>
                    </div>
                    <input 
                      value={q.text}
                      onChange={e => {
                        const newContent = [...(newTask.content || [])];
                        newContent[idx].text = e.target.value;
                        setNewTask({...newTask, content: newContent});
                      }}
                      className="w-full border rounded p-2 mb-3"
                      placeholder="Enter your question here..."
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      {q.options?.map((opt, optIdx) => (
                        <input 
                          key={optIdx}
                          value={opt}
                          onChange={e => {
                            const newContent = [...(newTask.content || [])];
                            if (newContent[idx].options) {
                              newContent[idx].options![optIdx] = e.target.value;
                            }
                            setNewTask({...newTask, content: newContent});
                          }}
                          className="border rounded p-2 text-sm"
                          placeholder={`Option ${optIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {(!newTask.content || newTask.content.length === 0) && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                    No questions added yet. Click "+ Add Question" to start.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Student Views ---

  const StudentDashboard = () => (
    <div className="flex flex-col h-full bg-[#f0f9ff]">
      <div className="bg-white p-6 border-b shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hi, Student! 👋</h2>
            <p className="text-gray-500">Ready to learn something new today?</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" /> Your Missions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => {
                setSelectedTask(task);
                setStudentAnswers({});
                setScore(null);
                setView('execute-task');
              }}
              className="bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-400 cursor-pointer transition-all transform hover:-translate-y-1 overflow-hidden group"
            >
              <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                    {task.subject}
                  </span>
                  <h3 className="text-lg font-bold leading-tight">{task.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <Clock size={14} /> 10 mins
                  </div>
                  <button className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TaskExecutor = () => {
    if (!selectedTask) return null;

    const handleSubmit = () => {
      // Simple grading logic for demo
      let correct = 0;
      selectedTask.content.forEach(q => {
        if (studentAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      });
      const finalScore = (correct / selectedTask.content.length) * 100;
      setScore(finalScore);
      
      if (finalScore === 100) {
        addNotification('Perfect!', 'You got everything right! 🎉');
      } else {
        addNotification('Good Job!', `You scored ${Math.round(finalScore)}%`);
      }
    };

    if (score !== null) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8 text-center">
          <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Star size={64} className="text-yellow-500 fill-yellow-500" />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Mission Complete!</h2>
          <p className="text-xl text-gray-600 mb-8">You scored <span className="font-bold text-blue-600">{Math.round(score)}%</span></p>
          
          <button 
            onClick={() => setView('student')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            Back to Missions
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setView('student')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-lg text-gray-800">{selectedTask.title}</h2>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${(Object.keys(studentAnswers).length / selectedTask.content.length) * 100}%` }} 
              />
            </div>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
          <div className="space-y-8">
            {selectedTask.content.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-3">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                    {idx + 1}
                  </span>
                  {q.text}
                </h3>
                
                {q.media && (
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img src={q.media.url} alt="Question Media" className="w-full h-48 object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options?.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setStudentAnswers({ ...studentAnswers, [q.id]: opt })}
                      className={clsx(
                        "p-4 rounded-xl text-left border-2 transition-all font-medium",
                        studentAnswers[q.id] === opt 
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md" 
                          : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-600"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-center sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(studentAnswers).length < selectedTask.content.length}
            className="bg-green-600 text-white px-12 py-3 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="w-full h-full bg-white font-sans text-gray-900">
      {view === 'home' && (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">EduSimple Tasks</h1>
            <p className="text-xl opacity-90">Interactive learning for everyone.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
            <button 
              onClick={() => setView('teacher')}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <GraduationCap size={40} />
              </div>
              <h2 className="text-2xl font-bold">I'm a Teacher</h2>
              <p className="text-center opacity-80 text-sm">Create tasks, manage content, and track progress.</p>
            </button>

            <button 
              onClick={() => setView('student')}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <User size={40} />
              </div>
              <h2 className="text-2xl font-bold">I'm a Student</h2>
              <p className="text-center opacity-80 text-sm">Complete missions, earn points, and learn fun stuff!</p>
            </button>
          </div>
        </div>
      )}

      {view === 'teacher' && <TeacherDashboard />}
      {view === 'create-task' && <TaskCreator />}
      {view === 'edit-guide' && (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white p-4 border-b flex items-center gap-4 shadow-sm">
            <button onClick={() => setView('teacher')} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Edit Task Guide</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
            <TaskGuideEditor />
          </div>
        </div>
      )}
      {view === 'student' && <StudentDashboard />}
      {view === 'execute-task' && <TaskExecutor />}
    </div>
  );
};
