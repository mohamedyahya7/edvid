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

- [ ] **Database Foundation:**

  - [x] Add `app_settings` table to manage general application state.
  - [x] Refactor startup logic to save/load `selected_grade_id` from the new table.
  - [x] Add `is_followed` column to `teachers` table.
  - [x] Create `pending_actions` table for sync queue.
  - [x] Add `is_favorite` column to `videos` table.
  - [x] Add `access_type` column to `videos` table.
  - [x] Add `watch_count` column to `videos` table.
  - [x] Add `download_expiry_date` column to `videos` table.
  - [x] Add `download_status` column to `videos` table.

- [ ] **UI Development & Local Logic:**

  - [ ] Implement the `TeacherScreen` to display course info and videos.
  - [ ] Add "Follow/Unfollow" button to `TeacherScreen` and connect it to a new `toggleFollowTeacher` action.
    - This action should update `teachers.is_followed` locally.
    - It should also add a `FOLLOW_TEACHER` or `UNFOLLOW_TEACHER` job to the `pending_actions` queue.
  - [ ] Add "Like/Unlike" button on the `VideoScreen` and connect it to a new `toggleVideoLike` action.
    - This action should update `videos.is_favorite` locally.
    - It should also add a `LIKE_VIDEO` or `UNLIKE_VIDEO` job to the `pending_actions` queue.
  - [ ] **UI/UX Enhancements:**
    - [ ] Redesign and improve the main UI screens 
    -(Home (notification,profile/settings),Explore, Library) for a better user experience.
    - [ ] Design and implement a custom, engaging splash screen.

- [ ] **Synchronization Service:**

  - [ ] Create a `SyncService` responsible for handling data synchronization.
  - [ ] Implement **Push Logic**:
    - Create a function to read actions from `pending_actions`.
    - For each action, make the corresponding API call (e.g., `POST /api/v1/teachers/follow`).
    - On success, remove the action from the queue. On failure, increment the attempt count.
  - [ ] Implement **Pull Logic**:
    - Create a function to fetch changes from the server since `last_synced_at`.
    - The function should take the server response and perform smart updates/inserts on the local database tables (`grades`, `subjects`, `teachers`, `courses`, `videos`).
    - After a successful pull, update the `last_synced_at` value in `app_settings`.
  - [ ] Trigger sync automatically on app start and periodically in the background.

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
- [ ] **Note:** The backend API and database schema must support all new actions and data points.
- [ ] **Backend (Laravel):** Implement all required API endpoints:

  - `POST /api/v1/sync` (for the pull logic)
  - `POST /api/v1/teachers/follow`
  - `POST /api/v1/videos/like`

- [ ] Implement user authentication flow (login/register).
- [ ] On successful login, retrieve and store user data from the server, including an auth token, name, and `grade_id`.
- [ ] Refactor the initial app logic in `app/_layout.tsx` to check for the user's auth token instead of a locally saved `grade_id`.
  - If a token exists, the user is logged in. Use the `grade_id` from their profile to set the app state.
  - If no token exists, redirect the user to a new Login screen.
- [ ] Create a dedicated Login/Register screen.
- [ ] Secure API requests using the stored auth token.
- [ ] Add a "Logout" functionality.

---

_This plan was updated based on a detailed code review and discussion._
