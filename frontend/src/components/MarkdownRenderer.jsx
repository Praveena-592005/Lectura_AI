import React from 'react';

const MarkdownRenderer = ({ markdownText, textColor = '#1e293b' }) => {
  if (!markdownText) return null;

  const parseInlineStyles = (textString, overrideColor = null) => {
    const parts = textString.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} style={{ fontWeight: '700', color: overrideColor || textColor }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const lines = markdownText.split('\n');

  return lines.map((line, index) => {
    const cleanLine = line.trim();

    if (cleanLine === '---') {
      return <hr key={index} style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '20px 0' }} />;
    }

    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];

      if (level === 1) {
        return (
          <h2 key={index} style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a', marginTop: '24px', marginBottom: '12px', borderLeft: '4px solid #1e3a8a', paddingLeft: '10px' }}>
            {parseInlineStyles(headerText, '#1e3a8a')}
          </h2>
        );
      } else if (level === 2) {
        return (
          <h3 key={index} style={{ fontSize: '20px', fontWeight: '700', color: '#4f46e5', marginTop: '22px', marginBottom: '10px', borderLeft: '4px solid #4f46e5', paddingLeft: '10px' }}>
            {parseInlineStyles(headerText, '#4f46e5')}
          </h3>
        );
      } else if (level === 3) {
        return (
          <h4 key={index} style={{ fontSize: '17px', fontWeight: '700', color: '#0ea5e9', marginTop: '18px', marginBottom: '8px', borderLeft: '3px solid #0ea5e9', paddingLeft: '8px' }}>
            {parseInlineStyles(headerText, '#0ea5e9')}
          </h4>
        );
      } else {
        return (
          <h5 key={index} style={{ fontSize: '15px', fontWeight: '700', color: '#475569', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {parseInlineStyles(headerText, '#475569')}
          </h5>
        );
      }
    }

    if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.startsWith('+ ')) {
      return (
        <li key={index} style={{ marginLeft: '20px', marginBottom: '6px', listStyleType: 'disc', color: textColor }}>
          {/* Using #2563eb as a consistent accent color for bold labels within bullets */}
          {parseInlineStyles(cleanLine.slice(2), '#4f46e5')}
        </li>
      );
    }

    if (cleanLine === '') {
      return <div key={index} style={{ height: '6px' }} />;
    }

    return (
      <p key={index} style={{ margin: '0 0 10px 0', color: textColor, textAlign: 'justify' }}>
        {parseInlineStyles(line)}
      </p>
    );
  });
};

export default MarkdownRenderer;