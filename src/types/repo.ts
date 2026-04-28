export type RepoCard = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  owner_login: string;
  owner_avatar_url: string;
  html_url: string;
  updated_at: string;
};
