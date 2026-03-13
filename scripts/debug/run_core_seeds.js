const { execSync } = require('child_process');

try {
    console.log("Running seed-plans.ts...");
    execSync('npx ts-node prisma/seed-plans.ts', { stdio: 'inherit', env: { ...process.env, TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS"}' } });
    console.log("\nCore seeds completed!");
} catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
}
