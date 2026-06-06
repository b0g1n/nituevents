# Nițu Events

Premium photography, videography and wedding decor services in Romania.

## cPanel Shared Hosting Deployment

### Quick Deploy (3 steps)

1. **Build**: `npm run build` (already done)
2. **Upload**: Copy ALL contents of `dist/` folder to `public_html/` via cPanel File Manager or FTP
3. **Done**: Visit your domain - the SPA works with client-side routing!

### Files in `dist/` folder
- `index.html` - Main SPA entry point
- `.htaccess` - **Critical!** Apache routing for SPA (handles `/foto`, `/video`, etc.)
- `server.php` - Fallback if .htaccess fails (rename to `index.php`)
- `favicon.svg` / `favicon_nituevents_com_256x256.png` - Favicons
- `assets/index.js` - Built JavaScript
- `assets/index.css` - Built CSS

### cPanel File Manager Instructions

1. Login to cPanel
2. **File Manager** → Select `public_html` (or your addon domain folder)
3. **Settings** (top right) → Check "Show Hidden Files" → Save
4. **Upload** → Select all files from `dist/` folder
5. Verify `.htaccess` is present (it's a hidden file)

### If Routing Doesn't Work

Some hosts disable `.htaccess` overrides. Fix:

1. Rename `server.php` to `index.php`
2. Delete `.htaccess`
3. Site will work via PHP routing

### Subdirectory Install (e.g., `yourdomain.com/nituevents/`)

1. Upload to `public_html/nituevents/`
2. Edit `.htaccess` - uncomment: `RewriteBase /nituevents/`
3. Edit `server.php` (if using): set `$subdirectory = '/nituevents';`

### Force HTTPS (recommended)

Add to `.htaccess` after `RewriteEngine On`:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Enable Compression

cPanel → **Optimize Website** → **Compress All Content** → Update

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

- `src/` - React components
- `dist/` - Production build (deploy this)
- `vite.config.ts` - Build configuration (relative paths for shared hosting)
