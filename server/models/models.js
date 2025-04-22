import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  config: {
    steps: [{ name: String, run: String }],
    repo: {
      url: String,
      branch: { type: String, default: 'main' },
      provider: { type: String, enum: ['github', 'gitlab', 'bitbucket'] },
      secret: String, // Webhook secret
      credentials: {
        type: mongoose.Schema.Types.Mixed // { username, password } or { token }
      }
    }
  },
  webhookId: String, // ID from Git provider
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const buildSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed'],
      default: 'pending',
    },
    logs: { type: String, default: '' },
    startedAt: Date,
    finishedAt: Date,
  },
  { timestamps: true }
);

export const Build = mongoose.model('Build', buildSchema);
export const User = mongoose.model('User', userSchema);
export const Job = mongoose.model('Job', jobSchema);
