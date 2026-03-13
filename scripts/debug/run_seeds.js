const { execSync } = require('child_process');

try {
    console.log("Running seed.ts...");
    execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit', env: { ...process.env, TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS"}' } });
    
    console.log("\nRunning seed-plans.ts...");
    execSync('npx ts-node prisma/seed-plans.ts', { stdio: 'inherit', env: { ...process.env, TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS"}' } });
    
    console.log("\nRunning seed-sales.ts...");
    execSync('npx ts-node prisma/seed-sales.ts', { stdio: 'inherit', env: { ...process.env, TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS"}' } });
    
    console.log("\nAll seeds completed!");
} catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
}
