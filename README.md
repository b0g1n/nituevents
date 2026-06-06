# Nițu Events

Premium photography, videography and wedding decor services in Romania.

## Shared Hosting Deployment Instructions

### Option A: Static Files (Apache/Nginx)

1. **Build the project** (already done):
   - All files in `dist/` are ready to deploy
   - `index.html` is the entry point
   - `.htaccess` handles SPA routing for Apache

2. **Upload to shared hosting**:
   - Upload all contents of `dist/` folder to your `public_html/` or `htdocs/` directory
   - Or create a subdomain and point it to `dist/` folder
   - File structure:
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   ├── favicon.svg
   ├── favicon_nituevents_com_256x256.png
   ├── assets/
   │   ├── index.js
   │   └── index.css
   └── server.php (optional, for PHP compatibility)
   ```

3. **Verify**:
   - Visit your domain - the SPA should load
   - All routes should work (navigation, gallery, etc.)

### Option B: PHP Wrapper (for hosts that prefer PHP entry)

- Use `server.php` as entry point
- Rename `index.html` to `spa.html` and adjust server.php if needed

## Development

**Prerequisites:** Node.js

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Run development server:
   \`\`\`
   npm run dev
   \`\`\`

## Build Commands

- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - TypeScript type checking
