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
    text: `Para restablecer tu contraseña, ingresá al siguiente enlace: ${resetUrl}\n\nSi no solicitaste este cambio, podés ignorar este correo. El enlace expirará en 1 hora.`,
    html: `<p>Para restablecer tu contraseña, ingresá al siguiente enlace: <a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, podés ignorar este correo. El enlace expirará en 1 hora.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendListaEsperaPromocionEmail(
  to: string,
  claseTitulo: string,
  claseFechaHora: Date
) {
  const fechaTexto = claseFechaHora.toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  if (!smtpHost || !smtpUser) {
    console.log("=========================================");
    console.log(`No se configuró SMTP. Se liberó un cupo para ${to} en "${claseTitulo}" (${fechaTexto}).`);
    console.log("=========================================");
    return;
  }

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: "¡Se liberó un cupo para tu clase! — Sportify",
    text: `Se liberó un cupo en "${claseTitulo}" (${fechaTexto}) y sos el primero en la lista de espera. Ingresá a Sportify y confirmá tu inscripción (con el pago correspondiente) antes de que se ocupe.`,
    html: `<p>Se liberó un cupo en <strong>${claseTitulo}</strong> (${fechaTexto}) y sos el primero en la lista de espera. Ingresá a Sportify y confirmá tu inscripción (con el pago correspondiente) antes de que se ocupe.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInitialPasswordEmail(to: string, token: string) {
  const setupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/crear-password?token=${token}`;

  if (!smtpHost || !smtpUser) {
    console.log("=========================================");
    console.log(`No se configuró SMTP. Enlace de creación de contraseña para ${to}:`);
    console.log(setupUrl);
    console.log("=========================================");
    return;
  }

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: "Invitación a Sportify",
    text: `Fuiste invitado a unirte a Sportify como profesor. Seguí el enlace a continuación para completar tu registro: ${setupUrl}`,
    html: `<p>Fuiste invitado a unirte a Sportify como profesor. Seguí el enlace a continuación para completar tu registro: <a href="${setupUrl}">${setupUrl}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendClaseCanceladaEmail(
  to: string,
  nombre: string,
  claseTitulo: string,
  claseFechaHora: Date,
  tieneToken: boolean,
  montoReintegro?: number
) {
  const fechaTexto = claseFechaHora.toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  if (!smtpHost || !smtpUser) {
    console.log("=========================================");
    console.log(`Clase cancelada para ${to}`);
    console.log(`${claseTitulo} - ${fechaTexto}`);
    console.log("=========================================");
    return;
  }

  const montoTexto = montoReintegro != null
    ? `$${montoReintegro.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const mensajeReintegro = tieneToken
    ? `<p>Por ser abonado, se acreditó un crédito de clase gratis para compensar la cancelación.</p>`
    : montoTexto
      ? `<p>Recibirás tu reintegro de <strong>${montoTexto}</strong> en efectivo en el gimnasio.</p>`
      : `<p>Recibirás tu reintegro en efectivo en el gimnasio.</p>`;

  const mensajeReintegroTexto = tieneToken
    ? "Se acreditó un crédito de clase gratis para compensar la cancelación."
    : montoTexto
      ? `Recibirás tu reintegro de ${montoTexto} en efectivo en el gimnasio.`
      : "Recibirás tu reintegro en efectivo en el gimnasio.";

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: "Cancelación de clase - Sportify",
    text: `Hola ${nombre}.

La clase "${claseTitulo}" del ${fechaTexto} fue cancelada.

${mensajeReintegroTexto}

Disculpá las molestias.`,

    html: `
      <p>Hola <strong>${nombre}</strong>.</p>

      <p>Te informamos que la clase
      <strong>${claseTitulo}</strong>
      del <strong>${fechaTexto}</strong>
      fue cancelada.</p>

      ${mensajeReintegro}

      <p>Disculpá las molestias.</p>
    `,
  });
}

export async function sendClaseSuspendidaEmail(
  to: string,
  nombre: string,
  claseTitulo: string,
  disciplina: string,
  claseFechaHora: Date,
  tieneToken: boolean,
  montoReintegro?: number
) {
  const fechaTexto = claseFechaHora.toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  if (!smtpHost || !smtpUser) {
    console.log("=========================================");
    console.log(`Clase suspendida para ${to}`);
    console.log(`${claseTitulo} - ${fechaTexto}`);
    console.log("=========================================");
    return;
  }

  const montoTexto = montoReintegro != null
    ? `$${montoReintegro.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const mensajeCredito = tieneToken
    ? `<p>Por ser abonado, se acreditó un crédito de clase gratis para compensar la suspensión. El mismo puede ser utilizado en cualquier otra clase a tu elección.</p>`
    : montoTexto
      ? `<p>Recibirás tu reintegro de <strong>${montoTexto}</strong> en efectivo en el gimnasio.</p>`
      : `<p>Recibirás tu reintegro en efectivo en el gimnasio.</p>`;

  const mensajeCreditoTexto = tieneToken
    ? "Se acreditó un crédito de clase gratis para compensar la suspensión."
    : montoTexto
      ? `Recibirás tu reintegro de ${montoTexto} en efectivo en el gimnasio.`
      : "Recibirás tu reintegro en efectivo en el gimnasio.";

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: "Suspensión de clase - Sportify",
    text: `Hola ${nombre}.

La clase de ${disciplina} "${claseTitulo}" del ${fechaTexto} fue suspendida.

${mensajeCreditoTexto}

Disculpá las molestias.`,

    html: `
      <p>Hola <strong>${nombre}</strong>.</p>

      <p>Te informamos que la clase de
      <strong>${disciplina}</strong>
      "${claseTitulo}"
      del <strong>${fechaTexto}</strong>
      ha sido suspendida.</p>

      ${mensajeCredito}

      <p>Disculpá las molestias.</p>
    `,
  });
}

export async function sendReintegroInscripcionEmail(
  to: string,
  nombre: string,
  claseTitulo: string,
  claseFechaHora: Date,
  montoReintegro: number
) {
  const fechaTexto = claseFechaHora.toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const montoTexto = `$${montoReintegro.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!smtpHost || !smtpUser) {
    console.log("=========================================");
    console.log(`Reintegro por cancelación para ${to}: ${montoTexto}`);
    console.log(`${claseTitulo} - ${fechaTexto}`);
    console.log("=========================================");
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: "Cancelación de inscripción - Reintegro - Sportify",
    text: `Hola ${nombre}.

Cancelaste tu inscripción a la clase "${claseTitulo}" del ${fechaTexto}.

Recibirás tu reintegro de ${montoTexto} en efectivo en el gimnasio.

¡Hasta pronto!`,

    html: `
      <p>Hola <strong>${nombre}</strong>.</p>

      <p>Cancelaste tu inscripción a la clase
      <strong>${claseTitulo}</strong>
      del <strong>${fechaTexto}</strong>.</p>

      <p>Recibirás tu reintegro de <strong>${montoTexto}</strong> en efectivo en el gimnasio.</p>

      <p>¡Hasta pronto!</p>
    `,
  });
}