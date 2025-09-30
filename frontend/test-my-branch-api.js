// Test script for the my-branch API endpoint
// You can run this in the browser console or create a simple HTML page

async function testMyBranchAPI() {
  try {
    console.log("Testing /api/branches/my-branch endpoint...");
    
    // Test with query parameter
    const testEmail = "thivinu@gmail.com"; // Replace with actual user email
    const response = await fetch(`/api/branches/my-branch?email=${encodeURIComponent(testEmail)}`);
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    const data = await response.json();
    console.log("Response data:", data);
    
    if (data.success) {
      console.log("✅ Success! User's branch:", data.branch);
      console.log("📍 Branch details:", {
        name: data.branch.name,
        location: data.branch.location,
        contact: data.branch.contactNumber,
        status: data.branch.status
      });
    } else {
      console.log("❌ Failed:", data.error);
    }
    
  } catch (error) {
    console.error("🔥 Error testing API:", error);
  }
}

// Call the test function
testMyBranchAPI();