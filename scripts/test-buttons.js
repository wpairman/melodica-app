/**
 * Button Test Script
 * Quick test to verify buttons are working correctly
 * Run in browser console on any page
 */

(function() {
  console.log('🔍 Starting Button Diagnostic Test...\n');
  
  const results = {
    total: 0,
    withOnClick: 0,
    withoutOnClick: 0,
    disabled: 0,
    withoutType: 0,
    issues: []
  };
  
  // Find all buttons
  const buttons = document.querySelectorAll('button, [role="button"]');
  results.total = buttons.length;
  
  console.log(`Found ${results.total} buttons\n`);
  
  buttons.forEach((btn, index) => {
    const hasOnClick = btn.onclick !== null || btn.getAttribute('onclick') !== null;
    const hasType = btn.hasAttribute('type');
    const isDisabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
    
    if (hasOnClick) {
      results.withOnClick++;
    } else {
      results.withoutOnClick++;
      // Check if it's a form submit button (which is OK)
      if (!btn.closest('form') || btn.type !== 'submit') {
        results.issues.push({
          element: btn,
          issue: 'Button without onClick handler',
          text: btn.textContent?.trim() || btn.getAttribute('aria-label') || 'Unknown'
        });
      }
    }
    
    if (!hasType && btn.tagName === 'BUTTON') {
      results.withoutType++;
      results.issues.push({
        element: btn,
        issue: 'Button without type attribute',
        text: btn.textContent?.trim() || 'Unknown'
      });
    }
    
    if (isDisabled) {
      results.disabled++;
    }
  });
  
  console.log('📊 Results:');
  console.log(`  Total buttons: ${results.total}`);
  console.log(`  With onClick: ${results.withOnClick}`);
  console.log(`  Without onClick: ${results.withoutOnClick}`);
  console.log(`  Disabled: ${results.disabled}`);
  console.log(`  Without type: ${results.withoutType}`);
  console.log(`  Issues found: ${results.issues.length}\n`);
  
  if (results.issues.length > 0) {
    console.log('⚠️  Issues:');
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.issue}: "${issue.text}"`);
    });
  } else {
    console.log('✅ No issues found! All buttons are properly configured.');
  }
  
  console.log('\n✅ Button test complete!');
  
  return results;
})();

