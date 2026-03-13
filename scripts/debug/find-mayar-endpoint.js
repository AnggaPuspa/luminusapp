const https = require('https');

https.get('https://documenter.gw.postman.com/api/collections/25084670/2s8Z6x1sr8?segregateAuth=true&versionTag=latest', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);

            function findEndpoint(items) {
                if (!items) return;
                for (const item of items) {
                    if (item.request && item.request.url && item.request.url.raw && item.request.url.raw.includes('/payment/create')) {
                        console.log("===============================");
                        console.log("FOUND ENDPOINT: " + item.name);
                        console.log("URL: " + item.request.url.raw);
                        console.log("METHOD: " + item.request.method);
                        if (item.request.body && item.request.body.raw) {
                            console.log("BODY EXPECTED:");
                            console.log(item.request.body.raw);
                        }
                        console.log("===============================");
                    }
                    if (item.item) {
                        findEndpoint(item.item);
                    }
                }
            }

            findEndpoint(parsedData.collection.item);
        } catch (e) {
            console.error(e.message);
        }
    });
});
