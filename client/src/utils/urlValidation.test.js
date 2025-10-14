// Unit tests for URL validation
const isValidExternalUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
};

// Test cases
const testCases = [
  // Valid URLs
  {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSeQHFgGW2jb2NOXEFiHUZVwlFHHe8Gyv4yuNLOfOAhOO7VvBA/viewform?usp=sharing&ouid=100899115287218413340',
    expected: true,
    description: 'Provided Google Forms test link'
  },
  {
    url: 'https://docs.google.com/forms/d/1FAIpQLSeQHFgGW2jb2NOXEFiHUZVwlFHHe8Gyv4yuNLOfOAhOO7VvBA/edit',
    expected: true,
    description: 'Google Forms edit link'
  },
  {
    url: 'https://forms.gle/abc123',
    expected: true,
    description: 'Google Forms short link'
  },
  {
    url: 'https://example.com/exam',
    expected: true,
    description: 'Generic HTTPS URL'
  },
  {
    url: 'http://example.com/exam',
    expected: true,
    description: 'Generic HTTP URL'
  },
  
  // Invalid URLs
  {
    url: 'not-a-url',
    expected: false,
    description: 'Invalid URL string'
  },
  {
    url: 'ftp://example.com',
    expected: false,
    description: 'FTP protocol (not allowed)'
  },
  {
    url: 'javascript:alert("xss")',
    expected: false,
    description: 'JavaScript protocol (security)'
  },
  {
    url: '',
    expected: false,
    description: 'Empty string'
  },
  {
    url: null,
    expected: false,
    description: 'Null value'
  },
  {
    url: undefined,
    expected: false,
    description: 'Undefined value'
  }
];

// Run tests
console.log('Running URL validation tests...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = isValidExternalUrl(testCase.url);
  const success = result === testCase.expected;
  
  if (success) {
    console.log(`✓ Test ${index + 1}: ${testCase.description}`);
    passed++;
  } else {
    console.log(`✗ Test ${index + 1}: ${testCase.description}`);
    console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
    console.log(`  URL: ${testCase.url}`);
    failed++;
  }
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

// Export for use in other files
export { isValidExternalUrl };
