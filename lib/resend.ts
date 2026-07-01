import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@skarp.fr'
const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://skarp.fr'

export async function sendWelcomeEmail(to: string, name: string, role: 'sportif' | 'coach') {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Bienvenue sur SKARP.',
    html: `
      <div style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:520px">
        <h1 style="font-size:36px;font-weight:800;text-transform:uppercase;margin-bottom:8px">
          Bienvenue <span style="color:#C6FF34">${name}</span>
        </h1>
        <p style="color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:24px">
          ${role === 'coach'
            ? 'Ton profil coach est en cours de création. Complète-le pour commencer à recevoir des élèves.'
            : 'Ton compte sportif est créé. Commence par compléter ton profil pour trouver le coach parfait.'}
        </p>
        <a href="${APP}/${role === 'coach' ? 'coach-dashboard' : 'dashboard'}"
           style="background:#C6FF34;color:#171717;padding:12px 28px;font-weight:800;text-transform:uppercase;text-decoration:none;letter-spacing:.04em;display:inline-block">
          Accéder à mon espace
        </a>
      </div>
    `,
  })
}

export async function sendPaymentConfirmation(to: string, name: string, amount: number, description: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Paiement confirmé — ${amount}€`,
    html: `
      <div style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:520px">
        <h1 style="font-size:28px;font-weight:800;text-transform:uppercase;margin-bottom:8px">
          Paiement <span style="color:#C6FF34">confirmé</span>
        </h1>
        <p style="color:rgba(255,255,255,.6);line-height:1.7">Bonjour ${name},</p>
        <p style="color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:16px">
          Ton paiement de <strong style="color:#C6FF34">${amount}€</strong> pour <em>${description}</em> a bien été enregistré.
        </p>
        <a href="${APP}/dashboard" style="background:#C6FF34;color:#171717;padding:12px 28px;font-weight:800;text-transform:uppercase;text-decoration:none;display:inline-block">
          Voir mon dashboard
        </a>
      </div>
    `,
  })
}

export async function sendDouleurAlertToCoach(coachEmail: string, coachName: string, sportifName: string, description: string) {
  return getResend().emails.send({
    from: FROM,
    to: coachEmail,
    subject: `⚠️ Alerte douleur — ${sportifName}`,
    html: `
      <div style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:520px">
        <h1 style="font-size:24px;font-weight:800;text-transform:uppercase;margin-bottom:8px;color:#FF4D4D">
          Alerte douleur signalée
        </h1>
        <p style="color:rgba(255,255,255,.6);margin-bottom:12px">Bonjour ${coachName},</p>
        <p style="color:rgba(255,255,255,.6);margin-bottom:16px">
          <strong>${sportifName}</strong> a signalé une douleur :
        </p>
        <blockquote style="border-left:3px solid #FF4D4D;padding:12px 16px;background:rgba(255,77,77,.06);color:rgba(255,255,255,.8);margin-bottom:20px">
          ${description}
        </blockquote>
        <a href="${APP}/coach-dashboard" style="background:#C6FF34;color:#171717;padding:12px 28px;font-weight:800;text-transform:uppercase;text-decoration:none;display:inline-block">
          Voir le détail
        </a>
      </div>
    `,
  })
}

export async function sendNewMessageNotif(to: string, name: string, senderName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Nouveau message de ${senderName}`,
    html: `
      <div style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:520px">
        <p style="color:rgba(255,255,255,.6)">Bonjour ${name},</p>
        <p style="color:rgba(255,255,255,.6);margin-bottom:20px">
          <strong>${senderName}</strong> t'a envoyé un message sur SKARP.
        </p>
        <a href="${APP}/dashboard/messagerie" style="background:#C6FF34;color:#171717;padding:12px 28px;font-weight:800;text-transform:uppercase;text-decoration:none;display:inline-block">
          Lire le message
        </a>
      </div>
    `,
  })
}

export async function sendBilanReminder(to: string, name: string, coachName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Rappel — bilan hebdomadaire à remplir',
    html: `
      <div style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:520px">
        <p style="color:rgba(255,255,255,.6)">Bonjour ${name},</p>
        <p style="color:rgba(255,255,255,.6);margin-bottom:20px">
          ${coachName} attend ton bilan de la semaine. Ça prend moins de 2 minutes.
        </p>
        <a href="${APP}/dashboard/bilans" style="background:#C6FF34;color:#171717;padding:12px 28px;font-weight:800;text-transform:uppercase;text-decoration:none;display:inline-block">
          Remplir mon bilan
        </a>
      </div>
    `,
  })
}

export async function sendReservationConfirmation(
  to: string, name: string, coachName: string, dateHeure: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Réservation confirmée — ${coachName}`,
    html: `
      <div style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:520px">
        <h1 style="font-size:24px;font-weight:800;text-transform:uppercase;margin-bottom:8px">
          Séance <span style="color:#C6FF34">confirmée</span>
        </h1>
        <p style="color:rgba(255,255,255,.6);margin-bottom:12px">Bonjour ${name},</p>
        <p style="color:rgba(255,255,255,.6);margin-bottom:20px">
          Ta séance avec <strong>${coachName}</strong> est confirmée le <strong>${dateHeure}</strong>.
        </p>
        <a href="${APP}/dashboard/reservations" style="background:#C6FF34;color:#171717;padding:12px 28px;font-weight:800;text-transform:uppercase;text-decoration:none;display:inline-block">
          Voir mes réservations
        </a>
      </div>
    `,
  })
}
