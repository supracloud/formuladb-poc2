const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ 
    keyFilename: `${process.env.FRMDB_TOOLS_DIR}/FormulaDB-storage-full.json`,
    projectId: "seismic-plexus-232506",
});

async function listBuckets() {
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');
    buckets.forEach(bucket => {
        console.log(bucket.name);
    });
}

async function createBucketIfNotExists(bucketName) {
    await storage.createBucket(bucketName, {
        location: 'eu',
        multiRegional: true,
    })
    .catch(err => {
        if (err.code === 409) {
            console.log("Bucket already exists");
        } else {
            console.log(JSON.stringify(err, null, 4)); 
            throw err;
        }
    });
}

eval(process.argv[2]);
