# SystemicWorks
### an advanced and free tool for thinking in systems

![](https://img.shields.io/github/workflow/status/JuanCSUCoder/SystemicWorks/Node.js%20CI/main?label=Main%20Branch&style=flat-square)	![](https://img.shields.io/github/languages/code-size/JuanCSUCoder/SystemicWorks?style=flat-square)

This repository contains the webapp of SystemicWorks, which will be an **advanced and free tool for thinking in systems**, developed from the source code and concept of [Nicky Case](http://ncase.me), and improved to compete with proprietary software.

## Clone Project

```bash
git clone https://github.com/JuanCSUCoder/SystemicWorks.git
cd SystemicWorks
# Open VSCode or your prefered editor
code .
```

This git repository is configured with a **devcontainer** so you can open it to get all the development environment correctly configured

## Develop
To watch live changes of the project in the browser use:

```bash
npm run serve
```

## Build
To build for production use:

```bash
npm run build
```

Or

```bash
# The same effect as above but a more specific and descriptive name
npm run build:prod
```

For development use:

```bash
npm run build:dev
```

## Deploy
To deploy in GitHub Pages use:

```bash
npm run deploy
```

## Tag, Build and Deploy
To update packages, auto-version, tag and deploy in GitHub Pages use:

**Replace &lt;type&gt; with patch, minor or major**
```bash
npm i && npx release <type> && npm run build:prod && npm run deploy
```
