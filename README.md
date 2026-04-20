# Cartograph Showcase

A live demo of [Cartograph](https://github.com/benteigland11/Cartograph). Every interactive piece on the site is a real widget installed with `cartograph install`.

**Live site:** https://benteigland11.github.io/cartograph-showcase/

## Local development

```bash
# Serve statically. No build step.
python3 -m http.server 8000
# open http://localhost:8000
```

## Adding a widget

```bash
cartograph install <widget-id>
# import it in main.js, mount a <widget-showcase> section
```
