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
  /**
   * Creates a GitHub webhook for the specified repository
   * @param {string} jobId - Identifier for the job/process creating the webhook
   * @param {string} repoUrl - GitHub repository URL (e.g., "https://github.com/owner/repo")
   * @param {string} webhookUrl - URL where GitHub should send webhook payloads
   * @param {string[]} [events] - Array of GitHub events to subscribe to (default: ['push', 'pull_request'])
   * @returns {Promise<string>} - The ID of the created webhook
   * @throws {Error} - If webhook creation fails
   */

  async createWebhook(jobId, repoUrl, webhookUrl) {
    try {
      // Validate credentials
      if (!this.credentials?.token) {
        throw new Error('Missing GitHub access token');
      }

      // Extract repo parts with better validation
      const [owner, repo] = this.extractRepoParts(repoUrl);
      if (!owner || !repo) {
        throw new Error(`Invalid GitHub URL format: ${repoUrl}`);
      }

      // GitHub API request
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events: ['push', 'pull_request'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: this.credentials.secret || '',
            insecure_ssl: '0', // For development with self-signed certs: '1'
          },
        },
        {
          headers: {
            Authorization: `token ${this.credentials.token}`,
            Accept: 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          timeout: 15000,
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('GitHub Webhook Creation Error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      throw new Error(
        `GitHub API Error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  extractRepoParts(repoUrl) {
    try {
      // Handle SSH format: git@github.com:owner/repo.git
      const sshRegex = /git@github\.com:([^/]+)\/(.+?)\.git?$/;
      const sshMatch = repoUrl.match(sshRegex);
      if (sshMatch) return [sshMatch[1], sshMatch[2]];

      // Handle HTTPS format
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split('/').filter((p) => p);

      if (pathParts.length >= 2) {
        return [
          pathParts[0],
          pathParts[1].replace(/\.git$/, ''), // Remove .git suffix
        ];
      }

      throw new Error('Invalid GitHub URL structure');
    } catch (error) {
      throw new Error(`GitHub URL parsing failed: ${error.message}`);
    }
  }

  // async createWebhook(
  //   jobId,
  //   repoUrl,
  //   webhookUrl,
  //   events = ['push', 'pull_request']
  // ) {
  //   // Validate input parameters
  //   if (!repoUrl || !webhookUrl) {
  //     throw new Error(
  //       'Missing required parameters: repoUrl and webhookUrl must be provided'
  //     );
  //   }

  //   if (!Array.isArray(events) || events.length === 0) {
  //     throw new Error('Events must be a non-empty array');
  //   }

  //   try {
  //     // Extract owner and repo from URL
  //     const [owner, repo] = this.extractRepoParts(repoUrl);
  //     if (!owner || !repo) {
  //       throw new Error('Invalid repository URL format');
  //     }

  //     console.log(`[Job ${jobId}] Creating webhook for ${owner}/${repo}`);

  //     // Create the webhook via GitHub API
  //     const res = await axios.post(
  //       `https://api.github.com/repos/${owner}/${repo}/hooks`,
  //       {
  //         name: 'web',
  //         active: true,
  //         events: events,
  //         config: {
  //           url: webhookUrl,
  //           content_type: 'json',
  //           secret: this.credentials.secret,
  //           insecure_ssl: '0', // '1' to allow insecure SSL (for testing only)
  //         },
  //       },
  //       {
  //         headers: {
  //           Authorization: `token ${this.credentials.token}`,
  //           Accept: 'application/vnd.github.v3+json',
  //           'User-Agent': 'Your-App-Name',
  //         },
  //         timeout: 10000, // 10 second timeout
  //       }
  //     );

  //     console.log(
  //       `[Job ${jobId}] Webhook created successfully: ${res.data.id}`
  //     );
  //     return res.data.id;
  //   } catch (error) {
  //     const errorMessage = error.response
  //       ? `GitHub API Error: ${error.response.status} - ${JSON.stringify(
  //           error.response.data
  //         )}`
  //       : `Network Error: ${error.message}`;

  //     console.error(`[Job ${jobId}] Webhook creation failed: ${errorMessage}`);
  //     throw new Error(`Failed to create webhook: ${errorMessage}`);
  //   }
  // }

  // /**
  //  * Helper function to extract owner and repo from GitHub URL
  //  * @param {string} repoUrl - GitHub repository URL
  //  * @returns {string[]} - [owner, repository]
  //  */
  // extractRepoParts(repoUrl) {
  //   try {
  //     const url = new URL(repoUrl);
  //     const pathParts = url.pathname.split('/').filter((part) => part);
  //     if (pathParts.length < 2) {
  //       throw new Error('Invalid GitHub URL format');
  //     }
  //     return [pathParts[0], pathParts[1]];
  //   } catch (error) {
  //     throw new Error(`Failed to parse repository URL: ${error.message}`);
  //   }
  // }
  // extractRepoParts(repoUrl) {
  //   // Remove protocol and .git suffix if present
  //   // Examples of repoUrl:
  //   // https://github.com/owner/repo.git
  //   // git@github.com:owner/repo.git
  //   // https://github.com/owner/repo

  //   let cleanedUrl = repoUrl;

  //   // Remove .git suffix
  //   if (cleanedUrl.endsWith('.git')) {
  //     cleanedUrl = cleanedUrl.slice(0, -4);
  //   }

  //   // Remove protocol prefix
  //   cleanedUrl = cleanedUrl.replace(/^git@github\.com:/, '');
  //   cleanedUrl = cleanedUrl.replace(/^https?:\/\/github\.com\//, '');

  //   // Now cleanedUrl should be like 'owner/repo'
  //   const parts = cleanedUrl.split('/');
  //   if (parts.length < 2) {
  //     throw new Error(`Invalid GitHub repo URL: ${repoUrl}`);
  //   }

  //   const owner = parts[0];
  //   const repo = parts[1];
  //   return [owner, repo];
  // }

  // async createWebhook(jobId, repoUrl, webhookUrl) {
  //   const [owner, repo] = this.extractRepoParts(repoUrl);
  //   console.log(owner + ' ', repo);

  //   const res = await axios.post(
  //     `https://api.github.com/repos/${owner}/${repo}/hooks`,
  //     {
  //       name: 'web',
  //       active: true,
  //       events: ['push', 'pull_request'],
  //       config: {
  //         url: webhookUrl,
  //         content_type: 'json',
  //         secret: this.credentials.secret,
  //       },
  //     },
  //     { headers: { Authorization: `token ${this.credentials.token}` } }
  //   );
  //   return res.data.id;
  // }
}

class GitLabService extends GitProvider {
  // Similar implementation for GitLab
}

class BitbucketService extends GitProvider {
  // Similar implementation for Bitbucket
}

export function getGitService(job) {
  const { provider, credentials } = job.config.repo;
  switch (provider) {
    case 'github':
      return new GitHubService(provider, credentials);
    case 'gitlab':
      return new GitLabService(provider, credentials);
    case 'bitbucket':
      return new BitbucketService(provider, credentials);
    default:
      throw new Error('Unsupported provider');
  }
}
