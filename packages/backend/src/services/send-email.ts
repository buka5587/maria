import * as nodemailer from "nodemailer";
import { fetchMeta } from "backend-rs";
import Logger from "@/services/logger.js";
import { config } from "@/config.js";
import { inspect } from "node:util";

export const logger = new Logger("email");

export async function sendEmail(
	to: string,
	subject: string,
	html: string,
	text: string,
) {
	const instanceMeta = await fetchMeta();

	const iconUrl = `${config.url}/static-assets/mi-white.png`;
	const emailSettingUrl = `${config.url}/settings/email`;

	const enableAuth =
		instanceMeta.smtpUser != null && instanceMeta.smtpUser !== "";

	const transporter = nodemailer.createTransport({
		host: instanceMeta.smtpHost,
		port: instanceMeta.smtpPort,
		secure: instanceMeta.smtpSecure,
		ignoreTLS: !enableAuth,
		proxy: config.proxySmtp,
		auth: enableAuth
			? {
					user: instanceMeta.smtpUser,
					pass: instanceMeta.smtpPass,
				}
			: undefined,
	} as any);

	try {
		const info = await transporter.sendMail({
			from: instanceMeta.email!,
			to: to,
			subject: subject,
			text: text,
			html: `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${subject}</title>
	</head>
	<body style="background: #191724; padding: 16px; margin: 0; font-family: sans-serif; font-size: 14px;">
		<main style="max-width: 500px; margin: 0 auto; background: #1f1d2e; color: #e0def4; border-radius: 20px;">
			<header style="padding: 32px; background: #31748f; color: #e0def4; display: flex; border-radius: 20px;">
				<img src="${instanceMeta.logoImageUrl || instanceMeta.iconUrl || iconUrl}" style="max-width: 128px; max-height: 72px; vertical-align: bottom; margin-right: 16px;"/>
				<h1 style="margin: 0 0 1em 0;">${instanceMeta.name}</h1>
			</header>
			<article style="padding: 32px;">
				<h1 style="color: #ebbcba !important;">${subject}</h1>
				<div style="color: #e0def4;">${html}</div>
			</article>
			<footer style="padding: 32px; border-top: solid 1px #26233a;">
				<a href="${emailSettingUrl}" style="color: #9ccfd8 !important;">${"Email Settings"}</a>
			</footer>
		</main>
		<nav style="box-sizing: border-box; max-width: 500px; margin: 16px auto 0 auto; padding: 0 32px;">
			<a href="${config.url}" style="color: #9ccfd8 !important;">${config.host}</a>
		</nav>
	</body>
</html>`,
		});

		logger.info(`Message sent: ${info.messageId}`);
	} catch (err) {
		logger.error(inspect(err));
		throw err;
	}
}
