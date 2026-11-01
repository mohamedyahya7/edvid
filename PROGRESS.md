# متابعة تنفيذ الريفاكتور (PROGRESS.md)

## 📊 الحالة العامة
- **المرحلة النشطة الحالية**: المرحلة 1: ريفاكتور وهيكلة الفرونت إند بالكامل (Clean Architecture & Full Modularization)
- **Git Branch**: `phase-1-react-native-ui` (في مجلد `frontend`)
- **تاريخ التحديث**: 2026-11-01

---

## 🚦 قائمة المهام التفصيلية للمرحلة 1

### 🎯 الحزمة 1.A: الأرشفة الآمنة وتطهير مسار Expo Router (Housekeeping & Archiving)
- [ ] **1.A.1**: إنشاء هيكل مجلد `frontend/legacy/` الفرعي بالكامل (`legacy/screens`, `legacy/components`, `legacy/hooks`, `legacy/services`).
- [ ] **1.A.2**: نقل الملفات الميتة الصريحة (`ExploreScreen.legacy.tsx`, `VideoDetailScreen.legacy.tsx`, `AuthService.ts` 0B, `useStorageState.ts` 0B, ومجلد `frontend/screens` الفارغ القديم) إلى `legacy/`.
- [ ] **1.A.3**: نقل `app/i18n` إلى `constants/i18n` وتحديث المراجع في الكود.
- [ ] **1.A.4**: نقل مكونات `app/components/` (`ActivationModal`, `ActiveDownloads`, `QRCodeScanner`) إلى `components/` وتحديث الـ imports.
- [ ] **1.A.5**: نقل الشاشات من `app/screens/` إلى `screens/` المركزية وتحديث مسارات استدعائها داخل routes مجلد `app/`.
- [ ] **1.A.6**: تشغيل فحص الـ TypeScript والتأكد من نجاحه بصفر أخطاء (`tsc --noEmit`).

### 🎯 الحزمة 1.B: توحيد الـ Types والـ Units النقية (Pure Units & Contracts)
- [ ] **1.B.1**: إنشاء وتوحيد `types/library.ts`, `types/auth.ts`, `types/navigation.ts`.
- [ ] **1.B.2**: إنشاء دوال الوحدات النقية `utils/formatBytes.ts` و`utils/formatDuration.ts`.
- [ ] **1.B.3**: إنشاء دالة `utils/filterLibraryVideos.ts` النقية لعزل منطق التصفية.

### 🎯 الحزمة 1.C: تفتيت شاشة المكتبة والتحميلات `LibraryScreen` (Micro-Components & Hooks)
- [ ] **1.C.1**: بناء جزيئات المكتبة (`StorageMeter.tsx`, `FilterChipGroup.tsx`, `EmptyStateView.tsx`).
- [ ] **1.C.2**: بناء Micro-Hooks المكتبة (`useLibraryVideos.ts`, `useLibraryFilters.ts`, `useLibraryActions.ts`).
- [ ] **1.C.3**: بناء Organisms المكتبة (`LibraryStorageHeader.tsx`, `LibraryFilterSection.tsx`, `LibraryVideoList.tsx`).
- [ ] **1.C.4**: إعادة بناء `screens/library/LibraryScreen.tsx` برمجياً في أقل من 80 سطراً مع الحفاظ على التفاعلات الـ 12 بنسبة 100%.

### 🎯 الحزمة 1.D: تفتيت باقي المكونات القديمة الضخمة (God Components Cleanup)
- [ ] **1.D.1**: تفتيت `ActivationModal.tsx` (22KB) إلى Micro-Dialog مع Hook مستقل.
- [ ] **1.D.2**: تفتيت شاشات الملف الشخصي (`ProfileScreen.tsx`, `EditProfileScreen.tsx`).
- [ ] **1.D.3**: تنظيف وترتيب مجلد `hooks/` بنقل الخطافات القديمة غير المستخدمة إلى `legacy/hooks`.

### 🎯 الحزمة 1.E: الفحص النهائي والاعتماد (Full Verification & Sign-off)
- [ ] **1.E.1**: فحص TypeScript لكامل مشروع الفرونت إند بصفر أخطاء.
- [ ] **1.E.2**: التأكد من خلو Expo Router من أي Route Collisions.
- [ ] **1.E.3**: عمل Commit واعتماد نهاية المرحلة 1.

---

## 📅 المراحل القادمة
- **المرحلة 2**: داتا بيز وخدمات Laravel (Clean Schema + 3 Core Services).
- **المرحلة 3**: الداتا بيز المحلية بالموبايل والمزامنة (Drizzle ORM + Delta Sync + PRD Weekly Activity Widget).
- **المرحلة 4**: استراتيجية الرفع والمعالجة النهائية (Electron / Worker / Bunny).
