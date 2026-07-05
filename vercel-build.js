const { execSync } = require("child_process");

// Set fallback DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set. Defaulting to local SQLite database: file:./dev.db");
  process.env.DATABASE_URL = "file:./dev.db";
} else {
  console.log("Using DATABASE_URL from environment:", process.env.DATABASE_URL);
}

// Set fallback NEXTAUTH_SECRET and NEXTAUTH_URL for build time validation
if (!process.env.NEXTAUTH_SECRET) {
  console.log("NEXTAUTH_SECRET is not set. Defaulting to dummy secret for build validation.");
  process.env.NEXTAUTH_SECRET = "dummy-nextauth-secret-for-build-validation-12345678";
}

if (!process.env.NEXTAUTH_URL) {
  console.log("NEXTAUTH_URL is not set. Defaulting to http://localhost:3000 for build validation.");
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}

try {
  console.log("Step 1: Running prisma db push...");
  execSync("npx prisma db push", { stdio: "inherit" });

  console.log("Step 2: Running prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("Step 3: Running database seed...");
  execSync("node prisma/seed.js", { stdio: "inherit" });

  console.log("Step 4: Running next build...");
  execSync("npx next build", { stdio: "inherit" });

  console.log("Build successfully completed!");
} catch (error) {
  console.error("Build failed during execution of vercel-build script:", error);
  process.exit(1);
}
