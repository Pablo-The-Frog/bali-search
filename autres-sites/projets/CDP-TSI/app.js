/**
 * Hub de Données TSI - Core Navigation
 * Architecture sans framework / Mutation DOM minimale
 */

const CONFIG = Object.freeze({
    TREE_URL: "tree.json",
    ROOT_NAME: "CDP TSI1",
    HIDDEN_ENTRIES: new Set([
        "index.html",
        "style.css",
        "app.js",
        "tree.json",
        "generate_tree.py",
        "start.sh",
        "index_static.html"
    ]),
    ICONS: {
        dir: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        pdf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
        file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`
    }
});

class StorageExplorer {
    constructor() {
        this.treeData = null;
        this.nodeMap = new Map();

        this.dom = {
            title: document.getElementById("title"),
            content: document.getElementById("content"),
            backBtn: document.getElementById("back")
        };

        this.init();
    }

    async init() {
        try {
            const response = await fetch(CONFIG.TREE_URL);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            this.treeData = await response.json();
            this.indexNodes(this.treeData);

            this.bindEvents();

            // Gestion de la navigation native
            const initialPath = new URLSearchParams(window.location.search).get("path") || ".";
            this.navigateTo(initialPath, false);

        } catch (err) {
            this.renderError(`Échec critique du chargement des données. ${err.message}`);
        }
    }

    // Indexation O(1) via Map pour éviter la récursion réseau/arbre à chaque clic
    indexNodes(node) {
        if (!node) return;
        this.nodeMap.set(node.path, node);
        if (node.name) this.nodeMap.set(node.name, node);

        if (Array.isArray(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                this.indexNodes(node.children[i]);
            }
        }
    }

    bindEvents() {
        // Délégation d'événements unique sur le container principal
        this.dom.content.addEventListener("click", (e) => {
            const item = e.target.closest(".item");
            if (!item) return;

            const path = item.dataset.path;
            const type = item.dataset.type;

            if (type === "dir") {
                this.navigateTo(path, true);
            } else if (type === "file") {
                window.open(path, "_blank", "noopener,noreferrer");
            }
        });

        // Gestion propre de l'historique du navigateur (Popstate)
        window.addEventListener("popstate", (e) => {
            const path = e.state?.path || ".";
            this.navigateTo(path, false);
        });

        this.dom.backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }

    navigateTo(path, pushState = true) {
        const node = this.nodeMap.get(path);

        if (!node) {
            this.renderError(`Alerte : Chemin [${path}] introuvable dans le continuum.`);
            return;
        }

        if (pushState) {
            const url = new URL(window.location);
            url.searchParams.set("path", path);
            window.history.pushState({ path }, "", url);
        }

        this.render(node);
    }

    render(node) {
        // Mise à jour de l'en-tête
        this.dom.title.textContent = (node.name === "CDP-TSI1" || node.path === ".")
        ? CONFIG.ROOT_NAME
        : node.name;

        // Toggle du bouton retour en fonction de l'historique réel
        this.dom.backBtn.style.display = (window.history.length > 1 && location.search) ? "block" : "none";

        const children = node.children?.filter(c => !CONFIG.HIDDEN_ENTRIES.has(c.name)) || [];

        if (children.length === 0) {
            this.dom.content.innerHTML = `<div class="empty">Zone vide. Aucun vecteur de données détecté.</div>`;
            return;
        }

        const folders = [];
        const files = [];

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.type === "directory") folders.push(child);
            else if (child.type === "file") files.push(child);
        }

        // Allocation d'un Fragment pour isoler la manipulation DOM du thread de rendu
        const fragment = document.createDocumentFragment();

        if (folders.length > 0) {
            fragment.appendChild(this.createSectionTitle("Dossiers"));
            folders.forEach(f => fragment.appendChild(this.createItemNode(f, true)));
        }

        if (files.length > 0) {
            fragment.appendChild(this.createSectionTitle("Fichiers"));
            files.forEach(f => fragment.appendChild(this.createItemNode(f, false)));
        }

        this.dom.content.replaceChildren(fragment);
    }

    createSectionTitle(label) {
        const div = document.createElement("div");
        div.className = "section";
        div.textContent = label;
        return div;
    }

    createItemNode(item, isDir) {
        const div = document.createElement("div");
        div.className = "item";
        div.dataset.path = item.path;
        div.dataset.type = isDir ? "dir" : "file";

        let iconSVG = CONFIG.ICONS.dir;
        let metaText = `${item.children ? item.children.length : 0}`;

        if (!isDir) {
            const ext = item.name.includes(".") ? item.name.split(".").pop().toLowerCase() : "";
            iconSVG = ext === "pdf" ? CONFIG.ICONS.pdf : CONFIG.ICONS.file;
            metaText = ext ? ext.toUpperCase() : "RAW";
        }

        div.innerHTML = `
        <div class="icon">${iconSVG}</div>
        <div class="name">${this.escapeHTML(item.name)}</div>
        <div class="meta">${metaText}</div>
        `;

        return div;
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
                           tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    renderError(msg) {
        this.dom.content.innerHTML = `<div class="empty" style="border-color: #ff5252; color: #ff5252;">${msg}</div>`;
    }
}

// Instanciation au DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    window.explorer = new StorageExplorer();
});
