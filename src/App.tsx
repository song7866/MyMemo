/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  FileText,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "mymemo.notes";

// --- Seed Data ---
const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "디자인 시스템의 기본 컬러와 타이포그래피 원칙을 준수하세요. 접근성을 고려하여 대비율을 확인하는 것이 중요합니다.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 디자인 오브 에브리데이 띵스\n3. 생각하는 디자인\n4. 리팩토링",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "개인용 메모 서비스 고도화: 동기화 기능 추가, 이미지 첨부 기능, 마크다운 지원 등.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString()
  }
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: "", body: "", tags: "" });

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
        setNotes(SEED_DATA);
      }
    } else {
      setNotes(SEED_DATA);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  // --- Derived State ---
  const tagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm, selectedTag]);

  // --- Handlers ---
  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({ 
        title: note.title, 
        body: note.body, 
        tags: note.tags.join(", ") 
      });
    } else {
      setEditingNote(null);
      setFormData({ title: "", body: "", tags: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({ title: "", body: "", tags: "" });
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    const newTags = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t !== "");

    if (editingNote) {
      setNotes(prev => prev.map(n => 
        n.id === editingNote.id 
          ? { 
              ...n, 
              title: formData.title, 
              body: formData.body, 
              tags: newTags,
              updatedAt: new Date().toISOString() 
            } 
          : n
      ));
    } else {
      const newNote: Note = {
        id: Date.now(),
        title: formData.title,
        body: formData.body,
        tags: newTags,
        updatedAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말 이 메모를 삭제하시겠습니까?")) {
      setNotes(prev => {
        const updated = prev.filter(n => n.id !== id);
        // If it's the last item, we need to clear storage explicitly 
        // because the observer effect won't trigger for empty if we use the length > 0 guard
        if (updated.length === 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">
      {/* Background Decorative Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setSelectedTag(null); setSearchTerm("");}}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">MyMemo</h1>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="메모 검색..."
              className="w-full bg-black/20 border border-white/10 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-full py-2.5 pl-11 pr-4 text-sm transition-all outline-hidden text-white placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="search-input"
            />
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            id="new-memo-btn"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>새 메모</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col gap-8">
          <div className="glass-effect rounded-3xl p-6 bg-white/3 backdrop-blur-xl border border-white/10">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter size={12} />
              필터
            </h2>
            <nav className="space-y-1">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${!selectedTag ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'}`}
              >
                <span>전체 메모</span>
                <span className="text-[10px] opacity-60 bg-white/10 px-2 py-0.5 rounded-md">{notes.length}</span>
              </button>
            </nav>

            {tagsWithCounts.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TagIcon size={12} />
                  태그 목록
                </h2>
                <div className="space-y-1">
                  {tagsWithCounts.map(([tag, count]) => (
                    <button 
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${selectedTag === tag ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <span className="truncate flex items-center gap-2">
                        {tag}
                      </span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-1">현재 상태</p>
            <p className="text-xl font-bold text-white truncate">{selectedTag ? selectedTag : '전체 보기'}</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {selectedTag ? selectedTag : '메모 라이브러리'}
              </h2>
              <p className="text-sm text-slate-500">
                {searchTerm ? `"${searchTerm}" 검색 결과` : '모든 생각을 한 곳에서 관리하세요.'}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
              {filteredNotes.length} Notes / Total {notes.length}
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  onClick={() => openModal(note)}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-7 transition-all hover:bg-white/8 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col h-[280px]"
                  id={`note-${note.id}`}
                >
                  <button 
                    onClick={(e) => handleDelete(note.id, e)}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    title="메모 삭제"
                  >
                    <Trash2 size={16} />
                  </button>

                  <h3 className="font-bold text-xl leading-tight mb-4 text-white hover:text-indigo-300 transition-colors line-clamp-2 pr-8">{note.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-5 flex-1 whitespace-pre-wrap">{note.body}</p>
                  
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-[10px] font-bold text-slate-500 px-1 py-1">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center text-slate-600 mb-6 border border-white/5">
                <Search size={40} />
              </div>
              <p className="text-xl font-bold text-slate-300 mb-2">검색 결과가 없습니다.</p>
              <p className="text-slate-500 max-w-xs mx-auto">새로운 메모를 작성하거나 필터를 초기화해보세요.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              id="memo-modal"
            >
              <div className="px-10 pt-10 pb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {editingNote ? '메모 수정' : '새 메모 작성'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-10 py-4 overflow-y-auto space-y-7 flex-1 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">제목</label>
                  <input 
                    type="text" 
                    placeholder="제목을 입력하세요..."
                    className="w-full text-xl font-bold bg-white/5 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 transition-all outline-hidden text-white placeholder:text-slate-600"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">내용</label>
                  <textarea 
                    placeholder="생각을 기록해보세요..."
                    className="w-full min-h-[220px] bg-white/5 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-slate-300 leading-relaxed resize-none outline-hidden placeholder:text-slate-600 focus:ring-0"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  />
                </div>

                <div className="space-y-2 pb-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">태그</label>
                  <div className="relative">
                    <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="디자인, 가이드, 업무 (쉼표로 구분)"
                      className="w-full bg-white/5 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 pl-12 text-sm transition-all outline-hidden text-slate-300 placeholder:text-slate-600"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-black/20 border-t border-white/5 flex gap-4">
                <button 
                  onClick={closeModal}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
                >
                  취소하기
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.title.trim()}
                  className="flex-1 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-extrabold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-xl shadow-indigo-500/20"
                  id="save-memo-btn"
                >
                  저장 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
