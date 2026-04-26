create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  description text,
  product_type text,
  target_users text,
  style_preference text,
  reference_style text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table design_systems (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  brand_keywords jsonb,
  color_palette jsonb,
  typography jsonb,
  ui_style text,
  icon_style text,
  illustration_style text,
  layout_rules jsonb,
  component_rules jsonb,
  negative_rules jsonb,
  prompt_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  asset_type text not null,
  title text,
  user_request text,
  compiled_prompt text,
  file_url text,
  storage_path text,
  thumbnail_url text,
  size text,
  format text,
  status text default 'generated',
  style_score int,
  created_at timestamptz default now()
);

create table asset_feedback (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  feedback_type text,
  feedback_text text,
  created_at timestamptz default now()
);

create table generation_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  asset_id uuid references assets(id),
  model text,
  input jsonb,
  output jsonb,
  created_at timestamptz default now()
);
