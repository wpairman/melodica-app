/**
 * Button Diagnostic Script
 * Tests all buttons in the application for common issues
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

interface ButtonIssue {
  file: string
  line: number
  issue: string
  severity: 'error' | 'warning' | 'info'
  code: string
}

const issues: ButtonIssue[] = []

// Patterns to check
const patterns = {
  buttonWithoutOnClick: /<Button[^>]*(?!onClick)[^>]*>/g,
  buttonWithEmptyOnClick: /<Button[^>]*onClick=\{\s*\}/g,
  buttonWithUndefinedOnClick: /<Button[^>]*onClick=\{undefined\}/g,
  buttonWithoutType: /<button[^>]*(?!type=)[^>]*>/g,
  disabledButtonWithoutReason: /disabled=\{[^}]*true[^}]*\}[^>]*(?!aria-label)/g,
  buttonWithoutAriaLabel: /<Button[^>]*(?!aria-label)[^>]*disabled/g,
}

async function scanFile(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Check for buttons without onClick handlers
    if (line.includes('<Button') && !line.includes('onClick') && !line.includes('asChild') && !line.includes('type="submit"')) {
      // Allow Link buttons and form submit buttons
      if (!line.includes('href') && !line.includes('type="submit"')) {
        issues.push({
          file: filePath,
          line: lineNum,
          issue: 'Button without onClick handler (may be intentional for form submission)',
          severity: 'warning',
          code: line.trim()
        })
      }
    }
    
    // Check for buttons with empty onClick
    if (line.includes('onClick={}') || line.includes('onClick={() => {}}')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'Button with empty onClick handler',
        severity: 'error',
        code: line.trim()
      })
    }
    
    // Check for native button without type
    if (line.includes('<button') && !line.includes('type=') && !line.includes('type="button"') && !line.includes('type="submit"')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'Native button element without type attribute (should be type="button" or type="submit")',
        severity: 'warning',
        code: line.trim()
      })
    }
    
    // Check for disabled buttons without aria-label
    if (line.includes('disabled') && line.includes('<Button') && !line.includes('aria-label') && !line.includes('aria-disabled')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'Disabled button without aria-label (accessibility issue)',
        severity: 'warning',
        code: line.trim()
      })
    }
    
    // Check for buttons with undefined onClick
    if (line.includes('onClick={undefined}')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'Button with undefined onClick handler',
        severity: 'error',
        code: line.trim()
      })
    }
  })
}

async function main() {
  console.log('🔍 Starting Button Diagnostic...\n')
  
  // Find all TypeScript/TSX files
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'out/**', '.next/**', '**/*.d.ts']
  })
  
  console.log(`📁 Found ${files.length} files to scan\n`)
  
  // Scan each file
  for (const file of files) {
    if (file.includes('node_modules') || file.includes('dist') || file.includes('.next')) {
      continue
    }
    try {
      await scanFile(file)
    } catch (error) {
      console.error(`Error scanning ${file}:`, error)
    }
  }
  
  // Generate report
  console.log('='.repeat(80))
  console.log('BUTTON DIAGNOSTIC REPORT')
  console.log('='.repeat(80))
  console.log(`\nTotal Issues Found: ${issues.length}\n`)
  
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const info = issues.filter(i => i.severity === 'info')
  
  console.log(`❌ Errors: ${errors.length}`)
  console.log(`⚠️  Warnings: ${warnings.length}`)
  console.log(`ℹ️  Info: ${info.length}\n`)
  
  if (errors.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('❌ ERRORS')
    console.log('='.repeat(80))
    errors.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${path.relative(process.cwd(), issue.file)}:${issue.line}`)
      console.log(`   Issue: ${issue.issue}`)
      console.log(`   Code: ${issue.code}`)
    })
  }
  
  if (warnings.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('⚠️  WARNINGS')
    console.log('='.repeat(80))
    warnings.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${path.relative(process.cwd(), issue.file)}:${issue.line}`)
      console.log(`   Issue: ${issue.issue}`)
      console.log(`   Code: ${issue.code}`)
    })
  }
  
  // Summary by file
  const issuesByFile: Record<string, ButtonIssue[]> = {}
  issues.forEach(issue => {
    const relPath = path.relative(process.cwd(), issue.file)
    if (!issuesByFile[relPath]) {
      issuesByFile[relPath] = []
    }
    issuesByFile[relPath].push(issue)
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('📊 SUMMARY BY FILE')
  console.log('='.repeat(80))
  Object.entries(issuesByFile)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([file, fileIssues]) => {
      const errorCount = fileIssues.filter(i => i.severity === 'error').length
      const warningCount = fileIssues.filter(i => i.severity === 'warning').length
      console.log(`\n${file}: ${fileIssues.length} issues (${errorCount} errors, ${warningCount} warnings)`)
    })
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Diagnostic Complete')
  console.log('='.repeat(80))
  
  // Exit with error code if there are errors
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch(console.error)

