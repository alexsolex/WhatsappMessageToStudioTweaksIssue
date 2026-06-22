// ==UserScript==
// @name         WhatsApp to GitHub Issue
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Ajoute un bouton sur chaque message WhatsApp pour créer une issue GitHub (Version épurée)
// @author       Alexandre Perret
// @match        https://web.whatsapp.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    // Base de l'URL GitHub
    const GITHUB_BASE_URL = "https://github.com/NelsonBoruchowitch/powerapps-studio-tweaks/issues/new";
    
    // Ton nouveau modèle de corps (body) épuré
    const ISSUE_BODY = "## Bug report from whatsapp\n\n### Description\n[[message]]\n\n### Steps to reproduce\nEtapes";

    // Fonction pour créer l'URL finale proprement encodée
    function createGitHubUrl(messageText) {
        const title = encodeURIComponent(messageText);
        const body = encodeURIComponent(ISSUE_BODY.replace("[[message]]", messageText));
        return `${GITHUB_BASE_URL}?title=${title}&body=${body}`;
    }

    // Fonction pour injecter le bouton dans un message
    function injectButton(messageNode) {
        // Évite les doublons si le bouton est déjà là
        if (messageNode.querySelector('.gh-issue-btn')) return;

        // Ciblage de la zone de texte du message WhatsApp
        const textContainer = messageNode.querySelector('.selectable-text span');
        if (!textContainer) return;

        const messageText = textContainer.innerText.trim();

        // Création du bouton
        const btn = document.createElement('button');
        btn.className = 'gh-issue-btn';
        btn.innerHTML = '🐙'; // Icône du bouton
        btn.title = 'Créer une issue GitHub';
        
        // Style du bouton
        btn.style.marginLeft = '8px';
        btn.style.cursor = 'pointer';
        btn.style.border = 'none';
        btn.style.background = 'transparent';
        btn.style.fontSize = '1.2em';
        btn.style.verticalAlign = 'middle';

        // Action au clic
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche WhatsApp d'intercepter le clic
            const targetUrl = createGitHubUrl(messageText);
            
            // Ouvre le lien dans un nouvel onglet
            GM_openInTab(targetUrl, { active: true, insert: true, setParent: true });
        });

        // Insertion du bouton à la fin du texte du message
        textContainer.parentElement.appendChild(btn);
    }

    // Recherche et traite les messages présents à l'écran
    function processMessages() {
        const messages = document.querySelectorAll('div[data-id]');
        messages.forEach(injectButton);
    }

    // MutationObserver pour intercepter les nouveaux messages (et le défilement)
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                processMessages();
            }
        }
    });

    // Configuration et lancement de l'observateur
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    // Premier scan de sécurité après 3 secondes (laisser le temps à WhatsApp de charger)
    setTimeout(processMessages, 3000);
})();
