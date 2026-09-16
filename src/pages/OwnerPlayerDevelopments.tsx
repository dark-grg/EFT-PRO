import React, { useState, useEffect } from 'react';
import { PlayerDevelopmentsApi, PlayerDevelopmentRecord } from '../services/api/playerDevelopmentsApi';
import { Plus, Trash2, Edit, Upload, Shield, Key, Search, X, CheckCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

const STAT_LABELS = [
  'Shooting',
  'Passing',
  'Dribbling',
  'Dexterity',
  'Lower Body Strength',
  'Aerial Strength',
  'Defending',
  'GK1',
  'GK2',
  'GK3'
];

export const OwnerPlayerDevelopments: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PlayerDevelopmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminKey, setAdminKey] = useState(PlayerDevelopmentsApi.getAdminKey());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');

  // Form fields
  const [playerName, setPlayerName] = useState('');
  const [cardType, setCardType] = useState('Big Time');
  const [cardVersion, setCardVersion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingImageKey, setExistingImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 10 stats state
  const [stats, setStats] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await PlayerDevelopmentsApi.getAll();
      setRecords(data);
    } catch (e) {
      toast.error('فشل تحميل قائمة اللاعبين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAdminKey = (e: React.FormEvent) => {
    e.preventDefault();
    PlayerDevelopmentsApi.setAdminKey(adminKey);
    toast.success('تم حفظ مفتاح المشرف بنجاح');
  };

  const openAddModal = () => {
    setEditingRecordId(null);
    setPlayerName('');
    setCardType('Big Time');
    setCardVersion('');
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setExistingImageKey(null);
    setStats([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setIsModalOpen(true);
  };

  const openEditModal = (rec: PlayerDevelopmentRecord) => {
    setEditingRecordId(rec.id);
    setPlayerName(rec.playerName);
    setCardType(rec.cardType);
    setCardVersion(rec.cardVersion || '');
    setImageFile(null);
    setImagePreview(rec.imageUrl || null);
    setExistingImageUrl(rec.imageUrl || null);
    setExistingImageKey(rec.imageKey || null);
    setStats([
      rec.shooting,
      rec.passing,
      rec.dribbling,
      rec.dexterity,
      rec.lowerBody,
      rec.aerial,
      rec.defending,
      rec.gk1,
      rec.gk2,
      rec.gk3
    ]);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        toast.error('نوع الملف غير مدعوم. يجلب استخدام JPG أو PNG أو WEBP.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً (أقصى حد 10 ميجابايت)');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !cardType.trim()) {
      toast.error('يرجى إدخال اسم اللاعب ونوع البطاقة');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = existingImageUrl;
      let imageKey = existingImageKey;

      if (imageFile) {
        const uploadResult = await PlayerDevelopmentsApi.uploadImage(imageFile);
        imageUrl = uploadResult.imageUrl;
        imageKey = uploadResult.imageKey;
      }

      const payload = {
        playerName: playerName.trim(),
        cardType: cardType.trim(),
        cardVersion: cardVersion.trim(),
        imageUrl,
        imageKey,
        shooting: stats[0],
        passing: stats[1],
        dribbling: stats[2],
        dexterity: stats[3],
        lowerBody: stats[4],
        aerial: stats[5],
        defending: stats[6],
        gk1: stats[7],
        gk2: stats[8],
        gk3: stats[9]
      };

      if (editingRecordId) {
        await PlayerDevelopmentsApi.update(editingRecordId, payload);
        toast.success('تم تعديل تطوير اللاعب بنجاح');
      } else {
        await PlayerDevelopmentsApi.create(payload);
        toast.success('تم إضافة تطوير اللاعب بنجاح');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ أثناء الحفظ. تأكد من صلاحيات المشرف.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) return;
    try {
      await PlayerDevelopmentsApi.delete(id);
      toast.success('تم الحذف بنجاح');
      loadData();
    } catch (e: any) {
      toast.error(e?.message || 'فشل الحذف. تأكد من صلاحيات المشرف.');
    }
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        toast.error('يجب أن يكون الملف بصيغة مصفوفة JSON صالحة [ ... ]');
        return;
      }
      setIsUploading(true);
      const count = await PlayerDevelopmentsApi.bulkCreate(parsed);
      toast.success(`تم استيراد ${count} لاعب بنجاح`);
      setIsBulkOpen(false);
      setBulkJson('');
      loadData();
    } catch (e: any) {
      toast.error('صيغة JSON غير صالحة');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cardType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.cardVersion && r.cardVersion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050B14] text-white pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-[#0B1221] border-b border-blue-900/30 px-4 py-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 transition border border-blue-500/20"
            >
              العودة للوحة المشرف
            </button>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              إدارة تطويرات اللاعبين (Owner Dashboard)
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkOpen(true)}
              className="px-4 py-2 bg-blue-950/60 hover:bg-blue-900 text-blue-300 rounded-xl text-xs font-bold transition border border-blue-500/30 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              استيراد جماعي
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              إضافة لاعب جديد
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Admin Key Config Box */}
        <div className="bg-[#0B1221] border border-blue-900/40 rounded-2xl p-4 shadow-md">
          <form onSubmit={handleSaveAdminKey} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-bold whitespace-nowrap">
              <Key className="w-4 h-4" />
              مفتاح المشرف (Admin Secret):
            </div>
            <input 
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="أدخل مفتاح المشرف..."
              className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 text-xs font-bold rounded-xl border border-blue-500/30 transition whitespace-nowrap"
            >
              حفظ المفتاح
            </button>
          </form>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="بحث في اللاعبين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1221] border border-blue-900/40 rounded-xl pr-10 pl-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-400 font-mono">
            إجمالي اللاعبين في D1: <strong className="text-white">{records.length}</strong>
          </div>
        </div>

        {/* Players List Table / Grid */}
        {isLoading ? (
          <div className="bg-[#0B1221] rounded-2xl p-16 text-center border border-blue-900/30 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-xs text-gray-400">جاري جلب البيانات من السيرفر...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-[#0B1221] rounded-2xl p-12 text-center border border-blue-900/30 space-y-2">
            <p className="text-sm font-bold text-gray-300">لا توجد سجلات</p>
            <p className="text-xs text-gray-500">قم بإضافة لاعب جديد أو استيراد البيانات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecords.map((rec) => {
              const progressionArray = [
                rec.shooting,
                rec.passing,
                rec.dribbling,
                rec.dexterity,
                rec.lowerBody,
                rec.aerial,
                rec.defending,
                rec.gk1,
                rec.gk2,
                rec.gk3
              ];
              return (
                <div key={rec.id} className="bg-[#0B1221] border border-blue-900/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-20 bg-[#050B14] rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                      {rec.imageUrl ? (
                        <img src={rec.imageUrl} alt={rec.playerName} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] text-gray-500 text-center px-1">لا توجد صورة</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-white truncate">{rec.playerName}</h3>
                      <p className="text-xs text-blue-400">{rec.cardType} {rec.cardVersion && `• ${rec.cardVersion}`}</p>
                      <div className="text-[10px] text-gray-500 mt-1 font-mono">
                        v{rec.version || 1} • {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : 'محدث'}
                      </div>
                    </div>
                  </div>

                  {/* Stats progression */}
                  <div className="bg-[#050B14] rounded-xl p-2.5 border border-white/5 font-mono text-[11px] text-blue-300 tracking-wider text-center" dir="ltr">
                    {progressionArray.join(' • ')}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900 text-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-blue-500/20"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1221] border border-blue-950 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-white">
                {editingRecordId ? 'تعديل تطوير اللاعب' : 'إضافة لاعب جديد'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold">اسم اللاعب *</label>
                    <input 
                      type="text"
                      required
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Lionel Messi"
                      className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold">نوع البطاقة *</label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Big Time">Big Time</option>
                      <option value="Epic">Epic</option>
                      <option value="Show Time">Show Time</option>
                      <option value="Highlight">Highlight</option>
                      <option value="Featured">Featured</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold">نسخة البطاقة / الموسم (اختياري)</label>
                  <input 
                    type="text"
                    value={cardVersion}
                    onChange={(e) => setCardVersion(e.target.value)}
                    placeholder="2015 أو World Cup"
                    className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Card Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold">صورة البطاقة (R2 Upload)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 bg-[#050B14] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-gray-500 text-center px-1">بدون صورة</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="w-full text-xs text-gray-400 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-950 file:text-blue-300 hover:file:bg-blue-900 transition cursor-pointer"
                      />
                      <p className="text-[10px] text-gray-500">يدعم JPG, PNG, WEBP (بحد أقصى 10 ميجابايت).</p>
                    </div>
                  </div>
                </div>

                {/* 10 Stats Inputs */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold">قيم التطوير الـ 10 (بالترتيب الإلزامي):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {STAT_LABELS.map((label, idx) => (
                      <div key={label} className="bg-[#050B14] p-2 rounded-xl border border-white/5 space-y-1 text-center">
                        <span className="text-[10px] text-gray-400 block truncate">{label}</span>
                        <input 
                          type="number"
                          min="0"
                          max="99"
                          value={stats[idx]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newStats = [...stats];
                            newStats[idx] = val;
                            setStats(newStats);
                          }}
                          className="w-full bg-[#0B1221] border border-blue-900/40 rounded-lg py-1 text-center text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                    حفظ اللاعب
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {isBulkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1221] border border-blue-950 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsBulkOpen(false)}
                className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-white">الاستيراد الجماعي (JSON)</h2>
              <p className="text-xs text-gray-400">أدخل مصفوفة JSON تحتوي على بيانات اللاعبين والتطويرات:</p>

              <textarea 
                rows={8}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder={`[\n  {\n    "playerName": "Lionel Messi",\n    "cardType": "Big Time",\n    "cardVersion": "2015",\n    "imageUrl": "https://...",\n    "shooting": 11,\n    "passing": 9,\n    "dribbling": 9,\n    "dexterity": 0,\n    "lowerBody": 0,\n    "aerial": 4,\n    "defending": 0,\n    "gk1": 0,\n    "gk2": 0,\n    "gk3": 0\n  }\n]`}
                className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={isUploading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  استيراد البيانات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
