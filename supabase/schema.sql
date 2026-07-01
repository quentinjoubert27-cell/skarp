-- ============================================================
-- SKARP — Schéma SQL complet
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── PROFILS UTILISATEURS ──────────────────────────────────
create table users_profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('sportif', 'coach', 'admin')),
  email text not null,
  full_name text not null default '',
  avatar_url text,
  statut text not null default 'actif' check (statut in ('actif', 'suspendu', 'attente')),
  created_at timestamptz default now()
);

create table sportif_profiles (
  user_id uuid references users_profiles(id) on delete cascade primary key,
  sport text,
  discipline text,
  objectif text,
  delai text,
  niveau text,
  age int,
  sexe text,
  contraintes_physiques text,
  mode_souhaite text,
  ville text,
  code_postal text,
  rayon_km int,
  budget_mensuel int
);

create table coach_profiles (
  user_id uuid references users_profiles(id) on delete cascade primary key,
  specialite text,
  secteur_sport text,
  poste_coache text,
  niveau_coache text,
  tranche_age text,
  diplomes text,
  annees_experience int,
  mode text,
  zone_geographique text,
  tarif_mensuel int,
  description text,
  video_url text,
  lieu_travail text,
  stripe_account_id text,
  essai_gratuit_jours int default 5,
  verifie boolean default false
);

-- ── RELATION COACHING ────────────────────────────────────
create table coaching_relationships (
  id uuid primary key default gen_random_uuid(),
  sportif_id uuid references users_profiles(id) on delete cascade not null,
  coach_id uuid references users_profiles(id) on delete cascade not null,
  type text not null check (type in ('personnalise', 'programme_universel')),
  status text not null default 'essai' check (status in ('essai', 'actif', 'pause', 'termine')),
  essai_fin date,
  created_at timestamptz default now(),
  unique (sportif_id, coach_id)
);

-- ── PROGRAMMES ───────────────────────────────────────────
create table programmes_universels (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references users_profiles(id) on delete cascade not null,
  titre text not null,
  description text,
  sport text,
  niveau text,
  duree_semaines int,
  prix int not null,
  image_url text,
  created_at timestamptz default now()
);

create table achats_programmes (
  id uuid primary key default gen_random_uuid(),
  sportif_id uuid references users_profiles(id) on delete cascade not null,
  programme_id uuid references programmes_universels(id) on delete cascade not null,
  stripe_payment_id text,
  created_at timestamptz default now(),
  unique (sportif_id, programme_id)
);

-- ── SÉANCES ──────────────────────────────────────────────
create table seances (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references coaching_relationships(id) on delete cascade not null,
  date date not null,
  titre text not null,
  description text,
  statut text not null default 'prevue' check (statut in ('prevue', 'faite', 'manquee')),
  created_at timestamptz default now()
);

-- ── BILANS HEBDO ─────────────────────────────────────────
create table bilans_hebdo (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references coaching_relationships(id) on delete cascade not null,
  semaine date not null,
  fatigue int not null check (fatigue between 1 and 10),
  moral int not null check (moral between 1 and 10),
  commentaire text,
  douleur_signalee boolean default false,
  douleur_description text,
  created_at timestamptz default now(),
  unique (relationship_id, semaine)
);

-- ── MESSAGES ─────────────────────────────────────────────
create table messages (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references coaching_relationships(id) on delete cascade not null,
  sender_id uuid references users_profiles(id) on delete cascade not null,
  contenu text not null,
  lu boolean default false,
  created_at timestamptz default now()
);

-- ── DISPONIBILITÉS COACH ─────────────────────────────────
create table disponibilites_coach (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references users_profiles(id) on delete cascade not null,
  jour_semaine int not null check (jour_semaine between 0 and 6),
  heure_debut time not null,
  heure_fin time not null,
  delai_desistement_heures int default 24,
  unique (coach_id, jour_semaine, heure_debut)
);

-- ── RÉSERVATIONS PRÉSENTIEL ──────────────────────────────
create table reservations_presentiel (
  id uuid primary key default gen_random_uuid(),
  sportif_id uuid references users_profiles(id) on delete cascade not null,
  coach_id uuid references users_profiles(id) on delete cascade not null,
  date_heure timestamptz not null,
  statut text not null default 'confirmee' check (statut in ('confirmee', 'annulee', 'terminee')),
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- ── AVIS ─────────────────────────────────────────────────
create table avis (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references users_profiles(id) on delete cascade not null,
  sportif_id uuid references users_profiles(id) on delete cascade not null,
  note int not null check (note between 1 and 5),
  commentaire text,
  reponse_coach text,
  created_at timestamptz default now(),
  unique (coach_id, sportif_id)
);

-- ── PAIEMENTS ────────────────────────────────────────────
create table paiements (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references coaching_relationships(id) on delete cascade not null,
  montant int not null,
  commission int not null,
  stripe_payment_intent_id text unique,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'libere', 'rembourse')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table users_profiles enable row level security;
alter table sportif_profiles enable row level security;
alter table coach_profiles enable row level security;
alter table coaching_relationships enable row level security;
alter table programmes_universels enable row level security;
alter table achats_programmes enable row level security;
alter table seances enable row level security;
alter table bilans_hebdo enable row level security;
alter table messages enable row level security;
alter table disponibilites_coach enable row level security;
alter table reservations_presentiel enable row level security;
alter table avis enable row level security;
alter table paiements enable row level security;

-- Helper : récupère le rôle de l'utilisateur connecté
create or replace function get_user_role()
returns text language sql stable as $$
  select role from users_profiles where id = auth.uid()
$$;

-- users_profiles
create policy "Lecture publique des profils" on users_profiles for select using (true);
create policy "Mise à jour de son propre profil" on users_profiles for update using (auth.uid() = id);
create policy "Insertion par le système" on users_profiles for insert with check (auth.uid() = id);

-- coach_profiles : lecture publique, écriture propre profil
create policy "Lecture publique coach" on coach_profiles for select using (true);
create policy "Coach modifie son profil" on coach_profiles for all using (auth.uid() = user_id);

-- sportif_profiles : lecture par son coach, écriture par soi
create policy "Sportif lit son profil" on sportif_profiles for select
  using (auth.uid() = user_id or get_user_role() = 'admin');
create policy "Coach lit profil élève" on sportif_profiles for select
  using (exists (
    select 1 from coaching_relationships
    where sportif_id = sportif_profiles.user_id and coach_id = auth.uid() and status != 'termine'
  ));
create policy "Sportif modifie son profil" on sportif_profiles for all using (auth.uid() = user_id);

-- coaching_relationships
create policy "Lit ses propres relations" on coaching_relationships for select
  using (auth.uid() = sportif_id or auth.uid() = coach_id or get_user_role() = 'admin');
create policy "Sportif crée une relation" on coaching_relationships for insert
  with check (auth.uid() = sportif_id);
create policy "Parties modifient la relation" on coaching_relationships for update
  using (auth.uid() = sportif_id or auth.uid() = coach_id);

-- programmes_universels : lecture publique
create policy "Lecture publique programmes" on programmes_universels for select using (true);
create policy "Coach gère ses programmes" on programmes_universels for all using (auth.uid() = coach_id);

-- achats_programmes
create policy "Sportif voit ses achats" on achats_programmes for select using (auth.uid() = sportif_id);
create policy "Sportif achète" on achats_programmes for insert with check (auth.uid() = sportif_id);

-- seances
create policy "Parties voient les séances" on seances for select
  using (exists (
    select 1 from coaching_relationships r
    where r.id = seances.relationship_id and (r.sportif_id = auth.uid() or r.coach_id = auth.uid())
  ));
create policy "Coach gère les séances" on seances for all
  using (exists (
    select 1 from coaching_relationships r
    where r.id = seances.relationship_id and r.coach_id = auth.uid()
  ));

-- bilans_hebdo
create policy "Parties voient les bilans" on bilans_hebdo for select
  using (exists (
    select 1 from coaching_relationships r
    where r.id = bilans_hebdo.relationship_id and (r.sportif_id = auth.uid() or r.coach_id = auth.uid())
  ));
create policy "Sportif soumet un bilan" on bilans_hebdo for insert
  with check (exists (
    select 1 from coaching_relationships r
    where r.id = bilans_hebdo.relationship_id and r.sportif_id = auth.uid()
  ));

-- messages : parties de la relation uniquement (admin NE peut PAS lire)
create policy "Parties lisent leurs messages" on messages for select
  using (exists (
    select 1 from coaching_relationships r
    where r.id = messages.relationship_id and (r.sportif_id = auth.uid() or r.coach_id = auth.uid())
  ));
create policy "Parties envoient des messages" on messages for insert
  with check (
    auth.uid() = sender_id and exists (
      select 1 from coaching_relationships r
      where r.id = messages.relationship_id and (r.sportif_id = auth.uid() or r.coach_id = auth.uid())
    )
  );
create policy "Destinataire marque comme lu" on messages for update
  using (exists (
    select 1 from coaching_relationships r
    where r.id = messages.relationship_id and (r.sportif_id = auth.uid() or r.coach_id = auth.uid())
  ));

-- disponibilites_coach : lecture publique
create policy "Lecture publique dispos" on disponibilites_coach for select using (true);
create policy "Coach gère ses dispos" on disponibilites_coach for all using (auth.uid() = coach_id);

-- reservations_presentiel
create policy "Parties voient leurs réservations" on reservations_presentiel for select
  using (auth.uid() = sportif_id or auth.uid() = coach_id or get_user_role() = 'admin');
create policy "Sportif crée une réservation" on reservations_presentiel for insert
  with check (auth.uid() = sportif_id);
create policy "Parties modifient" on reservations_presentiel for update
  using (auth.uid() = sportif_id or auth.uid() = coach_id);

-- avis : lecture publique
create policy "Lecture publique avis" on avis for select using (true);
create policy "Sportif dépose un avis" on avis for insert with check (auth.uid() = sportif_id);
create policy "Coach répond à son avis" on avis for update using (auth.uid() = coach_id);

-- paiements : parties concernées + admin
create policy "Parties voient leurs paiements" on paiements for select
  using (
    get_user_role() = 'admin' or
    exists (
      select 1 from coaching_relationships r
      where r.id = paiements.relationship_id and (r.sportif_id = auth.uid() or r.coach_id = auth.uid())
    )
  );
create policy "Système insère des paiements" on paiements for insert with check (get_user_role() = 'admin');
create policy "Admin libère les paiements" on paiements for update using (get_user_role() = 'admin');

-- ============================================================
-- FONCTION : créer le profil utilisateur à l'inscription
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users_profiles (id, role, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'sportif'),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- REALTIME : activer pour la messagerie
-- ============================================================
alter publication supabase_realtime add table messages;
