<img height="100" alt="civchesstypography" src="https://github.com/user-attachments/assets/5175512e-ab0e-4089-94e1-2e22a29a0258" />

###### By [wintrcat](https://youtube.com/@wintrcat) - sometimes I stream development!

A civilisations / MMO game that takes place on a vast Chess board. Players are Kings and will be able to capture other players to deal damage. You will also be able claim territory, build structures, and invade others.

## Local Deployment

### Prerequisites
- pnpm
- Node.js >=22
- MongoDB
- Redis (for hosting worlds)

You can use the databases' Docker images for convenience.

### Instructions
1. Clone the repository with `git clone https://github.com/wintrcat/civchess`
2. Install dependencies with `pnpm i`
3. Build the application with `pnpm build`
4. Create a `.env` file at the project root and populate with variables
5. Run the backend with `pnpm start`

> [!TIP]
> You can also run the Vite Dev server with `pnpm dev` for development builds.
> Usually you will want to run this along side the backend.

### Environment Variables
```env
# "production" or "development"
# In development mode there is a debug sign in method that works offline.
NODE_ENV=development

# The port that the backend listens on. Defaults to the port in
# PUBLIC_ORIGIN if not specified, or 8080 if neither specify a port.
PORT=8080

# The origins of the backend and Vite Dev server.
# Used as redirect URLs in OAuth, dev server proxy etc.
PUBLIC_ORIGIN=http://localhost:8080
PUBLIC_DEV_ORIGIN=http://localhost:3000

# Number of threads to run backend on. Redis is used to relay information
# between server processes.
THREAD_COUNT=1

# Database URIs for Mongo and Redis
DATABASE_URI=mongodb://localhost:27017
REDIS_DATABASE_URI=redis://localhost:6379

# Randomly generated string for JWT signing, hashing etc.
AUTH_SECRET=Etm8TNykwjMH13POGl5AR1pG7cWkS7FOWkP05R

# Client IDs / Secrets for Google and Discord login
GOOGLE_OAUTH_CLIENT_ID=hellohello.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=HELLOHE-HELLOHELLOCIVCHESS
DISCORD_OAUTH_CLIENT_ID=12345678901234567890
DISCORD_OAUTH_CLIENT_SECRET=hellohellohellocivchess

# Contact email address on TOS and Privacy Policy etc.
PUBLIC_CONTACT_EMAIL=contact@wintrchess.com
```
