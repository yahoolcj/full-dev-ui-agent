create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  description text not null,
  product_type text not null,
  target_users text not null,
  style_preference text not null,
  reference_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists design_systems (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  brand_keywords jsonb not null default '[]'::jsonb,
  color_palette jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  ui_style text not null,
  icon_style text not null,
  illustration_style text not null,
  layout_rules jsonb not null default '[]'::jsonb,
  component_rules jsonb not null default '[]'::jsonb,
  negative_rules jsonb not null default '[]'::jsonb,
  prompt_template text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint design_systems_project_id_key unique (project_id)
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  asset_type text not null constraint assets_asset_type_check check (
    asset_type in (
      'logo_square',
      'logo_square_wordmark',
      'login_background',
      'custom_image'
    )
  ),
  title text not null,
  user_request text not null,
  compiled_prompt text not null,
  file_url text not null,
  storage_path text,
  thumbnail_url text,
  size text not null,
  format text not null,
  status text not null default 'generated' check (status in ('generated', 'failed')),
  style_score int,
  created_at timestamptz not null default now()
);

create table if not exists asset_feedback (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  feedback_type text not null check (feedback_type in ('like', 'dislike')),
  feedback_text text,
  created_at timestamptz not null default now()
);

create table if not exists generation_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  model text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists model_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider_key text not null,
  base_url text,
  api_key_env text,
  encrypted_api_key text,
  api_key_last4 text,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint model_providers_provider_key_key unique (provider_key)
);

create table if not exists model_configs (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  provider_id uuid references model_providers(id) on delete set null,
  model_name text not null,
  temperature numeric not null default 0.7,
  max_tokens int,
  top_p numeric,
  response_format text not null default 'text' check (response_format in ('text', 'json', 'image')),
  is_enabled boolean not null default true,
  is_default boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint model_configs_role_key unique (role)
);

create table if not exists model_test_runs (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  provider text not null,
  model_name text not null,
  input jsonb,
  output jsonb,
  latency_ms int,
  cost_estimate numeric,
  quality_score int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists projects_updated_at_idx on projects (updated_at desc);
create index if not exists design_systems_project_id_idx on design_systems (project_id);
create index if not exists assets_project_id_created_at_idx on assets (project_id, created_at desc);
create index if not exists asset_feedback_asset_id_idx on asset_feedback (asset_id);
create index if not exists generation_logs_project_id_created_at_idx on generation_logs (project_id, created_at desc);
create index if not exists model_configs_provider_id_idx on model_configs (provider_id);
create index if not exists model_test_runs_role_created_at_idx on model_test_runs (role, created_at desc);

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
before update on projects
for each row execute function set_updated_at();

drop trigger if exists design_systems_set_updated_at on design_systems;
create trigger design_systems_set_updated_at
before update on design_systems
for each row execute function set_updated_at();

drop trigger if exists model_providers_set_updated_at on model_providers;
create trigger model_providers_set_updated_at
before update on model_providers
for each row execute function set_updated_at();

drop trigger if exists model_configs_set_updated_at on model_configs;
create trigger model_configs_set_updated_at
before update on model_configs
for each row execute function set_updated_at();

alter table projects enable row level security;
alter table design_systems enable row level security;
alter table assets enable row level security;
alter table asset_feedback enable row level security;
alter table generation_logs enable row level security;
alter table model_providers enable row level security;
alter table model_configs enable row level security;
alter table model_test_runs enable row level security;

insert into model_providers (name, provider_key, base_url, api_key_env, is_enabled)
values
  ('OpenAI', 'openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY', true),
  ('Anthropic', 'anthropic', 'https://api.anthropic.com', 'ANTHROPIC_API_KEY', true),
  ('Google Gemini', 'google', 'https://generativelanguage.googleapis.com/v1beta', 'GOOGLE_GENERATIVE_AI_API_KEY', true),
  ('Vercel AI Gateway', 'vercel_ai_gateway', 'https://ai-gateway.vercel.sh/v1', 'AI_GATEWAY_API_KEY', true),
  ('fal', 'fal', 'https://fal.run', 'FAL_KEY', true),
  ('Replicate', 'replicate', 'https://api.replicate.com/v1', 'REPLICATE_API_TOKEN', true),
  ('Custom', 'custom', null, null, true)
on conflict (provider_key) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  api_key_env = excluded.api_key_env,
  is_enabled = excluded.is_enabled;

insert into model_configs (
  role,
  provider_id,
  model_name,
  temperature,
  response_format,
  is_enabled,
  is_default,
  notes
)
values
  ('product_understander', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4-mini', 0.4, 'json', true, true, 'Low-cost structured product understanding.'),
  ('design_system_generator', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4', 0.8, 'json', true, true, 'Core quality role for design language generation.'),
  ('prompt_compiler', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4-mini', 0.4, 'text', true, true, 'Stable and cost-efficient prompt compilation.'),
  ('asset_prompt_optimizer', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4-mini', 0.6, 'text', true, true, 'Image prompt optimization role.'),
  ('image_generator', (select id from model_providers where provider_key = 'openai'), 'gpt-image-2', 0.7, 'image', true, true, 'Generates logo, login background, and custom images.'),
  ('style_critic', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4', 0.2, 'json', true, true, 'Visual style consistency review.'),
  ('feedback_summarizer', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4-mini', 0.3, 'json', true, true, 'Low-cost feedback summarization.'),
  ('svg_converter', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4', 0.2, 'text', true, true, 'Converts image assets into editable SVG code.'),
  ('ui_code_generator', (select id from model_providers where provider_key = 'openai'), 'gpt-5.4', 0.3, 'text', true, true, 'Generates React and Tailwind UI code.')
on conflict (role) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assets',
  'assets',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
