/**
 * Test image system functionality
 * This utility helps debug image loading issues
 */

import { getImageUrl, testImageUrl, getFallbackImage } from './imageUtils';

/**
 * Test all image URLs in a group
 */
export const testGroupImages = async (group) => {
  console.log('🧪 Testing group images:', {
    groupName: group.name,
    coverImage: group.coverImage,
    hasImage: !!group.coverImage,
    timestamp: new Date().toISOString()
  });

  if (!group.coverImage) {
    console.log('ℹ️ No cover image for group:', group.name);
    return {
      hasImage: false,
      fallbackUsed: true,
      fallbackUrl: getFallbackImage('group')
    };
  }

  const imageUrl = getImageUrl(group.coverImage);
  console.log('🔗 Generated image URL:', imageUrl);

  // Test with fetch first to get more detailed error info
  let fetchResult = null;
  try {
    console.log('🌐 Testing with fetch...');
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    fetchResult = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    console.log('📡 Fetch result:', fetchResult);
  } catch (fetchError) {
    console.error('❌ Fetch error:', fetchError);
    fetchResult = {
      error: fetchError.message,
      name: fetchError.name
    };
  }

  try {
    const isAccessible = await testImageUrl(imageUrl);
    console.log('✅ Image accessibility test:', {
      accessible: isAccessible,
      url: imageUrl,
      groupName: group.name,
      fetchResult: fetchResult
    });

    return {
      hasImage: true,
      originalPath: group.coverImage,
      processedUrl: imageUrl,
      accessible: isAccessible,
      fallbackUsed: !isAccessible,
      fallbackUrl: getFallbackImage('group'),
      fetchResult: fetchResult
    };
  } catch (error) {
    console.error('❌ Error testing image:', error);
    return {
      hasImage: true,
      originalPath: group.coverImage,
      processedUrl: imageUrl,
      accessible: false,
      error: error.message,
      fallbackUsed: true,
      fallbackUrl: getFallbackImage('group'),
      fetchResult: fetchResult
    };
  }
};

/**
 * Test multiple groups at once
 */
export const testMultipleGroupImages = async (groups) => {
  console.log('🧪 Testing multiple group images:', groups.length, 'groups');
  
  const results = await Promise.all(
    groups.map(async (group) => ({
      groupId: group._id,
      groupName: group.name,
      ...(await testGroupImages(group))
    }))
  );

  const summary = {
    total: groups.length,
    withImages: results.filter(r => r.hasImage).length,
    accessible: results.filter(r => r.accessible).length,
    usingFallback: results.filter(r => r.fallbackUsed).length,
    errors: results.filter(r => r.error).length
  };

  console.log('📊 Image test summary:', summary);
  return { results, summary };
};

/**
 * Test image URL patterns
 */
export const testImageUrlPatterns = () => {
  const testCases = [
    // Full URLs
    'https://example.com/image.jpg',
    'http://localhost:3000/uploads/test.jpg',
    
    // Local paths
    '/uploads/image-1234567890-123456789.jpg',
    'image-1234567890-123456789.jpg',
    
    // GridFS paths (if used)
    '/api/image/1234567890',
    
    // Edge cases
    null,
    '',
    undefined
  ];

  console.log('🧪 Testing image URL patterns:');
  
  testCases.forEach((testCase, index) => {
    const result = getImageUrl(testCase);
    console.log(`Test ${index + 1}:`, {
      input: testCase,
      output: result,
      type: typeof testCase
    });
  });
};

/**
 * Test direct server image access
 */
export const testServerImageAccess = async (imagePath) => {
  console.log('🔍 Testing direct server access for:', imagePath);
  
  const imageUrl = getImageUrl(imagePath);
  console.log('Generated URL:', imageUrl);
  
  try {
    // Test with different methods
    const methods = ['HEAD', 'GET'];
    const results = {};
    
    for (const method of methods) {
      try {
        console.log(`Testing ${method} request...`);
        const response = await fetch(imageUrl, { 
          method: method,
          mode: 'cors',
          cache: 'no-cache'
        });
        
        results[method] = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        console.log(`${method} result:`, results[method]);
      } catch (error) {
        results[method] = {
          error: error.message,
          name: error.name
        };
        console.error(`${method} error:`, error);
      }
    }
    
    return {
      imagePath,
      imageUrl,
      results,
      success: Object.values(results).some(r => r.ok)
    };
  } catch (error) {
    console.error('❌ Server test error:', error);
    return {
      imagePath,
      imageUrl,
      error: error.message,
      success: false
    };
  }
};

/**
 * Test image in browser directly
 */
export const testImageInBrowser = (imagePath) => {
  const imageUrl = getImageUrl(imagePath);
  console.log('🌐 Opening image in new tab:', imageUrl);
  
  // Open image in new tab
  const newWindow = window.open(imageUrl, '_blank');
  
  if (newWindow) {
    console.log('✅ Image opened in new tab');
    return { success: true, url: imageUrl };
  } else {
    console.log('❌ Failed to open image in new tab (popup blocked?)');
    return { success: false, url: imageUrl };
  }
};

/**
 * Debug image system
 */
export const debugImageSystem = () => {
  console.log('🔍 Image System Debug Info:');
  console.log('Base URL:', window.location.origin);
  console.log('Current path:', window.location.pathname);
  console.log('User agent:', navigator.userAgent);
  
  // Test fallback images
  console.log('Fallback images:');
  console.log('- Group:', getFallbackImage('group'));
  console.log('- Course:', getFallbackImage('course'));
  console.log('- User:', getFallbackImage('user'));
  console.log('- Default:', getFallbackImage('default'));
  
  // Test URL patterns
  testImageUrlPatterns();
};
