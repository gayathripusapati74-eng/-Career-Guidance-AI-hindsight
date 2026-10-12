const mongoose = require('mongoose');

const dataImportSchema = new mongoose.Schema(
  {
    importId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    datasetCategory: {
      type: String,
      enum: [
        'Student Master',
        'Academic Records',
        'Attendance',
        'LMS Activity',
        'Engagement',
        'Placement Assessments',
        'Skills Assessments',
        'Student Feedback',
      ],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSizeKB: Number,
    totalRows: {
      type: Number,
      required: true,
    },
    successfulRows: {
      type: Number,
      required: true,
    },
    rejectedRows: {
      type: Number,
      default: 0,
    },
    duplicateRows: {
      type: Number,
      default: 0,
    },
    rejectedDetails: [
      {
        rowNumber: Number,
        studentId: String,
        reason: String,
        dataSnippet: String,
      },
    ],
    status: {
      type: String,
      enum: ['Success', 'Partial', 'Failed'],
      default: 'Success',
    },
    uploadedBy: {
      type: String,
      default: 'Admin / Faculty User',
    },
    fieldMappings: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DataImport', dataImportSchema);
