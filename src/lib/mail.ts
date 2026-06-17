import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || "no-reply@sportify.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    // Esto ignora el error de que el certificado (tommy.heliohost.org) no coincide con el host (ioaquin.helioho.st)
    rejectUnauthorized: false,
  },
});

export async function sendPasswordResetEmail(to: string, token: string) {
  // En desarrollo podríamos simplemente imprimir el enlace si no hay SMTP configurado
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/restablecer?token=${token}`;

  if (!smtpHost || !smtpUser) {
    console.log("=========================================");
    console.log(`No se configuró SMTP. Enlace de recuperación para ${to}:`);
    console.log(resetUrl);
    console.log("=========================================");
    return;
  }

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: "Recuperación de contraseña — Sportify",
    text: `Para restablecer tu contraseña, ingresa al siguiente enlace: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #22c55e;">Sportify</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #22c55e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px; margin-bottom: 20px;">Restablecer contraseña</a>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>El enlace expirará en 1 hora.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
