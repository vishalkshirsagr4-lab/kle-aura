const mongoose = require("mongoose");
const memoryStore = require("../db/memoryStore");

const registrationSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    college: {
      type: String,
      required: [true, "College is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    event: {
      type: String,
      required: [true, "Event is required"],
      trim: true,
    },
    pucRoll: {
      type: String,
      required: [true, "PUC roll number is required"],
      trim: true,
    },
    teamName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [60, "Team name must be 60 characters or less"],
    },
  },
  { timestamps: true }
);

const RealRegistration = mongoose.model("Registration", registrationSchema);

function RegistrationConstructor(data) {
  if (mongoose.connection.readyState === 1) {
    return new RealRegistration(data);
  }
  this.data = {
    _id: memoryStore.genId(),
    fullname: (data.fullname || "").trim(),
    email: (data.email || "").trim().toLowerCase(),
    college: (data.college || "").trim(),
    phone: (data.phone || "").trim(),
    event: (data.event || "").trim(),
    pucRoll: (data.pucRoll || "").trim(),
    teamName: (data.teamName || "").trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  this.save = async function () {
    const list = memoryStore.getRegistrations();
    list.unshift(this.data);
    memoryStore.setRegistrations(list);
    return this.data;
  };
}

RegistrationConstructor.find = (query, projection) => {
  if (mongoose.connection.readyState === 1) {
    return RealRegistration.find(query, projection);
  }
  const store = memoryStore.getRegistrations();
  const buildQuery = (data) => {
    let result = [...data];
    const queryObj = {
      sort: (sortCriteria) => {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return queryObj;
      },
      limit: (count) => {
        result = result.slice(0, count);
        return queryObj;
      },
      lean: () => Promise.resolve(result),
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return queryObj;
  };
  return buildQuery(store);
};

RegistrationConstructor.findByIdAndDelete = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return RealRegistration.findByIdAndDelete(id);
  }
  const list = memoryStore.getRegistrations();
  const idx = list.findIndex((r) => r._id === id);
  if (idx === -1) return null;
  const [removed] = list.splice(idx, 1);
  memoryStore.setRegistrations(list);
  return removed;
};

module.exports = RegistrationConstructor;
