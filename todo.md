# Project To-Do List (Updated)

Here is the current status and the next steps for building the offline-first video application.

### Phase 1: App Entry & Database Setup (✅ Completed)

- [x] Install initial dependencies (`expo-sqlite`, `expo-image`, `expo-network`).
- [x] Define and create the final database schema.
- [x] Build the `SelectGradeScreen`.
- [x] Implement the initial startup logic.

### Phase 2: Local-First UI & State Management (✅ Completed)

- [x] Create a function to populate the database with mock data.
- [x] Set up the Zustand store to manage the application state.
- [x] Implement data fetching and filtering logic in the store (`fetchExploreData`, `fetchCourses`, etc.).
- [x] Build out the main UI screens (`Home`, `Explore`) to fully utilize the Zustand store.
- [x] Connect the `ExploreScreen` UI (filters, list, infinite scroll) to the `fetchExploreData`, `toggleSubjectFilter`, and `toggleTeacherFilter` actions.

### Phase 2.5: Internationalization (i18n) & Localization (L10n) (✅ Completed)

- [x] **Priority:** Implement multi-language support for Arabic (ar) and English (en).
- [x] **Dependencies:** Install `i18next`, `react-i18next`, and `expo-localization`.
- [x] **Structure:**
  - [x] Create a `locales` or `i18n` directory (`app/i18n`).
  - [x] Add translation files: `en.json` and `ar.json`.
- [x] **Implementation:**
  - [x] Create a configuration file to initialize `i18next`, detect the device language, and set a default language.
  - [x] Refactor all UI components (starting with `ExploreScreen`) to use the `useTranslation` hook instead of hardcoded strings.
  - [x] Implement Right-to-Left (RTL) layout support for Arabic using React Native's `I18nManager`.
  - [x] Add a settings option for the user to manually switch the language.

### Phase 3: Advanced Features & Offline Capabilities (To Do)

- [ ] Investigate and fix bad behavior when changing language.
- [ ] **UI Development:**
  - [ ] Implement the `CourseDetailScreen` to display course information and its video list.
  - [ ] Implement the `fetchVideosForCourse` action in the Zustand store and connect it to `CourseDetailScreen`.
  - [ ] Build the `LibraryScreen` to show favorite or downloaded videos.
- [ ] **Content Handling:**
  - [ ] **Dependencies:** Install `expo-file-system`, `expo-video`, `react-native-youtube-iframe`.
  - [ ] **Video Player:** Implement the conditional video player in a `VideoDetailScreen`.
    - [ ] Show `react-native-youtube-iframe` for free, online videos.
    - [ ] Show `expo-video` player for downloaded, offline videos.
- [ ] **Backend & API Integration:**
  - [ ] **Note:** The backend API and database schema must support multilingual content (e.g., `title_en`, `title_ar`).
  - [ ] **Backend (Laravel):** Implement the API endpoints as defined in the API Contract.
    - [ ] `POST /api/v1/validate-code`
    - [ ] `POST /api/v1/videos/request-download`
    - [ ] `POST /api/v1/codes/cancel`
    - [ ] `POST /api/v1/downloads/complete`
    - [ ] `POST /api/v1/downloads/failed`
  - [ ] **Frontend (React Native):** Implement UI and logic for activation code, video download, and API communication.
- [ ] **Offline Sync:** Plan and implement a strategy for syncing local data with a server.
- [ ] **Video Player:** Implement a player to handle local video and audio files.
- [ ] **Build & Deploy:** Create a development build to test notifications and background tasks.

---

_This plan was updated based on a detailed code review and discussion._
