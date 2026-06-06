# Nițu Events

Premium photography, videography and wedding decor services in Romania.

## Shared Hosting Deployment

### Files Included (dist/ folder)

- `index.html` - Main SPA entry point
- `.htaccess` - Apache URL rewriting for SPA routing
- `server.php` - PHP fallback entry point (optional)
- `favicon.svg` - SVG favicon
- `favicon_nituevents_com_256x256.png` - PNG favicon (256x256)
- `assets/index.js` - Built JavaScript bundle
- `assets/index.css` - Built CSS bundle

### Deployment Steps

1. **Upload via FTP/SFTP**:
   - Upload all contents of `dist/` folder to your `public_html/` or `htdocs/` directory
   - Or upload to a subdomain folder (e.g., `nituevents/`)

2. **For subdirectories** (if installing to `yourdomain.com/nituevents/`):
   - The build already uses relative paths (`./`)
   - No additional configuration needed

3. **Verify installation**:
   - Visit your domain - the site should load
   - Test navigation between pages (Acasă, Foto, Video, Decor, Oglindă)

### .htaccess Routing

The included `.htaccess` handles:
- SPA client-side routing (all non-file URLs redirect to index.html)
- Static asset caching
- Security blocking for sensitive files

### PHP Alternative

If your host has issues with `.htaccess`, rename:
1. `index.html` → `spa.html`
2. Use `server.php` as the main entry point

## Development

**Prerequisites:** Node.js

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
