const { body } = require('express-validator');

async function testNormalizeEmail() {
  console.log('🧪 Testing normalizeEmail function...');
  
  const testEmails = [
    'admin@test.com',
    'ADMIN@TEST.COM',
    ' admin@test.com ',
    'admin@example.com',
    'ADMIN@EXAMPLE.COM'
  ];
  
  for (const email of testEmails) {
    console.log(`\n🔍 Testing email: "${email}"`);
    
    try {
      // Create a validation rule
      const validationRule = body('userEmail')
        .isEmail()
        .normalizeEmail();
      
      // Create a mock request object
      const mockReq = {
        body: { userEmail: email }
      };
      
      // Run the validation
      await validationRule.run(mockReq);
      
      console.log('✅ Normalized email:', mockReq.body.userEmail);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

testNormalizeEmail();
