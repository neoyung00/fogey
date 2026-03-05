import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Search, 
  Trash2, 
  Users, 
  CheckSquare,
  Square,
  Cloud,
  Loader2,
  RefreshCw,
  Download,
  GraduationCap,
  Filter,
  ClipboardCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';
import { auth, db, appId } from './firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '1',
    isAttending: true,
    isPaid: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  const grades = [1, 2, 3, 4];

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Authentication Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const participantsCol = collection(db, 'artifacts', appId, 'public', 'data', 'participants');
    const unsubscribe = onSnapshot(participantsCol, 
      (snapshot) => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setParticipants(list.sort((a, b) => {
          if (a.grade !== b.grade) {
            const gradeA = isNaN(a.grade) ? 99 : parseInt(a.grade);
            const gradeB = isNaN(b.grade) ? 99 : parseInt(b.grade);
            return gradeA - gradeB;
          }
          return a.name.localeCompare(b.name);
        }));
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Snapshot Error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const filteredList = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || p.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [participants, searchTerm, gradeFilter]);

  const stats = useMemo(() => {
    const total = filteredList.length;
    const attendingCount = filteredList.filter(p => p.isAttending).length;
    const paidCount = filteredList.filter(p => p.isPaid).length;
    
    const breakdown = grades.reduce((acc, g) => {
      const gradeItems = filteredList.filter(p => p.grade === g.toString());
      acc[g] = {
        total: gradeItems.length,
        attending: gradeItems.filter(p => p.isAttending).length,
        paid: gradeItems.filter(p => p.isPaid).length
      };
      return acc;
    }, {});
    
    return { total, attendingCount, paidCount, breakdown };
  }, [filteredList]);

  const exportToCSV = () => {
    if (participants.length === 0) return;
    setIsExporting(true);
    const headers = ["구분", "이름", "참여여부", "회비납부"];
    const rows = participants.map(p => [
      p.grade === 'teacher' ? '교직원' : p.grade === 'other' ? '기타' : `${p.grade}학년`,
      p.name,
      p.isAttending ? "참여" : "불참",
      p.isPaid ? "납부완료" : "미납"
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `행사명단_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !user) return;
    try {
      const participantsCol = collection(db, 'artifacts', appId, 'public', 'data', 'participants');
      await addDoc(participantsCol, {
        ...formData,
        createdAt: Date.now(),
        createdBy: user.uid
      });
      setFormData({ ...formData, name: '', isPaid: false });
    } catch (error) {
      console.error("Add Document Error:", error);
    }
  };

  const toggleStatus = async (id, field, currentValue) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', id);
      await updateDoc(docRef, { [field]: !currentValue });
    } catch (error) {
      console.error("Update Document Error:", error);
    }
  };

  const deleteEntry = async (id) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-4 font-sans text-slate-900 text-[13px]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-black text-slate-800 tracking-tight">
              행사 참여 확인시스템
            </h1>
            <div className="hidden md:flex items-center gap-2 ml-2 border-l pl-3">
              <span className="flex items-center gap-1 text-green-600 text-[9px] font-bold">
                <Cloud size={10} /> 실시간 동기화
              </span>
            </div>
          </div>
          
          <button 
            onClick={exportToCSV}
            disabled={participants.length === 0 || isExporting}
            className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={12} /> : <Download size={12} />}
            엑셀 출력
          </button>
        </header>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          {/* Detailed Grade Breakdown Card with Toggle */}
          <div 
            className="bg-white px-3 py-2 rounded-xl shadow-sm border-l-4 border-l-blue-500 flex flex-col justify-center cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <div className="flex justify-between items-center mb-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <span>학년별 상세 현황</span>
                {showBreakdown ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </p>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">총 {stats.total}명</span>
            </div>

            {showBreakdown ? (
              <div className="space-y-1 mt-1">
                <div className="grid grid-cols-4 text-[8px] font-black text-slate-300 uppercase border-b border-slate-50 pb-0.5 mb-0.5">
                  <div className="pl-1">학년</div>
                  <div className="text-center">전체</div>
                  <div className="text-center">참여</div>
                  <div className="text-center">납부</div>
                </div>
                {grades.map(g => (
                  <div key={g} className="grid grid-cols-4 items-center">
                    <div className="text-[10px] font-bold text-slate-500 pl-1">{g}학년</div>
                    <div className="text-center font-black text-slate-400">{stats.breakdown[g].total}</div>
                    <div className="text-center font-black text-green-600">{stats.breakdown[g].attending}</div>
                    <div className="text-center font-black text-amber-500">{stats.breakdown[g].paid}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">클릭하여 학년별 상세 보기</p>
            )}
          </div>

          <div className="bg-white px-3 py-2 rounded-xl shadow-sm border-l-4 border-l-green-500 flex flex-col justify-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">참여 확정 (전체)</p>
            <p className="text-2xl font-black text-green-600 leading-none">{stats.attendingCount}<span className="text-[10px] font-normal text-slate-400 ml-0.5">명</span></p>
            <div className="mt-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${stats.total > 0 ? (stats.attendingCount / stats.total) * 100 : 0}%` }}
               />
            </div>
          </div>
          
          <div className="bg-white px-3 py-2 rounded-xl shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">회비 납부 (전체)</p>
            <p className="text-2xl font-black text-amber-500 leading-none">{stats.paidCount}<span className="text-[10px] font-normal text-slate-400 ml-0.5">명</span></p>
            <div className="mt-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${stats.total > 0 ? (stats.paidCount / stats.total) * 100 : 0}%` }}
               />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Left: Registration Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 sticky top-2">
              <h2 className="text-[11px] font-black mb-2 flex items-center gap-1.5 text-slate-700 border-b pb-1.5 uppercase tracking-wider">
                <UserPlus size={14} className="text-blue-600" />
                신규 등록
              </h2>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5 ml-0.5">학년/구분</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-bold text-xs"
                    >
                      {grades.map(g => <option key={g} value={g}>{g}학년</option>)}
                      <option value="teacher">교직원</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5 ml-0.5">성명</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="이름"
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="flex flex-col items-center justify-center gap-1 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all text-center">
                    <input
                      type="checkbox"
                      checked={formData.isAttending}
                      onChange={(e) => setFormData({...formData, isAttending: e.target.checked})}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span className="text-[9px] font-bold text-slate-600">참여</span>
                  </label>

                  <label className="flex flex-col items-center justify-center gap-1 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all text-center">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                      className="w-3.5 h-3.5 rounded text-amber-600"
                    />
                    <span className="text-[9px] font-bold text-slate-600">납부</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!user}
                  className="w-full py-2 bg-blue-600 text-white text-[11px] font-black rounded-lg hover:bg-blue-700 transition-all disabled:bg-slate-300 shadow-sm uppercase tracking-widest"
                >
                  명단 추가
                </button>
              </form>
            </div>
          </div>

          {/* Right: List & Filters */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[480px]">
              {/* Filter Bar */}
              <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-200 flex flex-row gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    type="text"
                    placeholder="이름 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Filter size={12} className="text-slate-400" />
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="p-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                  >
                    <option value="all">전체</option>
                    {grades.map(g => <option key={g} value={g}>{g}학년</option>)}
                    <option value="teacher">교직원</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <RefreshCw className="animate-spin mb-2" size={24} />
                    <p className="text-[10px]">로딩 중...</p>
                  </div>
                ) : (
                  <table className="w-full text-left table-fixed border-collapse">
                    <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-tighter font-black border-b border-slate-100">
                      <tr>
                        <th className="px-3 py-1.5 w-16">구분</th>
                        <th className="px-3 py-1.5">이름</th>
                        <th className="px-3 py-1.5 text-center w-20">참여</th>
                        <th className="px-3 py-1.5 text-center w-16">회비</th>
                        <th className="px-3 py-1.5 text-right w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredList.length > 0 ? (
                        filteredList.map((person) => (
                          <tr key={person.id} className="hover:bg-blue-50/20 transition-colors group">
                            <td className="px-3 py-1 text-[9px]">
                              <span className="inline-flex items-center gap-0.5 font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                {person.grade === 'teacher' ? '교' : person.grade === 'other' ? '기' : `${person.grade}학`}
                              </span>
                            </td>
                            <td className="px-3 py-1 text-[11px] font-bold text-slate-700 truncate">{person.name}</td>
                            <td className="px-3 py-1">
                              <button 
                                onClick={() => toggleStatus(person.id, 'isAttending', person.isAttending)}
                                className={`mx-auto flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black transition-all ${
                                  person.isAttending 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {person.isAttending ? <CheckCircle size={9} /> : <XCircle size={9} />}
                                {person.isAttending ? '참여' : '불참'}
                              </button>
                            </td>
                            <td className="px-3 py-1">
                              <button 
                                onClick={() => toggleStatus(person.id, 'isPaid', person.isPaid)}
                                className="mx-auto flex justify-center text-amber-500 hover:scale-110 transition-transform"
                              >
                                {person.isPaid ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-200" />}
                              </button>
                            </td>
                            <td className="px-3 py-1 text-right">
                              <button 
                                onClick={() => deleteEntry(person.id)}
                                className="p-1 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-3 py-10 text-center text-slate-300 text-[10px] italic font-medium">
                            데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
