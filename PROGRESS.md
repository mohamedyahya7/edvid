# متابعة تنفيذ الريفاكتور (PROGRESS.md)

## 📊 الحالة العامة
- **المرحلة النشطة الحالية**: إنجاز المرحلة 2 بالكامل (Laravel Backend Clean Architecture & Video Security Suite) والتجهيز لـ المرحلة 3
- **Git Branch**: `phase-2-laravel-backend` (في مجلد `backend`)
- **تاريخ التحديث**: 2026-11-06

---

## 🚦 قائمة المهام التفصيلية للمرحلة 1

### 🎯 الحزمة 1.A: الأرشفة الآمنة وتطهير مسار Expo Router (منجزة بالكامل ✅)
- [x] **1.A.1**: إنشاء هيكل مجلد `frontend/legacy/` الفرعي بالكامل (`legacy/screens`, `legacy/components`, `legacy/hooks`, `legacy/services`, `legacy/api`).
- [x] **1.A.2**: نقل الملفات الميتة الصريحة ومجلدات `clubs` و `home` غير المستخدمة في الشاشات والمكونات إلى `legacy/` لحفظها بنسبة 100%.
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
- [x] **1.C.4**: أرشفة `LibraryScreen.tsx` القديم (741 سطراً) في `legacy/screens/LibraryScreen.legacy.tsx` وإعادة بنائه بالكامل في **77 سطراً فقط**، مع الحفاظ على التفاعلات الـ 12 بنسبة 100%.

### 🎯 الحزمة 1.D: تفتيت كافة الشاشات المتبقية وإزالة المكونات المكررة (منجزة بالكامل ✅)
- [x] **1.D.1**: تفتيت `ActivationModal.tsx` من 748 سطراً إلى مكوّن رشيق مع جزئيات `ActivationInputStep` و `ActivationResolutionStep` وخطاف `useActivationController.ts`.
- [x] **1.D.2**: تفتيت شاشة الملف الشخصي `ProfileScreen.tsx` من 437 سطراً إلى **78 سطراً فقط**، مع جزيئات `ProfileHeaderBar` و `EducationalSummaryGrid` و `TeacherNewestVideosSection` وخطاف `useProfileScreen.ts`.
- [x] **1.D.3**: تفتيت شاشة الاستكشاف `ExploreScreen.tsx` من 348 سطراً إلى **109 أسطر** مع جزيء `ExploreTopAppBar.tsx` و كائن `ExploreVideoGrid.tsx`.
- [x] **1.D.4**: تفتيت شاشة كل المدرسين `AllTeachersScreen.tsx` من 544 سطراً إلى **138 سطراً** مع جزيء `TeacherCatalogCard.tsx` و `TeachersCatalogHeader.tsx`.
- [x] **1.D.5**: تفتيت شاشة تعديل الملف الشخصي `EditProfileScreen.tsx` من 541 سطراً إلى **168 سطراً** مع جزيء `ProfileHeroCard.tsx` و `ProfileFormFields.tsx` وخطاف `useEditProfileController.ts`.
- [x] **1.D.6**: تفتيت شاشة تفاصيل الفيديو `VideoDetailScreen.tsx` من 231 سطراً إلى **149 سطراً** مع عزل الوضع الأفقي `VideoLandscapeView.tsx` وخطاف الحماية `useScreenProtection.ts`.
- [x] **1.D.7**: تفتيت شاشة المعلم `TeacherProfileScreen.tsx` إلى **91 سطراً**.
- [x] **1.D.8**: أرشفة مجلدات `clubs` و `home` بالكامل في `legacy/` ونقل الجزيئات الحية (`FeaturedContentCard`, `InfoRowCard`) إلى `components/molecules/`.

### 🎯 الحزمة 1.E: الفحص النهائي والاعتماد الكامل (منجزة بالكامل ✅)
- [x] **1.E.1**: فحص TypeScript لكامل مشروع الفرونت إند بصفر أخطاء (`tsc --noEmit`).
- [x] **1.E.2**: تشغيل حزمة اختبارات الـ Units واجتيازها بنجاح (`npm run test:units`).
- [x] **1.E.3**: تشغيل خادم Expo Bundler على `exp://192.168.1.20:8081` واختباره.
- [x] **1.E.4**: عمل Commit ودفع التغييرات بالكامل إلى GitHub (`cab4054`).

---

## 🚦 قائمة المهام التفصيلية للمرحلة 2 (Laravel Backend Architecture & Video Security - منجزة بالكامل ✅)

### 🎯 الحزمة 2.A: داتا بيز ونمذجة البيانات (Database Migrations & Models - ✅)
- [x] **2.A.1**: إنشاء Migration لجدول `video_ratings` (مع Unique Index مركب على `[student_id, video_id]`) ونموذج `VideoRating.php`.
- [x] **2.A.2**: إنشاء Migration لجدول `teacher_ratings` (مع Unique Index مركب على `[student_id, teacher_id]`) ونموذج `TeacherRating.php`.
- [x] **2.A.3**: إنشاء Migration لجدول `video_encryption_keys` (حفظ مفاتيح AES-128 و IV و Hash) ونموذج `VideoEncryptionKey.php`.
- [x] **2.A.4**: إنشاء Migration لتحديث جدول `videos` (إضافة `provider_type`, `hls_path`, `encryption_key_id`, `status`, `published_at`, `duration`).
- [x] **2.A.5**: تشغيل المايجريشن والتحقق من سلامة الجداول في MySQL.

### 🎯 الحزمة 2.B: نمط استراتيجية مزودي الفيديوهات (Video Provider Strategy Pattern - ✅)
- [x] **2.B.1**: إنشاء العقد `VideoProviderInterface` ونماذج نقل البيانات `PlaybackPayload` و `DownloadOption`.
- [x] **2.B.2**: بناء استراتيجية `YouTubeVideoProvider` للتعامل مع الفيديوهات المجانية واستخراج الروابط.
- [x] **2.B.3**: بناء استراتيجية `BackblazeB2VideoProvider` للتعامل مع تخزين B2 وتوليد توكنات JWT الموقعة وروابط التحميل المؤقتة.
- [x] **2.B.4**: بناء استراتيجية `HlsStreamVideoProvider` لإعداد قوائم تشغيل m3u8 المحمية ونقاط تسليم مفاتيح التشفير.
- [x] **2.B.5**: بناء `VideoProviderFactory` لربط الموديل تلقائياً بالمزود المناسب مع Fallback ذكي.

### 🎯 الحزمة 2.C: الخدمات الأساسية والأمان الذري (Core Backend Services & FormRequests - ✅)
- [x] **2.C.1**: بناء FormRequests الصارمة (`ValidateCodeRequest`, `RequestDownloadRequest`, `BatchTelemetryRequest`, `StoreRatingRequest`).
- [x] **2.C.2**: بناء `CodeRedemptionService` مع القفل الذري `Cache::lock` لمنع مشاكل الـ Race Condition.
- [x] **2.C.3**: بناء `VideoDeliveryService` لتسليم روابط المشاهدة والتحميل المفحوصة ومفاتيح التشفير.
- [x] **2.C.4**: بناء `PreWarmedCatalogService` لمعالجة الكتالوج مسبقاً وتصحيح هيدرز HTTP 304 `Last-Modified`.
- [x] **2.C.5**: بناء `TelemetryBatchService` وأوامر المعالجة الهادئة في أوقات الهدوء (`telemetry:drain`, `catalog:prewarm`).

### 🎯 الحزمة 2.D: تنحيف الكنترولرز وبناء موارد الـ API (Thin Controllers & API Resources - ✅)
- [x] **2.D.1**: بناء API Resources موحدة (`CatalogResource`, `VideoResource`, `TeacherResource`, `PlaybackResource`).
- [x] **2.D.2**: إعادة هيكلة `CodeValidationController` ليصبح نحيفاً للغاية (109 سطراً) مفوضاً لـ `CodeRedemptionService`.
- [x] **2.D.3**: إعادة هيكلة `CatalogController` للاعتماد على `PreWarmedCatalogService` وتطبيق كاش 304 بدقة (71 سطراً).
- [x] **2.D.4**: إضافة نقاط النهاية الجديدة في `routes/api.php` (`/telemetry/batch`, `/video/{video}/playback`, `/video/keys/{keyHash}`, `/ratings`).

### 🎯 الحزمة 2.E: الفحص والاختبار الشامل (Full Backend Verification - ✅)
- [x] **2.E.1**: تشغيل فحص الـ Syntax الشامل لكافة ملفات الـ Backend بصفر أخطاء (`ALL PHP FILES PASSED SYNTAX CHECK WITH ZERO ERRORS`).
- [x] **2.E.2**: إصلاح الخلل المزدوج في الـ Namespace بملف `ManageCategories.php` والـ Parse Error في `Jobx.php`.
- [x] **2.E.3**: تشغيل حزمة اختبارات الـ Unit Tests (`VideoStrategyTest`, `CodeRedemptionTest`) واجتيازها بنجاح 100%.
- [x] **2.E.4**: اعتماد المرحلة 2 والالتزام بالـ Commit في `backend` (`7f43a0f`).

### 🎯 الحزمة 2.R: تحسينات الأمان وخوارزمية التفاعل وأحجام الجودات (Phase 2 Refinements - منجزة بالكامل ✅)
- [x] **2.R.1**: تحديث سكريبت `get_links.py` لضمان حداثة `yt-dlp` وتمرير `player_client=['android', 'web']` واستخراج مدة الفيديو `duration` بالثواني تلقائياً وحفظها في الموديل.
- [x] **2.R.2**: تحديث `CodeRedemptionService` لتقديم تدفق الـ One-Shot Direct Download عند وجود جودة واحدة مؤكدة، وتضمين أحجام الجودات `size_in_bytes` بدقة لمراعاة باقات الطلاب.
- [x] **2.R.3**: إنشاء Migration لعمود `engagement_score` على جدولي `videos` و `teachers`، وإنشاء جدول `student_learning_profiles` لتخزين ملخص سلوك الطالب (سطر وحيد لكل طالب لخدمة مليون مستخدم).
- [x] **2.R.4**: تطبيق خوارزمية مؤشر الجدارة التفاعلية (Engagement Score Formula) داخل `TelemetryBatchService` مع حساب معدل الإكمال وعدد التكرار والطلب التراكمي.
- [x] **2.R.5**: تطهير `AuthController` من ثغرة User Enumeration وإحكام التسجيل داخل `DB::transaction` وإصلاح تسجيل الخروج لمسح التوكن الحالي فقط، وإزالة استعلامات $N+1$ من `StudentInteractionController`.
- [x] **2.R.6**: كتابة وتشغيل الاختبارات الآلية الشاملة (`EngagementAlgorithmTest`, `VideoStrategyTest`, `CodeRedemptionTest`) واجتياز 11 فحصاً بنجاح 100%.
- [x] **2.R.7**: اعتماد التحديثات والالتزام بالـ Commit في `backend` (`5498a06`).

---

## 📅 المرحلة التالية المباشرة
- **المرحلة 3**: الداتا بيز المحلية بالموبايل والمزامنة الذكية (Drizzle ORM & Local SQLite Delta Sync & PRD Activity Widget).
