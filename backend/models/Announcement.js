const mongoose = require("mongoose");
const memoryStore = require("../db/memoryStore");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or less"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message must be 1000 characters or less"],
    },
    category: {
      type: String,
      enum: ["general", "date", "important"],
      default: "general",
    },
    date: {
      type: String,
      trim: true,
      default: "",
      match: [/^(\d{4}-\d{2}-\d{2})?$/, "Date must be in YYYY-MM-DD format"],
    },
  },
  { timestamps: true }
);

const RealAnnouncement = mongoose.model("Announcement", announcementSchema);

const AnnouncementProxy = {
  find: (query) => {
    if (mongoose.connection.readyState === 1) {
      return RealAnnouncement.find(query);
    }
    const store = memoryStore.getAnnouncements();
    return {
      sort: (sortObj) => {
        const sorted = [...store].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        return Promise.resolve(sorted);
      },
      then: (resolve, reject) => {
        const sorted = [...store].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        return Promise.resolve(sorted).then(resolve, reject);
      },
    };
  },
  create: async (data) => {
    if (mongoose.connection.readyState === 1) {
      return RealAnnouncement.create(data);
    }
    const newItem = {
      _id: memoryStore.genId(),
      title: data.title || "",
      message: data.message || "",
      category: data.category || "general",
      date: data.date || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = memoryStore.getAnnouncements();
    list.unshift(newItem);
    memoryStore.setAnnouncements(list);
    return newItem;
  },
  findByIdAndUpdate: async (id, updateData, options) => {
    if (mongoose.connection.readyState === 1) {
      return RealAnnouncement.findByIdAndUpdate(id, updateData, options);
    }
    const list = memoryStore.getAnnouncements();
    const idx = list.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    const updated = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    memoryStore.setAnnouncements(list);
    return updated;
  },
  findByIdAndDelete: async (id) => {
    if (mongoose.connection.readyState === 1) {
      return RealAnnouncement.findByIdAndDelete(id);
    }
    const list = memoryStore.getAnnouncements();
    const idx = list.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    const [removed] = list.splice(idx, 1);
    memoryStore.setAnnouncements(list);
    return removed;
  },
};

module.exports = AnnouncementProxy;
