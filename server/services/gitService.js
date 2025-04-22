// services/gitService.js
import axios from 'axios';

class GitProvider {
  constructor(provider, credentials) {
    this.provider = provider;
    this.credentials = credentials;
  }

  async createWebhook(jobId, repoUrl, webhookUrl) {
    throw new Error('Not implemented');
  }
}

class GitHubService extends GitProvider {
  async createWebhook(jobId, repoUrl, webhookUrl) {
    const [owner, repo] = this.extractRepoParts(repoUrl);
    const res = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/hooks`,
      {
        name: 'web',
        active: true,
        events: ['push', 'pull_request'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: this.credentials.secret
        }
      },
      { headers: { Authorization: `token ${this.credentials.token}` } }
    );
    return res.data.id;
  }
}

class GitLabService extends GitProvider {
  // Similar implementation for GitLab
}

class BitbucketService extends GitProvider {
  // Similar implementation for Bitbucket
}

export function getGitService(job) {
  const { provider, credentials } = job.config.repo;
  switch(provider) {
    case 'github': return new GitHubService(provider, credentials);
    case 'gitlab': return new GitLabService(provider, credentials);
    case 'bitbucket': return new BitbucketService(provider, credentials);
    default: throw new Error('Unsupported provider');
  }
}
