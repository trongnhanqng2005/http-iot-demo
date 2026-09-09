import React from 'react';
import {
  X,
  ShieldCheck,
  Code2,
  Layers,
  AlertTriangle,
  BookOpen,
  Check,
  Copy,
  Cpu,
} from 'lucide-react';
import { HTTP_KNOWLEDGE_TOPICS, STATUS_CODES_MAP } from '../data/httpKnowledge';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  initialTopicId = 'http-vs-https',
}) => {
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>(initialTopicId);
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialTopicId) {
      setSelectedTopicId(initialTopicId);
    }
  }, [initialTopicId]);

  if (!isOpen) return null;

  const activeTopic = HTTP_KNOWLEDGE_TOPICS.find((t) => t.id === selectedTopicId) || HTTP_KNOWLEDGE_TOPICS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Cẩm Nang Giao Thức HTTP & Xác Thực IoT
              </h3>
              <p className="text-xs text-slate-400">
                Kiến thức nền tảng thực chiến cho kỹ sư nhúng và lập trình viên IoT
              </p>
            </div>
          </div>

          <button
            id="btn-close-knowledge-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar tabs + Content view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-3 space-y-1 overflow-y-auto shrink-0">
            {HTTP_KNOWLEDGE_TOPICS.map((topic) => {
              const isActive = topic.id === selectedTopicId;
              return (
                <button
                  key={topic.id}
                  id={`btn-topic-${topic.id}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="truncate">{topic.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    {topic.badge}
                  </span>
                </button>
              );
            })}

            <button
              id="btn-topic-status-codes"
              onClick={() => setSelectedTopicId('status-codes')}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between gap-2 ${
                selectedTopicId === 'status-codes'
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span>Bảng Tra Cứu Mã Trạng Thái HTTP</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                Codes
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
            {selectedTopicId === 'status-codes' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-100">
                    Bảng Tra Cứu Mã Trạng Thái HTTP Thường Gặp Trong IoT
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Hiểu ý nghĩa từng mã trạng thái để viết logic xử lý điều kiện (switch/case) chính xác trên vi điều khiển.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {Object.values(STATUS_CODES_MAP).map((st) => (
                    <div
                      key={st.code}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              st.category === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : st.category === 'redirect'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : st.category === 'client_error'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {st.code} {st.text}
                          </span>
                          <span className="text-slate-300 font-semibold">{st.meaning}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 pl-1 border-l-2 border-slate-700 text-[11px] leading-relaxed">
                        <strong className="text-cyan-300">Xử lý trong IoT:</strong> {st.iotContext}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {activeTopic.badge}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                    {activeTopic.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{activeTopic.summary}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: activeTopic.content
                        .replace(/### (.*)/g, '<h5 class="text-sm font-bold text-cyan-300 mt-4 mb-2">$1</h5>')
                        .replace(/## (.*)/g, '<h4 class="text-base font-bold text-slate-100 mt-4 mb-2">$1</h4>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded">$1</code>')
                        .replace(/\| (.*) \|/g, (match) => {
                          return `<div class="font-mono text-[11px]">${match}</div>`;
                        })
                        .replace(/\n\n/g, '<br/><br/>'),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Kiến thức được biên soạn chuyên biệt cho Lập trình viên Vi điều khiển & IoT</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
