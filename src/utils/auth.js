const crypto = require('crypto');

const SESSION_COOKIE_NAME = 'codealpha_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret';
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
const sessionStore = new Map();

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) {
        return false;
    }

    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

function signSessionId(sessionId) {
    return crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(sessionId)
        .digest('hex');
}

function serializeSessionValue(sessionId) {
    return `${sessionId}.${signSessionId(sessionId)}`;
}

function parseCookies(cookieHeader = '') {
    return cookieHeader.split(';').reduce((cookies, pair) => {
        const [rawName, ...rawValue] = pair.trim().split('=');
        if (!rawName) {
            return cookies;
        }

        cookies[rawName] = decodeURIComponent(rawValue.join('='));
        return cookies;
    }, {});
}

function readSession(req) {
    const cookies = parseCookies(req.headers.cookie);
    const cookieValue = cookies[SESSION_COOKIE_NAME];

    if (!cookieValue) {
        return null;
    }

    const [sessionId, signature] = cookieValue.split('.');
    if (!sessionId || !signature) {
        return null;
    }

    if (signSessionId(sessionId) !== signature) {
        return null;
    }

    const session = sessionStore.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
        sessionStore.delete(sessionId);
        return null;
    }

    return { sessionId, ...session };
}

function createSession(res, user) {
    const sessionId = crypto.randomBytes(24).toString('hex');
    sessionStore.set(sessionId, {
        user,
        expiresAt: Date.now() + SESSION_MAX_AGE
    });

    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE_NAME}=${serializeSessionValue(sessionId)}; Path=/; HttpOnly; Max-Age=${SESSION_MAX_AGE / 1000}; SameSite=Lax`
    );
}

function clearSession(req, res) {
    const session = readSession(req);
    if (session) {
        sessionStore.delete(session.sessionId);
    }

    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
    );
}

function attachSession(req, res, next) {
    const session = readSession(req);
    req.session = session;
    req.currentUser = session ? session.user : null;
    res.locals.currentUser = req.currentUser;
    next();
}

module.exports = {
    attachSession,
    clearSession,
    createSession,
    hashPassword,
    verifyPassword
};
