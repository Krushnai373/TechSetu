# Implementation Plan: Meeting Lifecycle, Conflict Detection, Time-Gated Access & Direct Login Entry

This plan addresses the user requirements:
1. **Direct Login Page on Entry**: When opening the app link, the user must immediately land on the direct Student/Teacher login page rather than auto-entering the website.
2. **Strict Time-Gated Meeting Access**: Classes cannot be joined at arbitrary times. For example, an 11:00 AM slot can only be joined when the scheduled slot begins (11:00 AM) and locks when the slot ends.
3. **Session Lifecycle & Automated Cleanup**: When the teacher ends the meeting OR the allocated slot time ends, the meeting ends directly for everyone (students get auto-dismissed to dashboard). The lecture is automatically completed/archived so students do not see lingering "Live Now" lectures.
4. **Slot Conflict & Overlap Prevention**: Systematically detect if another lecture is already scheduled for the same class, section, date, and overlapping time range. Alert the teacher with a popup/warning and prevent duplicate slot assignments.

---

## User Review Required

> [!IMPORTANT]
> - **Direct Login Gate**: The application will default to the clean Role Selection & Login card on the root route `/` so every visitor chooses their role and logs in before accessing any dashboards or features.
> - **Time Conflict Prevention**: When a teacher chooses Date, Start Time, End Time, Class, and Section, the system checks for any overlapping active or scheduled lectures for that specific Class and Section. If a collision is found, a clear alert modal/message will notify the teacher with the existing lecture details and request a different time slot.
> - **Strict Time Gating**: A lecture scheduled for e.g. 11:00 AM cannot be joined early. Before 11:00 AM, the button will display a dynamic countdown (e.g., *"Starts at 11:00 AM (in 25 mins)"*) and prevent student entry until the scheduled window.
> - **Automated Expiry & Meeting Termination**: 
>   - When the teacher clicks **"End Meeting for All"**, a `MEETING_ENDED` event is broadcast across all participants. Students are notified and returned to the dashboard.
>   - When the scheduled `endTime` passes, the lecture is automatically marked `completed` and removed from the active live list on both teacher and student sides so students are never confused.

---

## Proposed Changes

### Backend Component (`FastAPI`)

#### [MODIFY] [classroom.py](file:///c:/Users/Krushnai/Desktop/TechSetu/backend/app/routers/classroom.py)
- In `assign_lecture`: Add server-side slot collision validation:
  - Check if any non-completed lecture matches `target_class` and `section` on the same `date` and overlaps in time interval `[start_time, end_time]`.
  - Return HTTP 409 with conflict details if overlapping.
- Add endpoint `POST /api/classroom/lectures/end/{lecture_id}`:
  - Marks lecture `status = "completed"` and sets end timestamp.
- Add lifecycle pruning in `get_lectures`:
  - Automatically evaluate if `date` and `end_time` have passed based on server time, updating expired live/scheduled lectures to `completed`.

---

### Frontend Services

#### [MODIFY] [classroomService.js](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/services/classroomService.js)
- Add time-parsing utilities (`parseTimeToMinutes`, `isTimeOverlapping`, `isSlotActiveNow`, `getTimeRemaining`).
- Add slot conflict checker: `checkSlotConflict({ date, startTime, endTime, targetClass, section })`.
- Add `endMeetingForAll(lectureId)`:
  - Emits `MEETING_ENDED` on `BroadcastChannel` and storage.
  - Updates lecture status to `completed` in localStorage and calls `POST /api/classroom/lectures/end/{lecture_id}`.
- Add automated lecture cleanup routine `cleanupExpiredLectures()` that runs periodically to archive expired slots so students never see stale live cards.

---

### Reusable UI Components

#### [MODIFY] [ScheduleSlotModal.jsx](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/components/ScheduleSlotModal.jsx)
- Upgrade time inputs to standardized formats (HTML `<input type="time">` or curated 12-hour/24-hour options with AM/PM).
- Add live collision detection:
  - As soon as the teacher selects class, section, date, and times, check if it overlaps with an existing slot.
  - Show a prominent conflict banner / modal alert: *"Conflict Detected! [Class X - Section Y] already has a lecture '[Topic]' scheduled on [Date] at [Time]. Please pick a different slot."*
  - Disable submit button while conflict exists.

#### [MODIFY] [MeetingRoom.jsx](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/components/MeetingRoom.jsx)
- Add real-time slot countdown timer in header (e.g., *"Slot ends in: 14m 30s"*).
- Add **"End Meeting for All"** button for the Teacher:
  - Calls `classroomService.endMeetingForAll(meetingId)`.
- Add listener for `MEETING_ENDED`:
  - When student client receives `MEETING_ENDED`, display alert dialog *"Class has ended by the teacher"* and safely exit back to student dashboard.
- Auto-terminate when slot end time is reached:
  - If current time exceeds slot `endTime`, automatically trigger meeting wrap-up and dismissal.

#### [MODIFY] [RoleAuthModal.jsx](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/components/RoleAuthModal.jsx) & [App.jsx](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/App.jsx)
- Ensure opening the web application or landing on `/` immediately displays the direct Role Selection & Login portal.
- Prevent automatic bypass or stale auto-login when opening the root link so users always authenticate properly.

#### [MODIFY] [LiveClassroom.jsx](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/pages/Student/LiveClassroom.jsx) & [LiveTranslator.jsx](file:///c:/Users/Krushnai/Desktop/TechSetu/frontend/src/pages/Teacher/LiveTranslator.jsx)
- **Time-Gated Access Buttons:**
  - If before slot start time: show locked badge with real-time countdown (e.g. *"Starts at 11:00 AM (in 18 mins)"*).
  - If slot is active (between start and end time and not ended): show green active **"Join Meeting"**.
  - If slot has ended: remove card from active view or mark as completed.

---

## Verification Plan

### Automated & Manual Verification
1. **Direct Login Gate**:
   - Open `http://localhost:5173/`.
   - Verify that it lands directly on the Role Selection / Login card without entering the dashboard first.
2. **Slot Collision Detection**:
   - As a Teacher, schedule a lecture for "Class 3 - Section A" on today's date from `11:00 AM` to `11:45 AM`.
   - Attempt to schedule another lecture for "Class 3 - Section A" on the same date from `11:15 AM` to `12:00 PM`.
   - Verify conflict warning popup appears and prevents double-booking.
3. **Strict Time-Gating**:
   - Create a lecture scheduled for a future time (e.g. 1 hour from now).
   - Verify Student dashboard shows countdown and locks the Join Meeting button.
   - Set start time to current time: verify button unlocks as **"Join Meeting"**.
4. **Meeting Termination & Automated Cleanup**:
   - Start the meeting as Teacher in one tab and join as Student in another tab.
   - Click **"End Meeting for All"** as Teacher.
   - Verify Student gets notified, meeting closes, and the lecture is no longer shown as "Live Now" on both dashboards.
