import localforage from 'localforage';

// Configure LocalForage instances
const lessonStore = localforage.createInstance({
  name: 'PalashTechSetu',
  storeName: 'lessons_cache'
});

const worksheetStore = localforage.createInstance({
  name: 'PalashTechSetu',
  storeName: 'worksheets_cache'
});

const progressStore = localforage.createInstance({
  name: 'PalashTechSetu',
  storeName: 'student_progress'
});

const syncQueueStore = localforage.createInstance({
  name: 'PalashTechSetu',
  storeName: 'sync_queue'
});

export const storageService = {
  // Save or retrieve cached lessons
  async saveLesson(lessonId, data) {
    return await lessonStore.setItem(lessonId, { ...data, savedAt: Date.now() });
  },
  async getLesson(lessonId) {
    return await lessonStore.getItem(lessonId);
  },
  async getAllLessons() {
    const keys = await lessonStore.keys();
    const items = [];
    for (const k of keys) {
      const item = await lessonStore.getItem(k);
      if (item) items.push(item);
    }
    return items;
  },

  // Worksheets
  async saveWorksheet(worksheetId, data) {
    return await worksheetStore.setItem(worksheetId, { ...data, savedAt: Date.now() });
  },
  async getAllWorksheets() {
    const keys = await worksheetStore.keys();
    const items = [];
    for (const k of keys) {
      const item = await worksheetStore.getItem(k);
      if (item) items.push(item);
    }
    return items;
  },

  // Student Gamification & Progress
  async getStudentProgress() {
    const progress = await progressStore.getItem('current_student_stats');
    return progress || {
      stars: 45,
      streakDays: 4,
      level: 2,
      completedQuizzes: 6,
      badges: ["Birsa Explorer", "Palash Master", "Sal Forest Scholar"],
      history: []
    };
  },
  async updateStudentProgress(updates) {
    const current = await this.getStudentProgress();
    const updated = { ...current, ...updates, lastUpdated: Date.now() };
    await progressStore.setItem('current_student_stats', updated);
    
    // Add to sync queue for cloud sync
    await this.addToSyncQueue({
      type: 'student_progress_update',
      data: updated,
      timestamp: Date.now()
    });
    return updated;
  },

  // Sync Queue for Offline Tablet
  async addToSyncQueue(item) {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await syncQueueStore.setItem(id, item);
  },
  async getSyncQueue() {
    const keys = await syncQueueStore.keys();
    const items = [];
    for (const k of keys) {
      const it = await syncQueueStore.getItem(k);
      if (it) items.push({ key: k, ...it });
    }
    return items;
  },
  async clearSyncQueue() {
    await syncQueueStore.clear();
  }
};
