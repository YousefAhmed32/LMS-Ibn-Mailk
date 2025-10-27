const { body } = require('express-validator');

async function testNormalizeEmailDetailed() {
  console.log('🧪 Testing normalizeEmail function in detail...');
  
  const testEmails = [
    'admin@example.com',
    'ADMIN@EXAMPLE.COM',
    ' admin@example.com ',
    'admin@example.com',
    'admin@test.com',
    'ADMIN@TEST.COM'
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
      
      console.log('✅ Original email:', `"${email}"`);
      console.log('✅ Normalized email:', `"${mockReq.body.userEmail}"`);
      console.log('✅ Length difference:', email.length - mockReq.body.userEmail.length);
      
      // Check if the normalized email is different
      if (email !== mockReq.body.userEmail) {
        console.log('⚠️  Email was modified by normalizeEmail()');
      } else {
        console.log('✅ Email was not modified');
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  // Test with a more complex case
  console.log('\n🔍 Testing with complex email...');
  
  const complexEmail = 'Admin.User+test@example.com';
  console.log(`Original: "${complexEmail}"`);
  
  try {
    const validationRule = body('userEmail')
      .isEmail()
      .normalizeEmail();
    
    const mockReq = {
      body: { userEmail: complexEmail }
    };
    
    await validationRule.run(mockReq);
    
    console.log(`Normalized: "${mockReq.body.userEmail}"`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testNormalizeEmailDetailed();
