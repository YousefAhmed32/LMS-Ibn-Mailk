/**
 * Unit Tests for YouTube Utilities
 */

const {
  extractVideoId,
  extractVideoIdFromIframe,
  toEmbedUrl,
  parseIframe,
  isAllowedDomain,
  sanitizeVideoInput,
  validateVideoInput
} = require('../utils/youtubeUtils');

describe('YouTube Utils', () => {
  describe('extractVideoId', () => {
    test('should extract video ID from watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = extractVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from youtu.be URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const videoId = extractVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const videoId = extractVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      const videoId = extractVideoId(url);
      expect(videoId).toBeNull();
    });

    test('should return null for empty input', () => {
      expect(extractVideoId('')).toBeNull();
      expect(extractVideoId(null)).toBeNull();
      expect(extractVideoId(undefined)).toBeNull();
    });
  });

  describe('extractVideoIdFromIframe', () => {
    test('should extract video ID from embed iframe src', () => {
      const iframeSrc = 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1';
      const videoId = extractVideoIdFromIframe(iframeSrc);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from watch URL in iframe src', () => {
      const iframeSrc = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = extractVideoIdFromIframe(iframeSrc);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should return null for invalid iframe src', () => {
      const iframeSrc = 'https://example.com/embed/video';
      const videoId = extractVideoIdFromIframe(iframeSrc);
      expect(videoId).toBeNull();
    });
  });

  describe('toEmbedUrl', () => {
    test('should generate basic embed URL', () => {
      const videoId = 'dQw4w9WgXcQ';
      const embedUrl = toEmbedUrl(videoId);
      expect(embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0');
    });

    test('should generate embed URL with custom options', () => {
      const videoId = 'dQw4w9WgXcQ';
      const options = {
        controls: 0,
        rel: 1,
        enablejsapi: 1,
        origin: 'https://example.com',
        autoplay: 1
      };
      const embedUrl = toEmbedUrl(videoId, options);
      expect(embedUrl).toContain('controls=0');
      expect(embedUrl).toContain('rel=1');
      expect(embedUrl).toContain('enablejsapi=1');
      expect(embedUrl).toContain('origin=https%3A%2F%2Fexample.com');
      expect(embedUrl).toContain('autoplay=1');
    });

    test('should throw error for invalid video ID', () => {
      expect(() => toEmbedUrl('')).toThrow('Valid video ID is required');
      expect(() => toEmbedUrl(null)).toThrow('Valid video ID is required');
    });
  });

  describe('parseIframe', () => {
    test('should parse valid iframe HTML', () => {
      const iframeHtml = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315"></iframe>';
      const result = parseIframe(iframeHtml);
      expect(result.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.attributes.width).toBe('560');
      expect(result.attributes.height).toBe('315');
    });

    test('should parse iframe with additional attributes', () => {
      const iframeHtml = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="100%" height="315" allowfullscreen title="Test Video"></iframe>';
      const result = parseIframe(iframeHtml);
      expect(result.attributes.allowfullscreen).toBe('');
      expect(result.attributes.title).toBe('Test Video');
    });

    test('should throw error for invalid iframe', () => {
      expect(() => parseIframe('<div>Not an iframe</div>')).toThrow('Invalid iframe format');
      expect(() => parseIframe('')).toThrow('Valid iframe HTML is required');
    });
  });

  describe('isAllowedDomain', () => {
    test('should return true for allowed YouTube domains', () => {
      expect(isAllowedDomain('https://www.youtube.com/embed/video')).toBe(true);
      expect(isAllowedDomain('https://youtube.com/embed/video')).toBe(true);
      expect(isAllowedDomain('https://youtu.be/video')).toBe(true);
      expect(isAllowedDomain('https://www.youtube-nocookie.com/embed/video')).toBe(true);
    });

    test('should return false for disallowed domains', () => {
      expect(isAllowedDomain('https://example.com/embed/video')).toBe(false);
      expect(isAllowedDomain('https://vimeo.com/video')).toBe(false);
      expect(isAllowedDomain('https://malicious-site.com/embed')).toBe(false);
    });

    test('should return false for invalid URLs', () => {
      expect(isAllowedDomain('not-a-url')).toBe(false);
      expect(isAllowedDomain('')).toBe(false);
      expect(isAllowedDomain(null)).toBe(false);
    });
  });

  describe('validateVideoInput', () => {
    test('should validate correct video input', () => {
      const videoInput = {
        inputType: 'url',
        input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Test Video'
      };
      const result = validateVideoInput(videoInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate iframe input', () => {
      const videoInput = {
        inputType: 'iframe',
        input: '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>',
        title: 'Test Video'
      };
      const result = validateVideoInput(videoInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid input type', () => {
      const videoInput = {
        inputType: 'invalid',
        input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      };
      const result = validateVideoInput(videoInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('inputType must be either "url" or "iframe"');
    });

    test('should reject missing input', () => {
      const videoInput = {
        inputType: 'url',
        input: ''
      };
      const result = validateVideoInput(videoInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('input is required');
    });

    test('should reject invalid YouTube URL', () => {
      const videoInput = {
        inputType: 'url',
        input: 'https://example.com/video'
      };
      const result = validateVideoInput(videoInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid YouTube URL - could not extract video ID');
    });
  });

  describe('sanitizeVideoInput', () => {
    test('should sanitize URL input', () => {
      const videoInput = {
        inputType: 'url',
        input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Test Video',
        enableJsApi: true,
        origin: 'https://example.com'
      };
      const result = sanitizeVideoInput(videoInput);
      
      expect(result.provider).toBe('youtube');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.title).toBe('Test Video');
      expect(result.embedSrc).toContain('dQw4w9WgXcQ');
      expect(result.embedSrc).toContain('controls=1');
      expect(result.embedSrc).toContain('rel=0');
      expect(result.embedSrc).toContain('enablejsapi=1');
      expect(result.embedSrc).toContain('origin=https%3A%2F%2Fexample.com');
      expect(result.rawInputType).toBe('url');
      expect(result.enableJsApi).toBe(true);
      expect(result.sanitizedAt).toBeInstanceOf(Date);
    });

    test('should sanitize iframe input', () => {
      const videoInput = {
        inputType: 'iframe',
        input: '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315"></iframe>',
        title: 'Test Video'
      };
      const result = sanitizeVideoInput(videoInput);
      
      expect(result.provider).toBe('youtube');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.title).toBe('Test Video');
      expect(result.embedSrc).toContain('dQw4w9WgXcQ');
      expect(result.rawInputType).toBe('iframe');
    });

    test('should throw error for invalid input', () => {
      const videoInput = {
        inputType: 'url',
        input: 'invalid-url'
      };
      expect(() => sanitizeVideoInput(videoInput)).toThrow('Invalid YouTube URL - could not extract video ID');
    });

    test('should throw error for disallowed domain', () => {
      const videoInput = {
        inputType: 'iframe',
        input: '<iframe src="https://example.com/embed/video"></iframe>'
      };
      expect(() => sanitizeVideoInput(videoInput)).toThrow('Iframe src domain is not allowed');
    });
  });
});
