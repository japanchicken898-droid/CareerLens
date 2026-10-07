/**
 * Skill Normalization Utility
 *
 * Preserves raw text exactly as found.
 * Maps common aliases to a canonical name.
 * Does NOT verify skills — that is Step 3.
 */

/** Map: lowercase alias → canonical display name */
const SKILL_ALIASES: Record<string, string> = {
  // JavaScript
  js: "JavaScript",
  javascript: "JavaScript",
  "node.js": "Node.js",
  nodejs: "Node.js",
  node: "Node.js",
  "next.js": "Next.js",
  nextjs: "Next.js",
  "react.js": "React",
  reactjs: "React",
  react: "React",
  "vue.js": "Vue.js",
  vuejs: "Vue.js",
  vue: "Vue.js",
  "angular.js": "Angular",
  angularjs: "Angular",
  angular: "Angular",
  svelte: "Svelte",
  "svelte.js": "Svelte",
  typescript: "TypeScript",
  ts: "TypeScript",
  express: "Express.js",
  "express.js": "Express.js",
  fastify: "Fastify",
  nestjs: "NestJS",
  "nest.js": "NestJS",

  // Python
  python: "Python",
  py: "Python",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  pytorch: "PyTorch",
  "torch": "PyTorch",
  tensorflow: "TensorFlow",
  tf: "TensorFlow",
  keras: "Keras",
  "scikit-learn": "scikit-learn",
  sklearn: "scikit-learn",
  pandas: "Pandas",
  numpy: "NumPy",
  matplotlib: "Matplotlib",
  seaborn: "Seaborn",

  // Java & JVM
  java: "Java",
  kotlin: "Kotlin",
  scala: "Scala",
  "spring boot": "Spring Boot",
  springboot: "Spring Boot",
  spring: "Spring",
  maven: "Maven",
  gradle: "Gradle",

  // Go
  go: "Go",
  golang: "Go",

  // Rust
  rust: "Rust",

  // C / C++ / C#
  c: "C",
  "c++": "C++",
  cpp: "C++",
  "c#": "C#",
  csharp: "C#",
  dotnet: ".NET",
  ".net": ".NET",
  "asp.net": "ASP.NET",
  aspnet: "ASP.NET",

  // Ruby
  ruby: "Ruby",
  "ruby on rails": "Ruby on Rails",
  rails: "Ruby on Rails",

  // PHP
  php: "PHP",
  laravel: "Laravel",
  symfony: "Symfony",

  // Swift / iOS
  swift: "Swift",
  "objective-c": "Objective-C",
  ios: "iOS",

  // Kotlin / Android
  android: "Android",

  // Databases
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  pg: "PostgreSQL",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  redis: "Redis",
  cassandra: "Cassandra",
  dynamodb: "DynamoDB",
  firebase: "Firebase",
  firestore: "Firestore",
  supabase: "Supabase",
  neo4j: "Neo4j",
  elasticsearch: "Elasticsearch",

  // Cloud / DevOps
  aws: "AWS",
  gcp: "GCP",
  "google cloud": "GCP",
  azure: "Azure",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  terraform: "Terraform",
  ansible: "Ansible",
  jenkins: "Jenkins",
  "github actions": "GitHub Actions",
  "ci/cd": "CI/CD",
  cicd: "CI/CD",
  nginx: "Nginx",
  apache: "Apache",
  linux: "Linux",
  bash: "Bash",
  shell: "Shell Scripting",

  // ML / AI
  "machine learning": "Machine Learning",
  ml: "Machine Learning",
  "deep learning": "Deep Learning",
  dl: "Deep Learning",
  nlp: "NLP",
  "natural language processing": "NLP",
  "computer vision": "Computer Vision",
  cv: "Computer Vision",
  llm: "LLM",
  "large language models": "LLM",
  "generative ai": "Generative AI",
  "gen ai": "Generative AI",
  mlops: "MLOps",

  // Tools
  git: "Git",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  jira: "Jira",
  figma: "Figma",
  postman: "Postman",
  graphql: "GraphQL",
  rest: "REST APIs",
  "rest api": "REST APIs",
  restful: "REST APIs",
  grpc: "gRPC",
  websocket: "WebSockets",
  websockets: "WebSockets",

  // Data / BI
  sql: "SQL",
  "power bi": "Power BI",
  tableau: "Tableau",
  excel: "Excel",
  "google sheets": "Google Sheets",
  spark: "Apache Spark",
  "apache spark": "Apache Spark",
  hadoop: "Hadoop",
  kafka: "Apache Kafka",
  "apache kafka": "Apache Kafka",
  airflow: "Apache Airflow",
  "apache airflow": "Apache Airflow",
  dbt: "dbt",

  // Frontend / Design
  html: "HTML",
  "html5": "HTML",
  css: "CSS",
  "css3": "CSS",
  tailwind: "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  sass: "Sass",
  scss: "Sass",
  "material ui": "Material UI",
  mui: "Material UI",
  "chakra ui": "Chakra UI",
  "shadcn": "shadcn/ui",
  "framer motion": "Framer Motion",
  redux: "Redux",
  zustand: "Zustand",
  mobx: "MobX",
  webpack: "Webpack",
  vite: "Vite",
  rollup: "Rollup",
  jest: "Jest",
  vitest: "Vitest",
  cypress: "Cypress",
  playwright: "Playwright",
  storybook: "Storybook",
};

/**
 * Normalize a raw skill string to its canonical name.
 * Returns the original string if no alias match is found.
 */
export function normalizeSkillName(raw: string): string {
  const key = raw.trim().toLowerCase();
  return SKILL_ALIASES[key] ?? raw.trim();
}

/**
 * Deduplicate normalized skills by their canonical name.
 * If the same canonical name appears from multiple sources, keep all entries.
 */
export function deduplicateNormalizedSkills<T extends { normalized: string; source: string }>(
  skills: T[]
): T[] {
  const seen = new Set<string>();
  return skills.filter((s) => {
    const key = `${s.normalized}::${s.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
