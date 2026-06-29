// Map Zoho Catalyst port to Next.js PORT env var
const catalystPort = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || '9000';
process.env.PORT = catalystPort;
console.log(`[Catalyst AppSail] Mapping X_ZOHO_CATALYST_LISTEN_PORT (${process.env.X_ZOHO_CATALYST_LISTEN_PORT}) to PORT (${process.env.PORT})`);

// Require the Next.js production server entry point
require('./server.js');
