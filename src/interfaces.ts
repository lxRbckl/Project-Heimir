export interface RepositoryDetails {
  url: string;
  title: string;
  stack: string[];
  description: string;
  show: boolean;
}

export interface RepositoryInfo {
  url: string;
  readme: string;
  defaultBranch: string;
  branches: string[];
}