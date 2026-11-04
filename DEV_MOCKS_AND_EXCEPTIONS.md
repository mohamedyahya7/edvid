# Bamboo Platform — الدليل الشامل للاستثناءات والبيانات الوهمية وكود الإرجاع للأصل
> **تاريخ التوثيق:** 2026-11-04  
> **الهدف:** توثيق تفصيلي دقيق لكل تعديل استثنائي وكود وهمي تم وضعه لمرحلة التجربة، مع توفير **الكود الأصلي التام (Rollback Code)** لكل ملف بحيث يمكن العودة للوضع الطبيعي الصارم بضغطة زر.

---

## فهرس الملفات المعدلة استثنائياً
1. [`frontend/lib/db/queries/video.queries.ts`](file:///f:/bamboo/frontend/lib/db/queries/video.queries.ts)
2. [`frontend/lib/db/queries/teacher.queries.ts`](file:///f:/bamboo/frontend/lib/db/queries/teacher.queries.ts)
3. [`frontend/lib/db/queries/usedCodes.queries.ts`](file:///f:/bamboo/frontend/lib/db/queries/usedCodes.queries.ts)
4. [`frontend/lib/db/index.ts`](file:///f:/bamboo/frontend/lib/db/index.ts)
5. [`frontend/lib/store/authStore.ts`](file:///f:/bamboo/frontend/lib/store/authStore.ts)

---

## 1. ملف استعلامات الفيديو: `frontend/lib/db/queries/video.queries.ts`

### أ) قسم "واصل المشاهدة" (`getContinueWatchingVideo`)
- **الداعي الاستثنائي للتعديل:** السماح لفيديوهات اليوتيوب والمجانية بالظهور في كارت "واصل المشاهدة" في الهوم بمجرد تشغيلها ووجود `progress_seconds > 0` بدلاً من قصرها فقط على الحصص المدفوعة بالأكواد، لتتمكن من فحص شريط التقدم واستئناف الفيديو.

#### الكود الحالي (المعدل للتجربة):
```sql
WHERE v.progress_seconds > 0
   OR v.download_status = 'COMPLETED'
   OR v.access_type = 'watch'
ORDER BY v.updated_at DESC, v.id DESC;
```

#### الكود الأصلي للإنتاج (Rollback Code):
```sql
WHERE (v.access_type = 'watch' OR v.download_status = 'COMPLETED')
  AND v.progress_seconds > 0
ORDER BY v.updated_at DESC, v.id DESC;
```

---

### ب) قسم "جديد من معلميك" (`getNewestVideosFromFollowedTeachers`)
- **الداعي الاستثنائي للتعديل:** إذا كان الطالب يتابع مدرسين ولكنهم لم ينشروا فيديوهات جديدة داخل نفس الصف الدراسي الحالي، تم وضع استعلام بديل (Fallback) يعرض أحدث الفيديوهات العامة لئلا يظهر القسم فارغاً أثناء التطوير.

#### الكود الحالي (المعدل للتجربة):
```typescript
  const videos = await db.getAllAsync<Video>(query);
  if (videos && videos.length > 0) {
    return videos;
  }

  // Fallback: If followed teachers do not have videos in this grade, show newest general lessons
  const fallbackQuery = `
    SELECT
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name,
      t.profile_picture_url as teacher_profile_picture_url,
      s.title as subject_name
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    LEFT JOIN teachers t ON (
      (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
      OR
      (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
    )
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    ORDER BY v.id DESC
    LIMIT 10;
  `;
  return await db.getAllAsync<Video>(fallbackQuery);
```

#### الكود الأصلي للإنتاج (Rollback Code):
```typescript
  const videos = await db.getAllAsync<Video>(query);
  return videos || [];
```

---

### ج) استدعاء حقن أكواد المكتبة (`fetchLibraryVideos` و `getLibraryVideosCount`)
- **الداعي الاستثنائي للتعديل:** تم وضع استدعاء تلقائي `await ensureMockCodesIfEmpty(db);` لضمان وجود داتا تجريبية بالمكتبة عند فتحها.

#### الكود الحالي (المعدل للتجربة):
```typescript
export const fetchLibraryVideos = async (db: SQLiteDatabase): Promise<Video[]> => {
  await ensureMockCodesIfEmpty(db);
  const query = `...`;
```

#### الكود الأصلي للإنتاج (Rollback Code):
```typescript
export const fetchLibraryVideos = async (db: SQLiteDatabase): Promise<Video[]> => {
  const query = `...`;
```
*(مع حذف `import { ensureMockCodesIfEmpty } from "./usedCodes.queries";` من رأس الملف).*

---

## 2. ملف استعلامات المعلم: `frontend/lib/db/queries/teacher.queries.ts`

### بروفايل المعلم (`getTeacherDetails`)
- **الداعي الاستثنائي للتعديل:** إذا دخلت بروفايل معلم ولم تكن له حصص مسجلة بالصف الدراسي المختار للطالب (`selected_grade_id`)، يقوم بالـ Fallback لجلب كل حصص هذا المعلم من كل الصفوف الأخرى لئلا تظهر الصفحة فارغة أثناء التطوير.

#### الكود الحالي (المعدل للتجربة - السطور 62-87):
```typescript
  // If no grade-specific videos found or gradeId is not set, fetch all videos of this teacher
  if (!videos || videos.length === 0) {
    videos = await db.getAllAsync(
      `SELECT 
         v.*,
         COALESCE(v.duration_seconds, 1800) as duration_seconds,
         COALESCE(t.name, 'أستاذ المادة') as teacher_name,
         MAX(uc.video_id IS NOT NULL) AS is_unlocked
       FROM videos v
       LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
       LEFT JOIN teachers t ON (
         (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
         OR
         (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
       )
       LEFT JOIN used_codes uc ON CAST(v.id AS TEXT) = CAST(uc.video_id AS TEXT)
       WHERE (
         (v.teacher_id IS NOT NULL AND (v.teacher_id = ? OR CAST(v.teacher_id AS TEXT) = CAST(? AS TEXT)))
         OR
         (c.teacher_id IS NOT NULL AND (c.teacher_id = ? OR CAST(c.teacher_id AS TEXT) = CAST(? AS TEXT)))
       )
       GROUP BY v.id
       ORDER BY v.id DESC;`,
      [teacherId, teacherId, teacherId, teacherId]
    );
  }

  return { teacher, videos };
```

#### الكود الأصلي للإنتاج (Rollback Code):
حذف كتلة الـ `if (!videos || videos.length === 0) { ... }` بالكامل، والاكتفاء بحصص الصف الدراسي المحدد للطالب فقط:
```typescript
  return { teacher, videos: videos || [] };
```

---

## 3. ملف الأكواد المفعلة: `frontend/lib/db/queries/usedCodes.queries.ts`

### دالة توليد الأكواد الوهمية (`ensureMockCodesIfEmpty`)
- **الداعي الاستثنائي للتعديل:** حقن 8 أكواد شحن وهمية (`BAMBOO-TEST-101...`) وتوزيعها بين أوفلاين ومشاهدة مباشرة لتمكين اختبار فلاتر المكتبة وصفحة الأكواد.

#### الكود الحالي (المعدل للتجربة):
دالة تقوم بحذف وتوليد أكواد تجريبية في جدول `used_codes` وتحديث جدول `videos`.

#### الكود الأصلي للإنتاج (Rollback Code):
تحويل الدالة إلى دالة فارغة (No-Op) أو حذفها تماماً:
```typescript
export const ensureMockCodesIfEmpty = async (_db: SQLiteDatabase): Promise<void> => {
  // Production: Do nothing. Codes must only come from verified server redemption.
  return;
};
```

---

## 4. ملف تهيئة قاعدة البيانات: `frontend/lib/db/index.ts`

### توليد الكتالوج الوهمي عند أول تشغيل (`generateMockDataSQL`)
- **الداعي الاستثنائي للتعديل:** عند بدء التطبيق لأول مرة وقاعدة البيانات فارغة تماماً، يتم استدعاء `generateMockDataSQL()` لحقن 60 فيديو ومواد ومدرسين وهميين.

#### الكود الحالي (المعدل للتجربة - السطور 50-67):
```typescript
  try {
    const videoCount = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM videos;"
    );
    if (!videoCount || videoCount.count === 0) {
      console.log("Populating database with initial mock catalog data...");
      await db.execAsync(generateMockDataSQL());
      await db.execAsync(`
        INSERT OR IGNORE INTO user_subjects (subject_id) VALUES ('s1'), ('s2');
        INSERT OR IGNORE INTO user_teachers (teacher_id) VALUES ('t1'), ('t2');
        INSERT OR IGNORE INTO app_settings (key, value) VALUES ('selected_grade_id', 'g1');
        UPDATE videos SET progress_seconds = 240 WHERE id = 'v1';
      `);
      console.log("Initial mock data populated successfully.");
    }
  } catch (e) {
    console.warn("Initial data seeding note:", e);
  }
```

#### الكود الأصلي للإنتاج (Rollback Code):
في الإنتاج، يتم تفريغ هذه الكتلة بالكامل؛ لأن البيانات تأتي حصراً عبر مزامنة الكتالوج من السيرفر:
```typescript
  // In production, database starts clean and synchronizes with API:
  console.log("Database initialized. Ready for SyncService catalog sync.");
```
*(مع حذف ملف `frontend/lib/db/mockData.ts` وحذف الاستيراد الخاص به).*

---

## 5. ملف جلسة المستخدم: `frontend/lib/store/authStore.ts`

### تخزين جلسة الويب (`localStorage` vs `SecureStore`)
- **الوضع الحالي:** تم عمل غلاف ذكي يفحص `Platform.OS === 'web'`؛ فإن كان التطبيق يعمل على الويب يستخدم `localStorage`، وإن كان على أندرويد/iOS يستخدم `SecureStore`.
- **ملاحظة إنتاجية:** هذا التعديل **يجب إبقاؤه** لأنه تعديل معماري صحيح يمنع انهيار تطبيق الويب دون المساس بالأمان المشفر على الهاتف.
- **البيانات الوهمية المسجلة:** المستخدم التجريبي المسجل حالياً في الـ Web LocalStorage ("طالب متفوق").
- **طريقة الإرجاع للإنتاج:** الضغط على زر "تسجيل الخروج" من شاشة الملف الشخصي، ثم تسجيل الدخول الفعلي برقم هاتف وكلمة مرور حقيقيين مسجلين في قاعدة بيانات Laravel.

---

## خطة الإرجاع السريعة خطوة بخطوة (One-Click Production Rollback)

عند الرغبة في إرجاع المشروع فوراً لوضعه الإنتاجي الصارم:
1. استبدال الأسطر الموضحة أعلاه في `video.queries.ts` و `teacher.queries.ts`.
2. استبدال `ensureMockCodesIfEmpty` في `usedCodes.queries.ts` بدالة فارغة.
3. حذف كتلة `generateMockDataSQL` من `lib/db/index.ts`.
4. حذف قاعدة البيانات التجريبية محلياً وإجراء مزامنة كاملة من السيرفر الحي:
```typescript
await SyncService.run(db, true);
```
