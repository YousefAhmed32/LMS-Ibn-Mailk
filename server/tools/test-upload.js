const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const BASE = "http://localhost:5000";
const UPLOAD_URL = `${BASE}/api/upload/image`;
const SMALL_IMG = path.join(__dirname, "test-files", "small.jpg"); // <=5MB
const BIG_IMG = path.join(__dirname, "test-files", "big.jpg");   // >5MB
const TEXT_FILE = path.join(__dirname, "test-files", "not-image.txt");

async function upload(filePath) {
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));
  const headers = form.getHeaders();
  const resp = await axios.post(UPLOAD_URL, form, { 
    headers, 
    maxContentLength: Infinity, 
    maxBodyLength: Infinity 
  });
  return resp.data;
}

async function fetchImage(id) {
  const resp = await axios.get(`${BASE}/api/image/${id}`, { 
    responseType: "arraybuffer" 
  });
  return { 
    headers: resp.headers, 
    buffer: Buffer.from(resp.data) 
  };
}

(async () => {
  console.log("🧪 Starting GridFS Upload Tests");
  console.log("=====================================");
  
  let allTestsPassed = true;
  
  try {
    console.log("\n1️⃣ Test valid upload (<=5MB)");
    try {
      const res = await upload(SMALL_IMG);
      if (!res.success || !res.id) {
        throw new Error("Upload response invalid: " + JSON.stringify(res));
      }
      console.log("   ✅ Upload successful, id:", res.id);
      
      const fetched = await fetchImage(res.id);
      if (fetched.buffer.length === 0) {
        throw new Error("Downloaded image is empty");
      }
      console.log("   ✅ Download successful, bytes:", fetched.buffer.length, "content-type:", fetched.headers["content-type"]);
    } catch (e) { 
      console.error("   ❌ FAIL valid upload:", e.message); 
      allTestsPassed = false;
    }

    console.log("\n2️⃣ Test big file (>5MB) should be rejected");
    try {
      await upload(BIG_IMG);
      console.error("   ❌ FAIL: big file accepted (expected reject)");
      allTestsPassed = false;
    } catch (e) {
      if (e.response && (e.response.status === 413 || e.response.data.message?.includes("File too large"))) {
        console.log("   ✅ Big file correctly rejected as expected");
      } else {
        console.error("   ❌ Unexpected error for big file:", e.message);
        allTestsPassed = false;
      }
    }

    console.log("\n3️⃣ Test invalid file type (text) should be rejected");
    try {
      await upload(TEXT_FILE);
      console.error("   ❌ FAIL: text file accepted (expected reject)");
      allTestsPassed = false;
    } catch (e) {
      if (e.response && (e.response.status === 400 || e.response.data.message?.includes("Invalid file type"))) {
        console.log("   ✅ Invalid file type correctly rejected");
      } else {
        console.error("   ❌ Unexpected error for invalid file:", e.message);
        allTestsPassed = false;
      }
    }

    console.log("\n=====================================");
    if (allTestsPassed) {
      console.log("🎉 ALL TESTS PASSED");
      console.log("✅ Image upload system switched to MongoDB GridFS and verified locally");
      console.log("📤 Backend endpoint: http://localhost:5000/api/upload/image");
      console.log("🖼️  Image retrieval endpoint template: http://localhost:5000/api/image/<id>");
      process.exit(0);
    } else {
      console.log("❌ SOME TESTS FAILED");
      console.log("🔧 Please check the error messages above for remediation steps");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Test execution error:", error.message);
    process.exit(1);
  }
})();





