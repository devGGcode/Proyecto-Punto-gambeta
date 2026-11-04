-- Punto Gambeta Gym · Esquema Supabase (prototipo)
-- 1) Creá el proyecto en https://supabase.com
-- 2) Pegá este archivo en SQL Editor y ejecutalo
-- 3) Copiá URL + anon key en supabase-config.js

create table if not exists socios (
  id text primary key,
  dni text unique,
  nombre text not null,
  tel text default '',
  mail text default '',
  plan_id bigint,
  inicio date,
  vence date,
  estado text default 'activo',
  obs text default '',
  updated_at timestamptz default now()
);

create table if not exists planes (
  id bigint primary key,
  nombre text not null,
  precio numeric default 0,
  precio_transf numeric default 0,
  dias int default 30,
  updated_at timestamptz default now()
);

create table if not exists personal (
  id text primary key,
  nombre text not null,
  rol text default 'Profesor',
  tel text default '',
  dni text unique,
  acceso boolean default false,
  horario jsonb default '{}',
  sueldo numeric default 0,
  updated_at timestamptz default now()
);

create table if not exists rutinas (
  id bigint primary key,
  nombre text not null,
  dificultad text default 'Principiante',
  ejercicios jsonb default '[]',
  fecha date,
  updated_at timestamptz default now()
);

create table if not exists asig (
  id bigserial primary key,
  template_id bigint references rutinas(id) on delete cascade,
  socio_id text references socios(id) on delete cascade,
  dias int[] default '{}',
  profe text default '',
  fecha date,
  updated_at timestamptz default now()
);

create table if not exists mpagos (
  id bigint primary key,
  socio_id text references socios(id) on delete cascade,
  monto numeric default 0,
  fecha date,
  detalle text default '',
  metodo text default 'Efectivo',
  updated_at timestamptz default now()
);

create table if not exists clases (
  id bigint primary key,
  nombre text not null,
  dias int[] default '{}',
  hora text default '18:00',
  horafin text default '',
  profe text default '',
  dur int default 60,
  cupo int default 20,
  updated_at timestamptz default now()
);

create table if not exists insc (
  clase_id bigint references clases(id) on delete cascade,
  socio_id text references socios(id) on delete cascade,
  primary key (clase_id, socio_id)
);

create table if not exists accesos (
  id bigint primary key,
  socio_id text references socios(id) on delete cascade,
  fecha date,
  hora text default '',
  tipo text default 'entrada',
  ok text default 'ok',
  estado text default '',
  updated_at timestamptz default now()
);

create table if not exists gprods (
  id bigint primary key,
  nombre text not null,
  cat text default 'Suplementos',
  precio numeric default 0,
  stock int default 0,
  updated_at timestamptz default now()
);

create table if not exists gventas (
  id bigint primary key,
  fecha date,
  hora text default '',
  detalle text default '',
  total numeric default 0,
  metodo text default 'Efectivo',
  updated_at timestamptz default now()
);

create table if not exists ggastos (
  id bigint primary key,
  fecha date,
  descripcion text default '',
  monto numeric default 0,
  updated_at timestamptz default now()
);

create table if not exists progreso (
  socio_id text references socios(id) on delete cascade,
  fecha date,
  template_id bigint,
  ejercicio text,
  primary key (socio_id, fecha, template_id, ejercicio)
);

create table if not exists app_state (
  clave text primary key,
  valor jsonb default '{}',
  updated_at timestamptz default now()
);

-- RLS: las políticas reales están en supabase-portal-online.sql.
-- Ejecutá ese archivo después de este esquema.
alter table socios enable row level security;
alter table planes enable row level security;
alter table personal enable row level security;
alter table rutinas enable row level security;
alter table asig enable row level security;
alter table mpagos enable row level security;
alter table clases enable row level security;
alter table insc enable row level security;
alter table accesos enable row level security;
alter table gprods enable row level security;
alter table gventas enable row level security;
alter table ggastos enable row level security;
alter table progreso enable row level security;
alter table app_state enable row level security;
