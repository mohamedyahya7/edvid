# متابعة تنفيذ الريفاكتور (PROGRESS.md)

## 📊 الحالة العامة
- **المرحلة النشطة الحالية**: المرحلة 1: ريفاكتور وهيكلة الفرونت إند بالكامل (Clean Architecture & Full Modularization)
- **Git Branch**: `phase-1-react-native-ui` (في مجلد `frontend`)
- **تاريخ التحديث**: 2026-11-04

---

## 🚦 قائمة المهام التفصيلية للمرحلة 1

### 🎯 الحزمة 1.A: الأرشفة الآمنة وتطهير مسار Expo Router (منجزة بالكامل ✅)
- [x] **1.A.1**: إنشاء هيكل مجلد `frontend/legacy/` الفرعي بالكامل (`legacy/screens`, `legacy/components`, `legacy/hooks`, `legacy/services`, `legacy/api`).
- [x] **1.A.2**: نقل الملفات الميتة الصريحة (`ExploreScreen.legacy.tsx`, `VideoDetailScreen.legacy.tsx`, `AuthService.ts`, `useStorageState.ts`, `useVideoScreen.ts`) إلى `legacy/` لحفظها بنسبة 100%.
- [x] **1.A.3**: نقل `app/i18n` إلى `constants/i18n` وتطهير مجلد `app/` من ملفات الترجمة.
- [x] **1.A.4**: نقل مكونات `app/components/` (`ActivationModal`, `ActiveDownloads`, `QRCodeScanner`) إلى `components/` وتحديث الـ imports.
- [x] **1.A.5**: نقل كافة الشاشات من `app/screens/` إلى مجلد `frontend/screens/` المركزي، وإنشاء مسارات `app/select-grade.tsx` و `app/edit-profile.tsx` وتحديث كافة الـ routes.
- [x] **1.A.6**: تشغيل فحص الـ TypeScript والتأكد من نجاحه بصفر أخطاء (`tsc --noEmit`).

### 🎯 الحزمة 1.B: توحيد الـ Types والـ Units النقية (منجزة بالكامل ✅)
- [x] **1.B.1**: إنشاء `types/library.ts` لتعريف أنواع الفلاتر وحالات التخزين.
- [x] **1.B.2**: إنشاء دالة `utils/formatBytes.ts` النقية لحساب وتحويل أحجام الملفات بدقة (مع دعم اللغتين العربية والإنجليزية).
- [x] **1.B.3**: إنشاء دالة `utils/filterLibraryVideos.ts` النقية لعزل كافة شروط التصفية والفرز المتسلسلة دون أي اعتماد على React State.
- [x] **1.B.4**: بناء وتشغيل ملف الاختبارات الآلية `utils/__tests__/units.test.ts` والتحقق من نجاح كافة الـ Assertions.

### 🎯 الحزمة 1.C: تفتيت شاشة المكتبة والتحميلات `LibraryScreen` (منجزة بالكامل ✅)
- [x] **1.C.1**: بناء جزيئات المكتبة (`StorageMeter.tsx`, `FilterChipGroup.tsx`, `EmptyStateView.tsx`).
- [x] **1.C.2**: بناء Micro-Hooks المكتبة (`useLibraryVideos.ts`, `useLibraryFilters.ts`, `useLibraryActions.ts`).
- [x] **1.C.3**: بناء Organisms المكتبة (`LibraryStorageHeader.tsx`, `LibraryFilterSection.tsx`, `LibraryVideoList.tsx`).
- [x] **1.C.4**: أرشفة `LibraryScreen.tsx` القديم (741 سطراً) في `legacy/screens/LibraryScreen.legacy.tsx` وإعادة بنائه بالكامل في **71 سطراً فقط**، مع الحفاظ على التفاعلات الـ 12 بنسبة 100%.
- [x] **1.C.5**: التحقق الصارم عبر `tsc --noEmit` بنتيجة 0 أخطاء.

### 🎯 الحزمة 1.D: تفتيت باقي المكونات القديمة الضخمة (قيد العمل)
- [ ] **1.D.1**: تفتيت `ActivationModal.tsx` (22KB) إلى Micro-Dialog مع Hook مستقل.
- [ ] **1.D.2**: تفتيت شاشات الملف الشخصي (`ProfileScreen.tsx`, `EditProfileScreen.tsx`).
- [ ] **1.D.3**: تنظيف وترتيب مجلد `hooks/` والتأكد من عدم وجود أي Dead Code.

### 🎯 الحزمة 1.E: الفحص النهائي والاعتماد الكامل
- [ ] **1.E.1**: فحص TypeScript لكامل مشروع الفرونت إند بصفر أخطاء.
- [ ] **1.E.2**: التأكد من خلو Expo Router من أي Route Collisions.
- [ ] **1.E.3**: عمل Commit و Push واعتماد نهاية المرحلة 1.

---

## 📅 المراحل القادمة
- **المرحلة 2**: داتا بيز وخدمات Laravel (Clean Schema + 3 Core Services).
- **المرحلة 3**: الداتا بيز المحلية بالموبايل والمزامنة (Drizzle ORM + Delta Sync + PRD Weekly Activity Widget).
- **المرحلة 4**: استراتيجية الرفع والمعالجة النهائية (Electron / Worker / Bunny).
