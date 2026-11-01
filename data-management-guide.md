# Local-First Data Isolation Strategy

This document outlines the strategy for managing user data locally on a device while ensuring complete isolation between different user accounts. The core principle is to treat the local device as the primary data source for each user, without relying on server-side synchronization for user content.

## 1. Problem Statement

When multiple users log into the same application on a shared device, there is a risk of data leakage. A user might see data (downloads, progress, settings) belonging to the previously logged-in user. This happens when the application treats the local database as a single, shared container for all users. Our goal is to prevent this and ensure each user's data is kept private and separate.

## 2. Core Principle: User-Centric Data Association

The solution is to **associate every piece of user-specific data with a unique User ID (`userId`)**. Instead of clearing the database on logout, we simply filter all database queries to only show data belonging to the currently authenticated user. Data for other users remains securely stored in the database but is inaccessible until they log in again.

## 3. Implementation Steps

### Step 3.1: Database Schema Modification

Every table in the local SQLite database that stores user-specific information **must** include a `userId` column. This column will act as a foreign key linking the data to a specific user.

**Tables to modify:**

- `usedCodes` (Activation codes)
- `downloads` (Downloaded videos/content)
- `videoProgress` (Progress in videos)
- `userSettings` (User-specific settings)
- Any other table containing data that should not be shared between users.

**Example Schema Change:**

```sql
-- Before
CREATE TABLE downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  videoId TEXT NOT NULL,
  localPath TEXT NOT NULL
);

-- After
CREATE TABLE downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  videoId TEXT NOT NULL,
  localPath TEXT NOT NULL,
  userId INTEGER NOT NULL -- The key to data isolation
);
```

> **Note:** Tables with generic, non-user-specific data (e.g., `grades`, `subjects`) should **not** have a `userId` column.

### Step 3.2: Modify All Database Queries

Every single database query (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) that interacts with user-specific tables must be updated to use the `userId`.

- **Reading Data (SELECT):** Always use a `WHERE` clause to filter by the current user's ID.

  ```sql
  -- Fetch downloads for the currently logged-in user ONLY
  SELECT * FROM downloads WHERE userId = ?;
  ```

- **Writing Data (INSERT):** When creating a new record, always include the current user's ID.

  ```sql
  -- Save a new download associated with the current user
  INSERT INTO downloads (videoId, localPath, userId) VALUES (?, ?, ?);
  ```

- **Updating/Deleting Data (UPDATE/DELETE):** The `WHERE` clause is critical to ensure you are modifying the correct user's data.
  ```sql
  -- Delete a specific download for the current user
  DELETE FROM downloads WHERE id = ? AND userId = ?;
  ```

### Step 3.3: Update Authentication Flow

The login and logout processes become simpler and safer.

- **On Login:**

  1. Authenticate the user with the server.
  2. Receive the user's profile, including their unique `user.id`.
  3. **Store this `user.id` in the global application state (e.g., Zustand store).** This ID is now available to be used in all subsequent database queries for the duration of the session.

- **On Logout:**
  1. **Simply clear the `user.id` from the global application state.**
  2. **Do NOT delete any data from the database.** The user's data remains persisted locally, ready for their next session.

## 4. Benefits of this Approach

- **Offline First:** Users can access all their previously loaded data without an internet connection.
- **Data Privacy:** User data is completely isolated. A user can never accidentally see another user's information.
- **State Persistence:** A user can log out and log back in later to find all their data exactly as they left it.
- **No Complex Sync Logic:** Avoids the challenges of synchronizing data between the client and server.
