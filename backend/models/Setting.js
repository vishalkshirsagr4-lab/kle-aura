const mongoose = require("mongoose");
const memoryStore = require("../db/memoryStore");

const URL_RE = /^(https?:\/\/\S+)?$/;

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    eventDate: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Event date must be YYYY-MM-DD"],
    },
    startTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "Start time must be HH:MM"],
    },
    endTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "End time must be HH:MM"],
    },
    venue: { type: String, trim: true, maxlength: [120, "Venue is too long"] },
    instagram: { type: String, trim: true, match: [URL_RE, "Instagram link must start with http:// or https://"] },
    youtube: { type: String, trim: true, match: [URL_RE, "YouTube link must start with http:// or https://"] },
    facebook: { type: String, trim: true, match: [URL_RE, "Facebook link must start with http:// or https://"] },
    linkedin: { type: String, trim: true, match: [URL_RE, "LinkedIn link must start with http:// or https://"] },
    website: { type: String, trim: true, match: [URL_RE, "Website link must start with http:// or https://"] },
  },
  { timestamps: true }
);

const RealSetting = mongoose.model("Setting", settingSchema);

const SettingProxy = {
  findOne: (query) => {
    if (mongoose.connection.readyState === 1) {
      return RealSetting.findOne(query);
    }
    const current = memoryStore.getSettings();
    return {
      lean: () => Promise.resolve({ ...current }),
      then: (resolve, reject) => Promise.resolve({ ...current }).then(resolve, reject),
    };
  },
  findOneAndUpdate: (query, update, options) => {
    if (mongoose.connection.readyState === 1) {
      return RealSetting.findOneAndUpdate(query, update, options);
    }
    const current = memoryStore.getSettings();
    const updated = {
      ...current,
      ...(update.$set || update),
    };
    memoryStore.setSettings(updated);
    return {
      lean: () => Promise.resolve({ ...updated }),
      then: (resolve, reject) => Promise.resolve({ ...updated }).then(resolve, reject),
    };
  },
};

module.exports = SettingProxy;
