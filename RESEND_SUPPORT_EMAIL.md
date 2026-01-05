# Email to Resend Support

**Subject:** DKIM Verification Stuck on Pending - Domain: fegroupglb.com

---

Hello Resend Support,

I'm experiencing an issue with DKIM verification for my domain `fegroupglb.com`. The verification status has been stuck on "Pending" for several hours, even though the DNS records are correctly configured and propagated.

**Domain:** fegroupglb.com

**Current Status:**
- ✅ SPF MX record: Verified
- ✅ SPF TXT record: Verified  
- ✅ MX (Receiving) record: Verified
- ⏳ DKIM record: Pending (stuck)

**DKIM Record Details:**
- **Record Type:** TXT
- **Name:** `resend._domainkey`
- **Value:** Starts with `p=MIGfMA0GCSqGSIb3DQEB...` (correct format, no `v=DKIM1` prefix)
- **DNS Propagation:** Verified via mxtoolbox.com - record is live and accessible

**What I've Verified:**
1. DNS record exists and is propagated (checked via https://mxtoolbox.com/TXTLookup.aspx)
2. Record format is correct (starts with `p=`, no extra prefixes)
3. Only one `resend._domainkey` TXT record exists (no duplicates)
4. SPF records verified successfully, indicating DNS is working correctly

**Issue:**
Even though the DKIM DNS record is correctly configured and propagated, Resend's verification system continues to show "Pending" status. This is preventing me from sending emails using my verified domain.

Could you please:
1. Manually verify the DKIM record on your end?
2. Check if there are any issues preventing verification?
3. Let me know if there's anything else I need to configure?

Thank you for your assistance!

Best regards,
[Your Name]

---

**Alternative Shorter Version:**

Subject: DKIM Verification Stuck - fegroupglb.com

Hi Resend Support,

DKIM verification for `fegroupglb.com` is stuck on "Pending" despite correct DNS configuration.

- Domain: fegroupglb.com
- DKIM Record: `resend._domainkey` TXT record exists and is propagated (verified via mxtoolbox.com)
- Format: Correct (`p=...` value only)
- SPF records: Already verified ✅

Could you manually verify the DKIM record? DNS is correct and propagated.

Thanks!



