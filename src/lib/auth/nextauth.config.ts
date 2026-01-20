import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Rate limiting for failed login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(username: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(username);

  if (!attempts) {
    return true; // No previous attempts
  }

  // Reset if lockout duration has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(username);
    return true;
  }

  // Check if locked out
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }

  return true;
}

function recordFailedAttempt(username: string) {
  const now = Date.now();
  const attempts = loginAttempts.get(username);

  if (!attempts) {
    loginAttempts.set(username, { count: 1, lastAttempt: now });
  } else {
    attempts.count++;
    attempts.lastAttempt = now;
  }
}

function resetAttempts(username: string) {
  loginAttempts.delete(username);
}

// Dynamically load admin users from environment variables
// Supports unlimited admins: ADMIN_USERNAME, ADMIN_USERNAME_2, ADMIN_USERNAME_3, etc.
function loadAdminUsers() {
  const users = [];
  let index = 1;

  // Load first admin (without number suffix)
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    users.push({
      id: "1",
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD, // Should be bcrypt hash
      name: process.env.ADMIN_NAME || "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
    });
    index++;
  }

  // Load additional admins (with number suffixes: _2, _3, etc.)
  let currentIndex = 2;
  while (true) {
    const username = process.env[`ADMIN_USERNAME_${currentIndex}`];
    const password = process.env[`ADMIN_PASSWORD_${currentIndex}`];

    if (!username || !password) {
      break; // Stop when no more admins are found
    }

    users.push({
      id: String(index),
      username,
      password, // Should be bcrypt hash
      name: process.env[`ADMIN_NAME_${currentIndex}`] || `Admin User ${currentIndex}`,
      email: process.env[`ADMIN_EMAIL_${currentIndex}`] || `admin${currentIndex}@example.com`,
    });

    index++;
    currentIndex++;
  }

  return users;
}

const ADMIN_USERS = loadAdminUsers();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("---- AUTH DEBUG START ----");
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        console.log(`Attempting login for: ${credentials.username}`);

        // Check rate limiting
        if (!checkRateLimit(credentials.username)) {
          console.warn(`Rate limit exceeded for user: ${credentials.username}`);
          return null;
        }

        // Find user by username
        const user = ADMIN_USERS.find(
          (u) => u.username === credentials.username
        );

        if (!user) {
          console.log("User not found in ADMIN_USERS");
          console.log("Available users:", ADMIN_USERS.map(u => u.username));
          recordFailedAttempt(credentials.username);
          return null;
        }

        console.log("User found. Verifying password...");
        console.log(`Stored password format: ${user.password.substring(0, 4)}...`);

        // Verify password
        // Support both bcrypt hashes and plain passwords (for backward compatibility)
        let isValid = false;
        
        try {
            if (user.password.startsWith("$2")) {
              // Bcrypt hash (supports $2a, $2b, $2y, etc.)
              isValid = await bcrypt.compare(credentials.password, user.password);
              console.log("Bcrypt compare result:", isValid);
            } else {
              // Plain password (not recommended, for development only)
              console.warn(`⚠️  User ${user.username} is using a plain password. Please use bcrypt hash!`);
              isValid = user.password === credentials.password;
              console.log("Plain text compare result:", isValid);
            }
        } catch (error) {
            console.error("Error during password comparison:", error);
        }

        console.log("Final validation result:", isValid);
        console.log("---- AUTH DEBUG END ----");

        if (!isValid) {
          recordFailedAttempt(credentials.username);
          return null;
        }

        // Successful login - reset attempts
        resetAttempts(credentials.username);

        // Return user object (without password)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
