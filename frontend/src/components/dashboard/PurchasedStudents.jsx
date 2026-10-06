import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Phone, User, Search, Edit } from 'lucide-react';
import { config } from '../../config';

const PurchasedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add new student state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/access/students/all`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    if (!newPhone) return alert('Phone number is required');
    
    setAddLoading(true);
    try {
      const url = editingStudent 
        ? `${config.API_BASE_URL}/api/access/students/${editingStudent.id}`
        : `${config.API_BASE_URL}/api/access/students`;
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: newPhone, name: newName })
      });
      
      if (res.ok) {
        setNewPhone('');
        setNewName('');
        setShowAddModal(false);
        setEditingStudent(null);
        fetchStudents();
      } else {
        const err = await res.json();
        alert(err.error || `Failed to ${editingStudent ? 'update' : 'add'} student`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${editingStudent ? 'update' : 'add'} student`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setNewPhone(student.phone_number);
    setNewName(student.name || '');
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this student? They will lose access to the course.')) {
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/access/students/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchStudents();
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const filteredStudents = students.filter(student => 
    student.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Purchased Students
            <span className="bg-amber-500/10 text-amber-500 text-sm py-1 px-3 rounded-full ml-2">
              {students.length} Total
            </span>
          </h2>
          <p className="text-slate-400 text-sm">Manage students who have purchased the course</p>
        </div>
        <button 
          onClick={() => {
            setEditingStudent(null);
            setNewPhone('');
            setNewName('');
            setShowAddModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" /> Add Student
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl flex-1">
        
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-indigo-900/50 rounded-xl leading-5 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            placeholder="Search by phone number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-slate-500 text-center py-16 bg-slate-950/50 rounded-xl border border-dashed border-indigo-900/30">
            <Users className="w-12 h-12 mx-auto text-slate-700 mb-4" />
            No students found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-indigo-900/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-300 text-sm border-b border-indigo-900/50">
                  <th className="p-4 font-semibold">Phone Number</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-900/30">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Phone className="w-4 h-4 text-indigo-400" />
                        {student.phone_number}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        {student.name || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        student.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {student.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(student)}
                          className="p-2 bg-slate-950 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-indigo-900/30 hover:border-amber-500/30"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 bg-slate-950 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-indigo-900/30 hover:border-red-500/30"
                          title="Remove Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl w-full max-w-md relative">
            <h3 className="text-xl font-bold text-white mb-6 pr-10">{editingStudent ? 'Edit' : 'Add New'} <span className="text-amber-500">Student</span></h3>
            
            <form onSubmit={handleSubmitStudent} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-1.5">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    value={newPhone} 
                    onChange={e => setNewPhone(e.target.value)} 
                    required 
                    className="pl-10 w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors" 
                    placeholder="+919876543210" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-1.5">Student Name (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    className="pl-10 w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6 gap-3 border-t border-indigo-900/50 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="text-slate-400 hover:text-[#E41E5D] font-bold py-2.5 px-6 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addLoading} 
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/25 disabled:opacity-50"
                >
                  {addLoading ? (editingStudent ? 'Updating...' : 'Adding...') : (editingStudent ? 'Update Access' : 'Add Access')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedStudents;
