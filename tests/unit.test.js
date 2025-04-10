const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');
const app = require('../app');

describe('Yale to Fale replacement logic', () => {
  
  test('should replace Yale with Fale in text content', () => {
    const $ = cheerio.load(sampleHtmlWithYale);
    
    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3; // Text nodes only
    }).each(function() {
      // Replace text content but not in URLs or attributes
      const text = $(this).text();
      const newText = app.replaceYaleWithFale(text);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    // Process title separately
    const title = $('title').text();
    $('title').text(app.replaceYaleWithFale(title));
    
    const modifiedHtml = $.html();
    
    // Check text replacements
    expect(modifiedHtml).toContain('Fale University Test Page');
    expect(modifiedHtml).toContain('Welcome to Fale University');
    expect(modifiedHtml).toContain('Fale University is a private Ivy League');
    expect(modifiedHtml).toContain('Fale was founded in 1701');
    
    // Check that URLs remain unchanged
    expect(modifiedHtml).toContain('https://www.yale.edu/about');
    expect(modifiedHtml).toContain('https://www.yale.edu/admissions');
    expect(modifiedHtml).toContain('https://www.yale.edu/images/logo.png');
    expect(modifiedHtml).toContain('mailto:info@yale.edu');
    
    // Check href attributes remain unchanged
    expect(modifiedHtml).toMatch(/href="https:\/\/www\.yale\.edu\/about"/);
    expect(modifiedHtml).toMatch(/href="https:\/\/www\.yale\.edu\/admissions"/);
    
    // Check that link text is replaced
    expect(modifiedHtml).toContain('>About Fale<');
    expect(modifiedHtml).toContain('>Fale Admissions<');
    
    // Check that alt attributes are not changed
    expect(modifiedHtml).toContain('alt="Yale Logo"');
  });

  test('should handle text that has no Yale references', () => {
    const htmlWithoutYale = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello World</h1>
        <p>This is a test page with no Yale references.</p>
      </body>
      </html>
    `;
    
    const $ = cheerio.load(htmlWithoutYale);
    
    // Apply the same replacement logic using the app function
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = app.replaceYaleWithFale(text);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const modifiedHtml = $.html();
    
    // Content should remain the same
    expect(modifiedHtml).toContain('<title>Test Page</title>');
    expect(modifiedHtml).toContain('<h1>Hello World</h1>');
    expect(modifiedHtml).toContain('<p>This is a test page with no Yale references.</p>');
  });

  test('should handle case-insensitive replacements', () => {
    const mixedCaseHtml = `
      <p>YALE University, Yale College, and yale medical school are all part of the same institution.</p>
    `;
    
    const $ = cheerio.load(mixedCaseHtml);
    
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = app.replaceYaleWithFale(text);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const modifiedHtml = $("p").html();
    
    expect(modifiedHtml).toContain('FALE University, Fale College, and fale medical school');
  });
});

// Direct tests for the replaceYaleWithFale function
describe('replaceYaleWithFale function', () => {
  test('should replace Yale with Fale in various cases', () => {
    expect(app.replaceYaleWithFale('Yale University')).toBe('Fale University');
    expect(app.replaceYaleWithFale('YALE UNIVERSITY')).toBe('FALE UNIVERSITY');
    expect(app.replaceYaleWithFale('yale university')).toBe('fale university');
    expect(app.replaceYaleWithFale('Welcome to Yale!')).toBe('Welcome to Fale!');
  });

  test('should not modify text without Yale references', () => {
    expect(app.replaceYaleWithFale('Harvard University')).toBe('Harvard University');
    expect(app.replaceYaleWithFale('')).toBe('');
    expect(app.replaceYaleWithFale('This is a test page with no Yale references.')).toBe('This is a test page with no Yale references.');
  });

  test('should handle mixed content correctly', () => {
    expect(app.replaceYaleWithFale('Yale and Harvard are both Ivy League schools')).toBe('Fale and Harvard are both Ivy League schools');
    // The function actually does replace yale.edu with fale.edu in plain text
    expect(app.replaceYaleWithFale('Contact: info@yale.edu or visit yale.edu')).toBe('Contact: info@fale.edu or visit fale.edu');
  });
});
