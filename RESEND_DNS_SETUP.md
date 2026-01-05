# Resend Domain DNS Setup Guide

This guide will help you configure DNS records for your domain in Resend to enable email sending and receiving.

## Overview

To send emails from your own domain (e.g., `noreply@melodicaapp.com`), you need to verify your domain with Resend by adding DNS records. The verification page shows three types of records:

1. **DKIM** - DomainKeys Identified Mail (for email authentication)
2. **SPF** - Sender Policy Framework (for sending emails)
3. **MX** - Mail Exchange (for receiving emails) ✅ Already verified

## Step-by-Step DNS Configuration

### Step 1: Access Your Domain Provider

1. Log in to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare, etc.)
2. Navigate to DNS Management / DNS Settings
3. Find the section for adding DNS records

### Step 2: Add DKIM Record

**Purpose:** Verifies that emails are actually sent from your domain

**Record Type:** TXT

**Name/Host:** `resend._domainkey`

**Value/Content:** Copy ONLY the `p=...` part from Resend dashboard (starts with `p=MIGfMA0GCSqGSIb3DQEB...`)

**⚠️ IMPORTANT:** Resend's DKIM record should ONLY contain the `p=...` value. Do NOT include `v=DKIM1; k=rsa;` prefix. Some DNS providers may show this format, but Resend expects just the public key starting with `p=`.

**TTL:** Auto (or 3600)

**Example:**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEB... (ONLY the p= value, no v=DKIM1 prefix)
TTL: Auto
```

**Note:** Some DNS providers require you to enter `resend._domainkey.yourdomain.com` as the name, while others just need `resend._domainkey`. Check your provider's documentation.

**Common Mistake:** If your DNS provider shows `v=DKIM1; k=rsa; p=...`, remove everything before `p=` and only use the `p=...` part.

### Step 3: Add SPF Records (2 records needed)

**Purpose:** Authorizes Resend to send emails on behalf of your domain

#### SPF Record 1: MX Record

**Record Type:** MX

**Name/Host:** `send`

**Value/Content:** Copy the MX value from Resend (e.g., `feedback-smtp.us-east-1.amazonses.com`)

**Priority:** 10

**TTL:** Auto (or 3600)

**Example:**
```
Type: MX
Name: send
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: Auto
```

#### SPF Record 2: TXT Record

**Record Type:** TXT

**Name/Host:** `send`

**Value/Content:** Copy the SPF TXT value from Resend (e.g., `v=spf1 include:amazonses.com ~all`)

**TTL:** Auto (or 3600)

**Example:**
```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: Auto
```

**Note:** Some DNS providers may require `send.yourdomain.com` as the name instead of just `send`.

### Step 4: Verify Records in Resend

1. After adding all DNS records, go back to Resend Dashboard → Domains
2. Click on your domain
3. Click "Verify" or wait for automatic verification
4. DNS propagation can take anywhere from a few minutes to 48 hours

### Step 5: Update Your Environment Variables

Once verification is complete, update your `RESEND_FROM_EMAIL` environment variable:

```env
RESEND_FROM_EMAIL=Melodica <noreply@melodicaapp.com>
```

Replace `melodicaapp.com` with your actual verified domain.

## DNS Provider-Specific Instructions

### Cloudflare

1. Go to your domain → DNS → Records
2. Click "Add record"
3. For DKIM: Type = TXT, Name = `resend._domainkey`, Content = (DKIM value)
4. For SPF MX: Type = MX, Name = `send`, Mail server = (MX value), Priority = 10
5. For SPF TXT: Type = TXT, Name = `send`, Content = (SPF TXT value)

### Namecheap

1. Go to Domain List → Manage → Advanced DNS
2. Click "Add New Record"
3. For DKIM: Type = TXT Record, Host = `resend._domainkey`, Value = (DKIM value)
4. For SPF MX: Type = MX Record, Host = `send`, Value = (MX value), Priority = 10
5. For SPF TXT: Type = TXT Record, Host = `send`, Value = (SPF TXT value)

### GoDaddy

1. Go to My Products → DNS → Manage DNS
2. Click "Add" under Records
3. For DKIM: Type = TXT, Name = `resend._domainkey`, Value = (DKIM value), TTL = 1 hour
4. For SPF MX: Type = MX, Name = `send`, Value = (MX value), Priority = 10, TTL = 1 hour
5. For SPF TXT: Type = TXT, Name = `send`, Value = (SPF TXT value), TTL = 1 hour

### Google Domains / Google Workspace

1. Go to DNS → Custom resource records
2. For DKIM: Add TXT record with Name = `resend._domainkey`, Data = (DKIM value)
3. For SPF MX: Add MX record with Name = `send`, Data = (MX value), Priority = 10
4. For SPF TXT: Add TXT record with Name = `send`, Data = (SPF TXT value)

## Verification Checklist

After adding records, verify:

- [ ] DKIM TXT record added (`resend._domainkey`)
- [ ] SPF MX record added (`send` with priority 10)
- [ ] SPF TXT record added (`send`)
- [ ] All records saved in DNS provider
- [ ] Records verified in Resend dashboard (green checkmarks)
- [ ] `RESEND_FROM_EMAIL` updated to use verified domain

## Troubleshooting

### Records Not Verifying?

1. **Wait for DNS propagation** - Can take up to 48 hours, but usually 15-30 minutes
2. **Check record values** - Copy exact values from Resend (no extra spaces)
3. **Verify record names** - Some providers need full subdomain, others just the prefix
4. **Check TTL** - Lower TTL (300-3600) helps with faster updates
5. **Use DNS checker tools:**
   - https://mxtoolbox.com/TXTLookup.aspx (for TXT records)
   - https://mxtoolbox.com/MXLookup.aspx (for MX records)
   - https://www.whatsmydns.net/ (check DNS propagation)

### DKIM Still Failing?

**Problem:** DKIM record includes `v=DKIM1; k=rsa;` prefix

**Solution:** Resend expects ONLY the `p=...` value. If your DNS provider shows:
```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEB...
```

Remove everything before `p=` and use only:
```
p=MIGfMA0GCSqGSIb3DQEB...
```

### SPF Still Failing?

**Problem:** Only added SPF TXT record, missing SPF MX record

**Solution:** You need BOTH records for the `send` subdomain:
1. ✅ MX record: Type = MX, Name = `send`, Value = (MX server from Resend), Priority = 10
2. ✅ TXT record: Type = TXT, Name = `send`, Value = `v=spf1 include:amazonses.com ~all`

If you only added the TXT record, add the MX record as well.

### Common Mistakes

- ❌ Adding extra spaces or quotes around values
- ❌ Using wrong record type (TXT vs MX)
- ❌ Wrong subdomain name (should be `send` not `send.yourdomain.com` in some cases)
- ❌ Forgetting to save changes in DNS provider
- ❌ Not waiting for DNS propagation

### Still Having Issues?

1. Check Resend dashboard for specific error messages
2. Verify records using DNS lookup tools
3. Contact your DNS provider support
4. Check Resend documentation: https://resend.com/docs/dashboard/domains/introduction

## Testing

Once verified, test sending an email:

1. Update `RESEND_FROM_EMAIL` to use your verified domain
2. Send a test email through your app
3. Check that emails are delivered successfully
4. Verify emails show "via yourdomain.com" in email clients

## Security Notes

- DKIM and SPF records help prevent email spoofing
- These records tell email providers that emails from your domain are legitimate
- Without these records, emails may be marked as spam or rejected

