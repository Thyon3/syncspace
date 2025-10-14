import aj from '../config/arcjet.js';
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtectRoute = async function (req, res, next) {
    try {
        const ip = req.ip || req.connection?.remoteAddress || "127.0.0.1";
        const decision = await aj.protect(req, { ip: req.ip });
        if (decision.isDenied) {
            if (decision.reason.isRateLimit) {
                return res.status(409).json({
                    message: 'too many requests rate limit excceded please try again later'
                });
            }
            else if (decision.reason.isBot) {
                return res.status(403).json({
                    message: "Bot access is denied"
                })
            } else {
                return res.status(403).json({
                    message: 'Access is denied by security policy please try again '
                });
            }

        } // check for spoofed bots 

        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                message: 'Malicious activity by a bot is noticed',
                type: "spoofed bot detected"
            })
        }
        next();
    } catch (error) {
        console.log('Arcejet Protection error', error),
            next();
    }
}