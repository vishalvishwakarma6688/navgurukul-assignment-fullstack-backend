Progressive Student Dashboard (Full-Stack)
Objective
 Build a web application that tracks student progress across courses, recommends next steps, and visualizes learning insights.
Core Features
Email authentication, student + mentor roles
Dashboard showing:
Completed lessons
Time spent
Progress per course
Visualizations:
Trend chart (time series)
Pie/donut (distribution or completion status)


Backend API for:
Auth
Aggregates & time-series data
Lesson details
Activity events
Seeded sample data + clear setup instructions
Stretch Features
Adaptive recommendations
Export to CSV
Mentor dashboards
Tests + responsive UI
Deliverables
Full-stack repo + seed data
API documentation + screenshots


// models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "mentor"],
      default: "student",
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);



// models/Course.js

import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    totalLessons: {
      type: Number,
      default: 0,
    },

    totalDuration: {
      type: Number, // in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);

// models/Lesson.js

import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    duration: {
      type: Number, // minutes
      default: 0,
    },

    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lesson", lessonSchema);


// models/Enrollment.js

import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    progressPercentage: {
      type: Number,
      default: 0,
    },

    totalTimeSpent: {
      type: Number, // minutes
      default: 0,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Enrollment", enrollmentSchema);

// models/ActivityLog.js

import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },

    activityType: {
      type: String,
      enum: [
        "lesson_started",
        "lesson_completed",
        "time_spent",
        "course_completed",
      ],
    },

    minutesSpent: {
      type: Number,
      default: 0,
    },

    activityDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ActivityLog", activityLogSchema);