import React from 'react';
import { BookOpen, Calendar, MapPin, Users, Award, X, Sparkles } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              &ldquo;Musiqi Labirinti&rdquo; &mdash; Turnir Əsasnaməsi və Qaydalar
            </h2>
            <p className="text-xs text-slate-400">
              18 Sentyabr Milli Musiqi Günü münasibətilə rəsmi yarışma proqramı
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tarix</span>
              <span className="text-xs font-bold text-white">18.09.2026</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Məkan</span>
              <span className="text-xs font-bold text-white truncate block">
                2 saylı Sumqayıt &ldquo;ASAN Xidmət&rdquo;
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">İştirakçılar</span>
              <span className="text-xs font-bold text-white">4 komanda (Hərəsində 4 nəfər)</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 mb-6 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong>Layihənin təsviri:</strong> 2 saylı Sumqayıt regional &ldquo;ASAN Xidmət&rdquo; mərkəzi tərəfindən 18 sentyabr Milli Musiqi günü ilə əlaqədar mərkəz könüllülərinin iştirakı ilə musiqi yarışı təşkil edilir.
          </p>
          <p>
            <strong>Layihənin məqsədi:</strong> Könüllülərin iştirakı ilə Milli Musiqi Gününün maraqlı, əyləncəli və intellektual aspektdə keçirilməsini təşkil etmək.
          </p>
          <p>
            <strong>Əsas prinsip:</strong> Komandalar musiqiləri tanımaq, sürətli cavab vermək və topladıqları xallarla növbəti mərhələyə keçmək uğrunda yarışırlar.
          </p>
        </div>

        {/* 4 Stages Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5 px-3">Tur</th>
                <th className="py-2.5 px-3">Mərhələnin adı</th>
                <th className="py-2.5 px-3">Oyun qaydası</th>
                <th className="py-2.5 px-3">Xal sistemi</th>
                <th className="py-2.5 px-3">Nəticə</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-bold text-amber-400">1</td>
                <td className="py-3 px-3 font-bold text-white font-display">Musiqi Şifrəsi</td>
                <td className="py-3 px-3 leading-relaxed">
                  4 kateqoriyanın hər birində 4 mahnı (Retro mahnılar, 90-cı illər, Kino musiqiləri, Xalq mahnıları). Komandalar nömrələri seçir və səslənən musiqini tapır.
                </td>
                <td className="py-3 px-3 font-bold text-emerald-400 whitespace-nowrap">
                  Hər düzgün cavab — 30 xal
                </td>
                <td className="py-3 px-3 text-teal-300 font-semibold">
                  Bütün 4 komanda növbəti mərhələyə keçir.
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-bold text-amber-400">2</td>
                <td className="py-3 px-3 font-bold text-white font-display">Vaxt Dueli</td>
                <td className="py-3 px-3 leading-relaxed">
                  10 mahnı səsləndirilir. İlk işarə edən komanda cavab hüququ qazanır. Səhv verildikdə hüquq digər komandalara keçir.
                </td>
                <td className="py-3 px-3 font-bold text-emerald-400 whitespace-nowrap">
                  Hər düzgün cavab — 50 xal
                </td>
                <td className="py-3 px-3 text-rose-400 font-semibold">
                  Ən az xallı 1 komanda tərk edir (3 komanda qalır).
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-bold text-amber-400">3</td>
                <td className="py-3 px-3 font-bold text-white font-display">Ritm Qarşıdurması</td>
                <td className="py-3 px-3 leading-relaxed">
                  8 mahnı səsləndirilir. Komandalardan musiqini neçə saniyədə tapa biləcəkləri soruşulur və tapılma müddətinə uyğun xal verilir.
                </td>
                <td className="py-3 px-3 leading-relaxed">
                  <div className="font-bold text-emerald-400">0–10 san. — 100 xal</div>
                  <div>10–20 san. — 70 xal</div>
                  <div>20–30 san. — 40 xal</div>
                  <div>30–40 san. — 20 xal</div>
                  <div>40–50 san. — 10 xal</div>
                  <div className="text-slate-500">50+ san. — 0 xal</div>
                </td>
                <td className="py-3 px-3 text-amber-300 font-semibold">
                  Ən az xallı 1 komanda tərk edir (Finala 2 komanda yüksəlir).
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-bold text-amber-400">4</td>
                <td className="py-3 px-3 font-bold text-white font-display">Son Akkordlar</td>
                <td className="py-3 px-3 leading-relaxed">
                  Finala çıxmış 2 komandanın hər biri 1 nümayəndə seçir. Hər finalçıya 1 dəqiqə ərzində 7 mahnı səsləndirilir.
                </td>
                <td className="py-3 px-3 font-bold text-amber-400">
                  Düzgün tapılan mahnıların sayı
                </td>
                <td className="py-3 px-3 text-amber-400 font-black">
                  Daha çox mahnı tapan komanda yarışın ÇEMPİONU olur!
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Aydındır, Yarışmaya Qayıt
          </button>
        </div>
      </div>
    </div>
  );
};
