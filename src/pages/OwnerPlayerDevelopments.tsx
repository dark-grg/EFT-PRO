import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Search, UploadCloud, Trash2, Plus, Loader2, Edit3, X, CheckCircle, AlertCircle, Key
} from 'lucide-react';
import { PlayerDevelopmentsApi, PlayerDevelopmentRecord } from '../services/api/playerDevelopmentsApi';
import { toast } from 'react-hot-toast';

export const OwnerPlayerDevelopments: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem('EFT_PRO_ADMIN_KEY') || 'eft-pro-admin-key');
  const [records, setRecords] = useState<PlayerDevelopmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form fields
  const [playerName, setPlayerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [shooting, setShooting] = useState('0');
  const [passing, setPassing] = useState('0');
  const [dribbling, setDribbling] = useState('0');
  const [dexterity, setDexterity] = useState('0');
  const [lowerBody, setLowerBody] = useState('0');
  const [aerial, setAerial] = useState('0');
  const [defending, setDefending] = useState('0');
  const [gk1, setGk1] = useState('0');
  const [gk2, setGk2] = useState('0');
  const [gk3, setGk3] = useState('0');

  // Bulk import
  const [bulkInput, setBulkInput] = useState('');
  const [bulkResult, setBulkResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await PlayerDevelopmentsApi.getAll();
      setRecords(data);
    } catch (err: any) {
      toast.error('فشل تحميل التطويرات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAdminKey = (key: string) => {
    setAdminKey(key);
    localStorage.setItem('EFT_PRO_ADMIN_KEY', key);
    toast.success('تم حفظ مفتاح المشرف بنجاح');
  };

  const resetForm = () => {
    setEditingRecordId(null);
    setPlayerName('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setShooting('0');
    setPassing('0');
    setDribbling('0');
    setDexterity('0');
    setLowerBody('0');
    setAerial('0');
    setDefending('0');
    setGk1('0');
    setGk2('0');
    setGk3('0');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: PlayerDevelopmentRecord) => {
    setEditingRecordId(record.id);
    setPlayerName(record.playerName);
    setImageUrl(record.imageUrl);
    setImagePreview(record.imageUrl);
    setImageFile(null);
    setShooting(String(record.shooting));
    setPassing(String(record.passing));
    setDribbling(String(record.dribbling));
    setDexterity(String(record.dexterity));
    setLowerBody(String(record.lowerBody));
    setAerial(String(record.aerial));
    setDefending(String(record.defending));
    setGk1(String(record.gk1));
    setGk2(String(record.gk2));
    setGk3(String(record.gk3));
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. يرجى اختيار JPG, JPEG, PNG, أو WEBP');
      return;
    }

    // Size check (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Automatically upload
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await PlayerDevelopmentsApi.uploadImage(file, adminKey);
      setImageUrl(uploadedUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (err: any) {
      toast.error(err?.message || 'فشل رفع الصورة');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      toast.error('اسم اللاعب مطلوب');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('صورة بطاقة اللاعب مطلوبة');
      return;
    }

    const parseNum = (val: string, name: string) => {
      const n = Number(val);
      if (isNaN(n) || !isFinite(n) || n < 0) {
        throw new Error(`قيمة ${name} يجب أن تكون رقماً صحيحاً >= 0`);
      }
      return Math.floor(n);
    };

    let shootingNum, passingNum, dribblingNum, dexterityNum, lowerBodyNum, aerialNum, defendingNum, gk1Num, gk2Num, gk3Num;

    try {
      shootingNum = parseNum(shooting, 'Shooting');
      passingNum = parseNum(passing, 'Passing');
      dribblingNum = parseNum(dribbling, 'Dribbling');
      dexterityNum = parseNum(dexterity, 'Dexterity');
      lowerBodyNum = parseNum(lowerBody, 'Lower Body');
      aerialNum = parseNum(aerial, 'Aerial');
      defendingNum = parseNum(defending, 'Defending');
      gk1Num = parseNum(gk1, 'GK1');
      gk2Num = parseNum(gk2, 'GK2');
      gk3Num = parseNum(gk3, 'GK3');
    } catch (err: any) {
      toast.error(err.message);
      return;
    }

    const payload = {
      playerName: playerName.trim(),
      imageUrl: imageUrl.trim(),
      shooting: shootingNum,
      passing: passingNum,
      dribbling: dribblingNum,
      dexterity: dexterityNum,
      lowerBody: lowerBodyNum,
      aerial: aerialNum,
      defending: defendingNum,
      gk1: gk1Num,
      gk2: gk2Num,
      gk3: gk3Num
    };

    try {
      if (editingRecordId) {
        await PlayerDevelopmentsApi.update(editingRecordId, payload, adminKey);
        toast.success('تم تحديث التطويرة بنجاح');
      } else {
        await PlayerDevelopmentsApi.create(payload, adminKey);
        toast.success('تم إضافة التطويرة بنجاح');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'فشل حفظ التطويرة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه التطويرة؟')) return;
    try {
      await PlayerDevelopmentsApi.delete(id, adminKey);
      toast.success('تم حذف التطويرة بنجاح');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'فشل حذف التطويرة');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkInput.trim()) {
      toast.error('يرجى إدخال بيانات JSON للاستيراد');
      return;
    }

    try {
      const parsed = JSON.parse(bulkInput);
      const list = Array.isArray(parsed) ? parsed : parsed.records || [];
      if (list.length === 0) {
        toast.error('لم يتم العثور على سجلات صحيحة');
        return;
      }

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        try {
          if (!item.playerName || !item.imageUrl) {
            throw new Error(`سجل رقم ${i + 1}: اسم اللاعب والصورة مطلوبان`);
          }
          await PlayerDevelopmentsApi.create({
            playerName: String(item.playerName),
            imageUrl: String(item.imageUrl),
            shooting: Number(item.shooting ?? 0),
            passing: Number(item.passing ?? 0),
            dribbling: Number(item.dribbling ?? 0),
            dexterity: Number(item.dexterity ?? 0),
            lowerBody: Number(item.lowerBody ?? item.lower_body ?? 0),
            aerial: Number(item.aerial ?? 0),
            defending: Number(item.defending ?? 0),
            gk1: Number(item.gk1 ?? 0),
            gk2: Number(item.gk2 ?? 0),
            gk3: Number(item.gk3 ?? 0),
          }, adminKey);
          imported++;
        } catch (err: any) {
          failed++;
          errors.push(`سجل ${i + 1} (${item.playerName || 'بدون اسم'}): ${err.message}`);
        }
      }

      setBulkResult({ imported, failed, errors });
      toast.success(`تم استيراد ${imported} وباء فشل ${failed}`);
      loadData();
    } catch (err: any) {
      toast.error(`خطأ في صيغة JSON: ${err.message}`);
    }
  };

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return records;
    return records.filter(r => r.playerName.toLowerCase().includes(q));
  }, [records, searchTerm]);

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1221] p-6 rounded-2xl border border-blue-900/30">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-black">إدارة وتدقيق تطويرات اللاعبين (Owner Dashboard)</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            إضافة وتعديل وحذف وتخزين تطويرات اللاعبين بدقة مباشرة على Cloudflare Worker & D1.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Key Setting */}
          <div className="flex items-center gap-2 bg-[#050B14] px-3 py-2 rounded-xl border border-blue-900/40">
            <Key className="w-4 h-4 text-amber-400" />
            <input 
              type="password"
              placeholder="مفتاح المشرف (Admin Key)"
              value={adminKey}
              onChange={(e) => handleSaveAdminKey(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-36"
            />
          </div>

          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>استيراد جماعي (JSON)</span>
          </button>

          <button 
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تطويرة لاعب</span>
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B1221] p-4 rounded-2xl border border-blue-900/30">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="🔎 بحث سريع عن لاعب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-gray-400">
          إجمالي السجلات: <strong className="text-white font-mono">{records.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B1221] rounded-2xl border border-blue-900/30 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-xs text-gray-400">جاري تحميل السجلات من السيرفر...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-sm font-bold text-gray-300">لا توجد سجلات</p>
            <p className="text-xs text-gray-500">قم بإضافة تطويرة جديدة للبدء.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#050B14] text-gray-400 uppercase font-bold border-b border-blue-900/40">
                <tr>
                  <th className="p-4">الصورة</th>
                  <th className="p-4">اللاعب</th>
                  <th className="p-4">التطوير (10 أرقام)</th>
                  <th className="p-4">الإصدار / التحديث</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {filteredRecords.map((r) => {
                  const progStr = [
                    r.shooting, r.passing, r.dribbling, r.dexterity,
                    r.lowerBody, r.aerial, r.defending, r.gk1, r.gk2, r.gk3
                  ].join(' / ');

                  return (
                    <tr key={r.id} className="hover:bg-[#131E32]/60 transition">
                      <td className="p-4">
                        <div className="w-12 h-16 rounded-lg bg-[#050B14] overflow-hidden flex items-center justify-center border border-white/10">
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.playerName} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[9px] text-gray-500">بدون</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">
                        {r.playerName}
                      </td>
                      <td className="p-4 font-mono text-blue-400 tracking-wider" dir="ltr">
                        {progStr}
                      </td>
                      <td className="p-4 text-gray-400">
                        v{r.version || 1} — {new Date(r.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-400 transition"
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-400 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
          <div className="bg-[#0B1221] border border-blue-900/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative my-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white">
              {editingRecordId ? 'تعديل تطويرة لاعب' : 'إضافة تطويرة لاعب جديدة'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">صورة بطاقة اللاعب</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-28 rounded-2xl bg-[#050B14] overflow-hidden flex items-center justify-center border border-blue-900/40 relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] text-gray-500 text-center px-1">رفع صورة</span>
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer px-4 py-2.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition inline-flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      <span>اختر صورة من الجهاز (JPG/PNG/WEBP)</span>
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageFileChange} className="hidden" />
                    </label>
                    <input 
                      type="text"
                      placeholder="أو أدخل رابط الصورة مباشرة (URL)"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Player Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">اسم اللاعب</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: Lionel Messi"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 10 Stats in Strict Order */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-xs font-bold text-blue-400">أرقام التطوير (بالترتيب الإلزامي):</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">1. Shooting</label>
                    <input type="number" min="0" value={shooting} onChange={(e) => setShooting(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">2. Passing</label>
                    <input type="number" min="0" value={passing} onChange={(e) => setPassing(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">3. Dribbling</label>
                    <input type="number" min="0" value={dribbling} onChange={(e) => setDribbling(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">4. Dexterity</label>
                    <input type="number" min="0" value={dexterity} onChange={(e) => setDexterity(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">5. Lower Body</label>
                    <input type="number" min="0" value={lowerBody} onChange={(e) => setLowerBody(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">6. Aerial</label>
                    <input type="number" min="0" value={aerial} onChange={(e) => setAerial(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">7. Defending</label>
                    <input type="number" min="0" value={defending} onChange={(e) => setDefending(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">8. GK1</label>
                    <input type="number" min="0" value={gk1} onChange={(e) => setGk1(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">9. GK2</label>
                    <input type="number" min="0" value={gk2} onChange={(e) => setGk2(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">10. GK3</label>
                    <input type="number" min="0" value={gk3} onChange={(e) => setGk3(e.target.value)} className="w-full bg-[#050B14] border border-blue-900/40 rounded-xl px-3 py-2 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 text-white"
                >
                  حفظ التطويرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#0B1221] border border-blue-900/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white">استيراد جماعي (JSON)</h2>
            <p className="text-xs text-gray-400">
              قم بلصق مصفوفة JSON تحتوي على بيانات اللاعبين والتطويرات. إذا فشل سجل معين لن تتوقف العملية وسيوضح التقرير أسباب الفشل.
            </p>

            <textarea
              rows={8}
              placeholder={`[\n  {\n    "playerName": "Player 1",\n    "imageUrl": "https://...",\n    "shooting": 11,\n    "passing": 9,\n    "dribbling": 9,\n    "dexterity": 0,\n    "lowerBody": 0,\n    "aerial": 4,\n    "defending": 0,\n    "gk1": 0,\n    "gk2": 0,\n    "gk3": 0\n  }\n]`}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full bg-[#050B14] border border-blue-900/40 rounded-2xl p-4 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />

            {bulkResult && (
              <div className="bg-[#050B14] p-4 rounded-2xl border border-blue-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Imported: {bulkResult.imported}</span>
                  <span className="text-red-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Failed: {bulkResult.failed}</span>
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-white/5 max-h-32 overflow-y-auto text-gray-400 text-[11px]">
                    {bulkResult.errors.map((err, idx) => (
                      <div key={idx} className="text-red-300 font-mono">{err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleBulkImport}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 text-white"
            >
              بدء الاستيراد الجماعي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
