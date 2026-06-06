# cPanel Deployment Checklist

## Pre-Deployment
- [ ] Run `npm run build` locally
- [ ] Verify `dist/` folder contains: index.html, .htaccess, server.php, favicon.*, assets/

## cPanel File Manager / FTP Upload
- [ ] Open cPanel → File Manager
- [ ] Navigate to `public_html` (or your addon domain/subdomain folder)
- [ ] Upload ALL contents of `dist/` folder
- [ ] Ensure `.htaccess` is uploaded (hidden file - show hidden files in File Manager)

## Verify .htaccess Works
- [ ] Visit your domain - site loads
- [ ] Navigate to different pages (Foto, Video, Decor, Oglindă)
- [ ] Refresh page on sub-route (e.g., yourdomain.com/foto) - should work
- [ ] Check favicon appears in browser tab

## If .htaccess Doesn't Work (some hosts)
- [ ] Rename `server.php` to `index.php`
- [ ] Delete/rename `.htaccess`
- [ ] Test again

## Subdirectory Installation (e.g., yourdomain.com/nituevents/)
- [ ] Upload to `public_html/nituevents/`
- [ ] Edit `.htaccess`: uncomment `RewriteBase /nituevents/`
- [ ] Edit `server.php`: set `$subdirectory = '/nituevents';`

## SSL/HTTPS
- [ ] Enable SSL in cPanel → SSL/TLS
- [ ] Force HTTPS in `.htaccess` (add after RewriteEngine On):
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

## Performance (cPanel Optimize Website)
- [ ] cPanel → Optimize Website → Compress All Content

## Verify
- [ ] Mobile responsive
- [ ] All images load
- [ ] Contact form works (if applicable)
- [ ] Gallery navigation works
