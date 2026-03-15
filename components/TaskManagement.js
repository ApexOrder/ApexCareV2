import React, { useState } from 'react';
import { Check, Trash2, ClipboardList, Pill, Coffee, Home, Heart, AlertOctagon, Info, User } from 'lucide-react';

const TaskManagement = ({ tasks, onUpdateTasks, userRole }) => {
  const [taskSearch, setTaskSearch] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [newTaskTime, setNewTaskTime] = useState('Anytime');
  const [newTaskFrequency, setNewTaskFrequency] = useState('Daily');
  const [newTaskDays, setNewTaskDays] = useState([]);

  const predefinedTasks = {
    'Personal Care': ['Assist with washing/showering', 'Assist with dressing', 'Oral hygiene', 'Hair care', 'Shaving'],
    'Nutrition & Hydration': ['Prepare breakfast', 'Prepare lunch', 'Prepare dinner', 'Prepare snacks', 'Encourage fluids', 'Monitor intake'],
    'Medication': ['Prompt medication', 'Administer medication', 'Apply creams/lotions', 'Collect prescription'],
    'Domestic': ['Light cleaning', 'Laundry', 'Ironing', 'Change bed linen', 'Take out rubbish'],
    'Social': ['Companionship', 'Accompaniment to appointments', 'Shopping']
  };

  const handleAddTask = (description) => {
    const desc = typeof description === 'string' ? description : taskSearch;
    if (!desc.trim()) return;

    if (newTaskFrequency === 'Specific Days' && newTaskDays.length === 0) {
        alert('Please select at least one day.');
        return;
    }

    const newTask = {
      id: `t-${Date.now()}`,
      description: desc,
      isCompleted: false,
      timeOfDay: newTaskTime,
      frequency: newTaskFrequency,
      days: newTaskFrequency === 'Specific Days' ? newTaskDays : null
    };
    onUpdateTasks([...tasks, newTask]);
    setTaskSearch('');
    setShowTaskDropdown(false);
    setNewTaskFrequency('Daily');
    setNewTaskDays([]);
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onUpdateTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
     if(window.confirm('Delete this task?')) {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        onUpdateTasks(updatedTasks);
     }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3">Daily Care Tasks</h2>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Routine & Medication Adherence</p>
        </div>
      </div>

      {/* Add Task Form */}
      {userRole === 'admin' && (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm mb-8" style={{ borderTop: '6px solid #3b82f6' }}>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 relative w-full">
                <input 
                  type="text" 
                  placeholder="Search or type custom task..." 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-4 font-bold text-slate-700 dark:text-slate-200 outline-none border focus:ring-2 focus:ring-blue-500/20"
                  value={taskSearch}
                  onChange={(e) => {
                      setTaskSearch(e.target.value);
                      setShowTaskDropdown(true);
                  }}
                  onFocus={() => setShowTaskDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask(taskSearch)}
                />
                {showTaskDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {Object.entries(predefinedTasks).map(([category, items]) => {
                            const filteredItems = items.filter(i => i.toLowerCase().includes(taskSearch.toLowerCase()));
                            if (filteredItems.length === 0) return null;
                            return (
                                <div key={category}>
                                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 border-b border-slate-100 dark:border-slate-700">
                                        {category}
                                    </div>
                                    {filteredItems.map(item => (
                                        <button
                                            key={item}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                                            onMouseDown={() => {
                                                setTaskSearch(item);
                                                setShowTaskDropdown(false);
                                            }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                        {taskSearch && !Object.values(predefinedTasks).flat().some(i => i.toLowerCase() === taskSearch.toLowerCase()) && (
                            <button
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-blue-600 dark:text-blue-400 transition-colors border-t border-slate-100 dark:border-slate-800"
                                onMouseDown={() => setShowTaskDropdown(false)}
                            >
                                Use custom: "{taskSearch}"
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
                <select
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-4 font-bold text-slate-700 dark:text-slate-200 outline-none border focus:ring-2 focus:ring-blue-500/20 w-full"
                  value={['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(newTaskTime) ? newTaskTime : 'Specific'}
                  onChange={(e) => {
                      if (e.target.value === 'Specific') {
                          setNewTaskTime('');
                      } else {
                          setNewTaskTime(e.target.value);
                      }
                  }}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Anytime">Anytime</option>
                  <option value="Specific">Specific Time</option>
                </select>
                {!['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(newTaskTime) && (
                    <input 
                        type="time"
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-4 font-bold text-slate-700 dark:text-slate-200 outline-none border focus:ring-2 focus:ring-blue-500/20 w-full"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                    />
                )}
            </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <select
                        className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-700 dark:text-slate-200 outline-none border focus:ring-2 focus:ring-blue-500/20 text-sm"
                        value={newTaskFrequency}
                        onChange={(e) => setNewTaskFrequency(e.target.value)}
                    >
                        <option value="Daily">Daily</option>
                        <option value="Specific Days">Specific Days</option>
                        <option value="One-off">One-off</option>
                    </select>

                    {newTaskFrequency === 'Specific Days' && (
                        <div className="flex gap-1 flex-wrap">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <button
                                    key={day}
                                    onClick={() => {
                                        if (newTaskDays.includes(day)) {
                                            setNewTaskDays(newTaskDays.filter(d => d !== day));
                                        } else {
                                            setNewTaskDays([...newTaskDays, day]);
                                        }
                                    }}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase border transition-colors ${newTaskDays.includes(day) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            <button 
              onClick={() => handleAddTask(taskSearch)}
              className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 transition-all active:scale-95 hover:bg-blue-700"
            >
              Add Task
            </button>
         </div>
         </div>
      </div>
      )}

      {/* Task Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {['Morning', 'Afternoon', 'Evening', 'Anytime'].map(period => {
            const timeTasks = tasks.filter(t => {
                const tTime = t.timeOfDay;
                if (['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(tTime)) {
                    return tTime === period;
                }
                const hour = parseInt(tTime.split(':')[0]);
                if (isNaN(hour)) return period === 'Anytime';
                if (period === 'Morning') return hour < 12;
                if (period === 'Afternoon') return hour >= 12 && hour < 17;
                if (period === 'Evening') return hour >= 17;
                return false;
            }).sort((a, b) => {
                const isSpecificA = !['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(a.timeOfDay);
                const isSpecificB = !['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(b.timeOfDay);
                if (isSpecificA && isSpecificB) return a.timeOfDay.localeCompare(b.timeOfDay);
                if (isSpecificA) return -1;
                if (isSpecificB) return 1;
                return 0;
            });

            if (timeTasks.length === 0) return null;
            return (
              <div key={period} className="space-y-4">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">{period}</h3>
                 <div className="space-y-3">
                    {timeTasks.map(task => (
                       <div key={task.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${task.isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 opacity-75' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                          <button 
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'}`}
                          >
                            {task.isCompleted && <Check size={14} />}
                          </button>
                          <span className={`flex-1 font-bold ${task.isCompleted ? 'text-emerald-700 dark:text-emerald-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                              {!['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(task.timeOfDay) && (
                                  <span className="mr-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] rounded-lg border border-blue-100 dark:border-blue-800">{task.timeOfDay}</span>
                              )}
                              {task.description}
                              {task.frequency === 'Specific Days' && task.days && (
                                  <span className="ml-2 inline-flex items-center gap-1">
                                      {task.days.map(d => (
                                          <span key={d} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase rounded border border-slate-200 dark:border-slate-700">{d}</span>
                                      ))}
                                  </span>
                              )}
                              {task.frequency === 'One-off' && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase rounded border border-slate-200 dark:border-slate-700">One-off</span>
                              )}
                          </span>
                          {userRole === 'admin' && (
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
            );
         })}
         {tasks.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
               <ClipboardList size={48} className="mb-4 text-slate-300" />
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No tasks scheduled</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default TaskManagement;