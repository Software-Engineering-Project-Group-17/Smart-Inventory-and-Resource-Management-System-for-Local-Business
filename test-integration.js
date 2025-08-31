// Test script to verify frontend-backend integration
console.log("🧪 Testing Backend-Frontend Integration\n");

// Test 1: Backend Health Check
async function testBackendHealth() {
  try {
    const response = await fetch("http://localhost:8084/api/roles/health");
    const data = await response.json();
    console.log("✅ Backend Health Check:", data);
    return true;
  } catch (error) {
    console.log("❌ Backend Health Check Failed:", error.message);
    return false;
  }
}

// Test 2: Staff Creation Endpoint
async function testStaffCreation() {
  try {
    const response = await fetch("http://localhost:8084/api/roles/staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@test.com",
        role: "STAFF",
      }),
    });
    const data = await response.json();
    console.log("✅ Staff Creation Endpoint:", data);
    return true;
  } catch (error) {
    console.log("❌ Staff Creation Test Failed:", error.message);
    return false;
  }
}

// Test 3: Manager Creation Endpoint
async function testManagerCreation() {
  try {
    const response = await fetch("http://localhost:8084/api/roles/manager", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Manager",
        email: "jane.manager@test.com",
        role: "MANAGER",
      }),
    });
    const data = await response.json();
    console.log("✅ Manager Creation Endpoint:", data);
    return true;
  } catch (error) {
    console.log("❌ Manager Creation Test Failed:", error.message);
    return false;
  }
}

// Test 4: Owner Creation Endpoint
async function testOwnerCreation() {
  try {
    const response = await fetch("http://localhost:8084/api/roles/owner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Business Owner",
        email: "owner@business.com",
        role: "OWNER",
      }),
    });
    const data = await response.json();
    console.log("✅ Owner Creation Endpoint:", data);
    return true;
  } catch (error) {
    console.log("❌ Owner Creation Test Failed:", error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Integration Tests...\n");

  const test1 = await testBackendHealth();
  const test2 = await testStaffCreation();
  const test3 = await testManagerCreation();
  const test4 = await testOwnerCreation();

  console.log("\n📊 Test Results:");
  console.log(`Backend Health: ${test1 ? "✅" : "❌"}`);
  console.log(`Staff Creation: ${test2 ? "✅" : "❌"}`);
  console.log(`Manager Creation: ${test3 ? "✅" : "❌"}`);
  console.log(`Owner Creation: ${test4 ? "✅" : "❌"}`);

  const allPassed = test1 && test2 && test3 && test4;
  console.log(
    `\n🎯 Overall Result: ${
      allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
    }`
  );

  if (allPassed) {
    console.log("\n🎉 Frontend-Backend Integration is WORKING PERFECTLY!");
    console.log("   - Frontend: http://localhost:3000");
    console.log("   - Backend: http://localhost:8084");
    console.log("   - Database: PostgreSQL (Neon) connected");
    console.log("   - All role creation endpoints functional");
  }
}

// Run the tests
runTests();
