/**
 * Content sanitization utility for XSS protection
 * Uses DOMPurify to safely sanitize HTML content
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML string safe for innerHTML
 */
export function sanitizeHtml(content: string): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // For SSR, return plain text (strip HTML tags)
    return content.replace(/<[^>]*>/g, '')
  }

  // Configure DOMPurify for secure content
  const config = {
    // Allow common HTML tags
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'div', 'span',
      'ul', 'ol', 'li',
      'strong', 'b', 'em', 'i', 'u',
      'blockquote', 'q',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src',
      'class', 'id',
      'target', 'rel'
    ],
    
    // Only allow safe URL schemes
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    
    // Additional security settings
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    
    // Remove scripts and dangerous content
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    
    // Force target="_blank" for external links and add security attributes
    ADD_ATTR: ['target', 'rel']
  }

  // Add hook to set security attributes on external links
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    // Set target="_blank" and rel="noopener noreferrer" for external links
    if ('target' in node) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  // Sanitize the content
  const sanitized = DOMPurify.sanitize(content, config)
  
  // Clean up hooks
  DOMPurify.removeAllHooks()
  
  return sanitized
}

/**
 * Process and sanitize content with basic formatting
 * Converts plain text to HTML with security protection
 * @param content - Raw content (HTML or plain text)
 * @returns Sanitized HTML content
 */
export function processAndSanitizeContent(content: string): string {
  if (!content) return ''

  let processedContent = content

  // If content doesn't have HTML tags, convert plain text to basic HTML
  if (!content.includes('<') || !content.includes('>')) {
    processedContent = content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // Convert lines that look like headings (ALL CAPS and short)
        if (paragraph.toUpperCase() === paragraph && paragraph.length < 100) {
          return `<h2>${escapeHtml(paragraph)}</h2>`
        }
        // Regular paragraphs
        return `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`
      })
      .join('\n')
  }

  // Sanitize the final content
  return sanitizeHtml(processedContent)
}

/**
 * Escape HTML characters to prevent XSS
 * @param text - Plain text to escape
 * @returns HTML-escaped text
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Sanitize text content (removes all HTML tags)
 * @param content - Content that may contain HTML
 * @returns Plain text with HTML tags removed
 */
export function sanitizeText(content: string): string {
  if (!content) return ''
  
  // Remove HTML tags
  return content.replace(/<[^>]*>/g, '').trim()
}

/**
 * Validate and sanitize URL to prevent injection attacks
 * @param url - URL to validate
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    
    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return ''
    }
    
    return urlObj.toString()
  } catch {
    // Invalid URL
    return ''
  }
}