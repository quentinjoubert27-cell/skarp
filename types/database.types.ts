export type Role = 'sportif' | 'coach' | 'admin'
export type CoachingStatus = 'essai' | 'actif' | 'pause' | 'termine'
export type CoachingType = 'personnalise' | 'programme_universel'
export type SeanceStatut = 'prevue' | 'faite' | 'manquee'
export type PaiementStatut = 'en_attente' | 'libere' | 'rembourse'
export type ReservationStatut = 'confirmee' | 'annulee' | 'terminee'
export type UserStatut = 'actif' | 'suspendu' | 'attente'

export interface UserProfile {
  id: string
  role: Role
  email: string
  full_name: string
  avatar_url: string | null
  statut: UserStatut
  created_at: string
}

export interface SportifProfile {
  user_id: string
  sport: string | null
  discipline: string | null
  objectif: string | null
  delai: string | null
  niveau: string | null
  age: number | null
  sexe: string | null
  contraintes_physiques: string | null
  mode_souhaite: string | null
  ville: string | null
  code_postal: string | null
  rayon_km: number | null
  budget_mensuel: number | null
}

export interface CoachProfile {
  user_id: string
  specialite: string | null
  secteur_sport: string | null
  poste_coache: string | null
  niveau_coache: string | null
  tranche_age: string | null
  diplomes: string | null
  annees_experience: number | null
  mode: string | null
  zone_geographique: string | null
  tarif_mensuel: number | null
  description: string | null
  video_url: string | null
  lieu_travail: string | null
  stripe_account_id: string | null
  essai_gratuit_jours: number
  verifie: boolean
  // computed from avis table
  note_moyenne?: number
  nb_avis?: number
  nb_eleves_actifs?: number
}

export interface CoachWithProfile extends UserProfile {
  coach_profiles: CoachProfile
}

export interface CoachingRelationship {
  id: string
  sportif_id: string
  coach_id: string
  type: CoachingType
  status: CoachingStatus
  essai_fin: string | null
  created_at: string
}

export interface ProgrammeUniversel {
  id: string
  coach_id: string
  titre: string
  description: string | null
  sport: string | null
  niveau: string | null
  duree_semaines: number | null
  prix: number
  image_url: string | null
  created_at: string
}

export interface AchatProgramme {
  id: string
  sportif_id: string
  programme_id: string
  stripe_payment_id: string | null
  created_at: string
}

export interface Seance {
  id: string
  relationship_id: string
  date: string
  titre: string
  description: string | null
  statut: SeanceStatut
  created_at: string
}

export interface BilanHebdo {
  id: string
  relationship_id: string
  semaine: string
  fatigue: number
  moral: number
  commentaire: string | null
  douleur_signalee: boolean
  douleur_description: string | null
  created_at: string
}

export interface Message {
  id: string
  relationship_id: string
  sender_id: string
  contenu: string
  lu: boolean
  created_at: string
}

export interface DisponibiliteCoach {
  id: string
  coach_id: string
  jour_semaine: number
  heure_debut: string
  heure_fin: string
  delai_desistement_heures: number
}

export interface ReservationPresentiel {
  id: string
  sportif_id: string
  coach_id: string
  date_heure: string
  statut: ReservationStatut
  stripe_payment_id: string | null
  created_at: string
}

export interface Avis {
  id: string
  coach_id: string
  sportif_id: string
  note: number
  commentaire: string | null
  reponse_coach: string | null
  created_at: string
}

export interface Paiement {
  id: string
  relationship_id: string
  montant: number
  commission: number
  stripe_payment_intent_id: string | null
  statut: PaiementStatut
  created_at: string
}
