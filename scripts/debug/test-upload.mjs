import fs from 'fs';

async function testUpload() {
    const fileBuf = fs.readFileSync('package.json');
    const blob = new Blob([fileBuf], { type: 'application/json' });

    // Create form data (using built-in web APIs in modern Node.js)
    const formData = new FormData();
    formData.append('file', blob, 'package.json');

    // Send to local API
    console.log("Sending upload request to local API...");
    const res = await fetch('http://localhost:3000/api/admin/upload', {
        method: 'POST',
        // Mock session headers for test? Actually, we might need a real JWT cookie...
        // Wait, the API checks VerifySession. This script won't have the session cookie.
        // It will return 401 Unauthorized.
    });

    console.log(res.status);
    const text = await res.text();
    console.log(text);
}

testUpload();
