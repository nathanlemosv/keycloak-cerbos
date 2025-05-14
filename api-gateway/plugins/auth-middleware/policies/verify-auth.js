const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

async function verifyKeycloakToken(decoded, token) {
  try {
    const jwksUri = `${decoded.payload.iss}/protocol/openid-connect/certs`;
    const key = await jwksClient({ jwksUri }).getSigningKey(decoded.kid);
    const options = { algorithms: ['RS256'] };
    return jwt.verify(token, key.getPublicKey(), options);
  } catch (error) {
    throw new Error('Token verification failed: ' + error.message);
  }
}

async function validateKeyCloakRequest(verifiedToken) {
  if (!verifiedToken.accountId) {
    throw new Error(`Invalid Authorization token, token doesn't contains "accountId" field!`);
  }
  if (!verifiedToken.given_name) {
    throw new Error(`Invalid Authorization token, token doesn't contains "given_name" field!`);
  }
  if (!verifiedToken.domain) {
    throw new Error(`Invalid Authorization token, token doesn't contains "domain" field!`);
  }
  if (!verifiedToken.role) {
    throw new Error(`Invalid Authorization token, token doesn't contains "role" field!`);
  }
  if (!verifiedToken.sub) {
    throw new Error(`Invalid Authorization token, token doesn't contains "sub (userID)" field!`);
  }
  validateUserRole(verifiedToken.role);
}

async function addKeyCloakInfoToRequest(verifiedToken, req) {
  await validateKeyCloakRequest(verifiedToken);
  req.headers.company_id = verifiedToken.accountId;
  req.headers.account_id = verifiedToken.accountId;
  req.headers.user_id = verifiedToken.sub;
  req.headers.user_name = `${verifiedToken.given_name} ${verifiedToken.family_name || ''}`;
  req.headers.user_email = verifiedToken.email;
  req.headers.account_domain = verifiedToken.domain;
  req.headers['Accept-Language'] = verifiedToken.language || 'en';
  req.headers.role = verifiedToken.role;
}


module.exports = {
  name: "verify-auth",
  policy: (params) => {
    return async (req, res, next) => {
      let skip = false;
      if (params["exclude-patterns"] && params["exclude-patterns"].length) {
        params["exclude-patterns"].forEach(url => {
          if (req.url.includes(url)) {
            skip = true;
          }
        });
      }

      if ('OPTIONS' === req.method) {
        skip = true;
      }

      if (skip) {
        next();
        return;
      }

      if (req.headers && !req.headers.authorization) {
        res.sendStatus(401);
        return;
      }

      const token = getToken(req.headers.authorization);
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || !decoded.header) {
        res.sendStatus(401);
        return;
      }

      try {
        const verifiedToken = await verifyKeycloakToken(decoded, token);
        await addKeyCloakInfoToRequest(verifiedToken, req);
        next();
      } catch (e) {
        console.log({e});
        res.sendStatus(401);
      }
    }
  },
  schema: {
    $id: "http://express-gateway.io/schemas/policies/verify-auth.json",
    type: "object",
    properties: {
      "exclude-patterns": {
        type: ["array"],
        items: { type: "string" },
        description: "Configures the URL patterns that don't perform validation"
      }
    }
  }
};

const getToken = (token) => {
  const match = token.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error(`Invalid Authorization token - ${token} does not match "Bearer .*"`);
  }
  return match[1];
}

function validateUserRole(role) {
  switch (role) {
    case 'ADMIN':
      return;
    case 'DEVELOPMENT':
      //validate permission
      return;
    case 'MONITORING':
      //validate permission
      return;
    default:
    //validate permission
      return
  }
}
