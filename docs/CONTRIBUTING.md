# Contributing to OpenFinance-OS

Welcome! We're glad you're interested in contributing to the OpenFinance-OS community website. This project is built by the community, for the community, and every contribution matters.

## Ways to Contribute

### Report Issues
Found a bug or have a suggestion? [Open an issue](https://github.com/openfinance-os/community-website/issues) with:
- A clear, descriptive title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if relevant

### Improve Content
Help us keep the site accurate and useful:
- Fix typos or outdated information
- Suggest new Learn articles
- Submit news items or event listings
- Improve existing documentation

### Contribute Code
Enhance the website itself:
- Fix bugs or accessibility issues
- Implement new features
- Improve performance
- Enhance the design

## Content Contributions

### News Items
Community news and updates. To submit:
1. Open an issue with the `content: news` label
2. Include: headline, summary, source URL, and publication date
3. A maintainer will review and add it to the site

### Events
Conferences, meetups, and community gatherings:
1. Open an issue with the `content: event` label
2. Include: event name, date, location, description, and registration link
3. Events should be relevant to UAE Open Finance or the broader Open Banking community

### Learn Articles
Educational content about Open Finance:
1. Open an issue with the `content: learn` label to propose a topic
2. Wait for approval before writing
3. Submit as a pull request with your article in Markdown format
4. See [EDITORIAL.md](./EDITORIAL.md) for content guidelines

## Code Contributions

### Local Setup

```bash
# Clone the repository
git clone https://github.com/openfinance-os/community-website.git
cd community-website

# Install dependencies
npm install

# Start development server
npm run dev
```

The site runs at `http://localhost:4321`.

### Project Structure

```
src/
├── components/     # Reusable Astro components
├── layouts/        # Page layouts
├── pages/          # Route pages
├── styles/         # Global CSS
└── data/           # Static data files
```

### Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the style guidelines below

3. **Test locally** to ensure everything works:
   ```bash
   npm run build
   ```

4. **Commit with a clear message**:
   ```bash
   git commit -m "Add: brief description of change"
   ```

5. **Push and open a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

- Keep PRs focused on a single change
- Provide a clear description of what and why
- Link to any related issues
- Be responsive to review feedback

## Style Guidelines

### Code Style

- Use 2-space indentation
- Follow existing patterns in the codebase
- Keep components small and focused
- Use semantic HTML elements
- Ensure accessibility (proper labels, alt text, keyboard navigation)

### CSS Conventions

- Use CSS custom properties from `global.css`
- Follow the existing naming patterns
- Mobile-first responsive design
- Avoid `!important` unless absolutely necessary

### Commit Messages

Use clear, descriptive commit messages:
- `Add: new feature or content`
- `Fix: bug fix`
- `Update: changes to existing features`
- `Remove: deleted code or content`
- `Docs: documentation changes`

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/openfinance-os/community-website/discussions)
- **Found a bug?** Open an [Issue](https://github.com/openfinance-os/community-website/issues)
- **Want to chat?** Join the conversation on GitHub Discussions

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](../CODE_OF_CONDUCT.md). Be kind, be respectful, be welcoming.

---

Thank you for contributing to OpenFinance-OS! Together, we're making UAE Open Finance more visible and accessible for everyone.
