/* ============================================================
   INVESTIRFUTÉ — app.js
   Fichier JavaScript commun au site.

   ☝️ NOUVEAUTÉ ÉTAPE 6 : au lieu d'écrire le JS dans chaque
   page HTML avec <script>...</script>, on le met ici et
   chaque page le charge avec :
      <script src="app.js"></script>

   CE QU'ON APPREND ICI :
   1. Variables : let, const
   2. Fonctions : function, () => (arrow function)
   3. Conditions : if / else if / else
   4. Sélectionner des éléments HTML : querySelector, getElementById
   5. Écouter des événements : addEventListener
   6. Modifier le DOM : textContent, innerHTML, classList, style
   7. Boucles : for, forEach
   8. Objets et tableaux
   9. Math : Math.pow, Math.round, Math.max
   10. Manipulation de formulaires
============================================================ */


/* ==============================================================
   UTILITAIRES GÉNÉRAUX
   Ces fonctions sont disponibles sur toutes les pages.
============================================================== */

/**
 * Formate un nombre en euros lisible.
 * Ex : 18025 → "18 025 €"
 *
 * @param {number} n - Le nombre à formater
 * @returns {string}  - La chaîne formatée
 */
const formaterEuros = (n) => {
  // Intl.NumberFormat : outil JS natif pour formater les nombres
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(n);
};

/**
 * Anime un nombre qui "compte" de 0 jusqu'à sa valeur finale.
 * Utilisé pour les chiffres du simulateur.
 *
 * @param {HTMLElement} el     - L'élément à animer
 * @param {number}      fin    - Valeur finale
 * @param {number}      duree  - Durée en ms
 * @param {boolean}     euros  - Formater en euros ?
 */
const animerNombre = (el, fin, duree = 1200, euros = true) => {
  // On part de 0
  let debut = 0;
  // requestAnimationFrame : le navigateur appelle notre fonction
  // avant chaque rafraîchissement d'écran (~60x par seconde)
  const depart = performance.now();

  const step = (maintenant) => {
    // Calcule la progression (entre 0 et 1)
    const progres = Math.min((maintenant - depart) / duree, 1);
    // Fonction d'accélération : commence vite, ralentit à la fin
    const ease = 1 - Math.pow(1 - progres, 3);
    // Valeur courante
    const valeur = Math.round(debut + (fin - debut) * ease);

    // Met à jour l'élément HTML
    el.textContent = euros ? formaterEuros(valeur) : valeur.toLocaleString('fr-FR');

    // Continue l'animation si pas encore terminée
    if (progres < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};


/* ==============================================================
   1. QUIZ — Calcul du profil investisseur
   Fichier : quiz.html
============================================================== */

/**
 * Initialise le quiz si on est sur la bonne page.
 * On vérifie qu'un élément clé existe avant d'agir.
 */
const initQuiz = () => {

  // querySelector : sélectionne le premier élément correspondant au sélecteur CSS
  const form = document.querySelector('#quiz');

  // Si le formulaire n'existe pas sur cette page, on s'arrête
  if (!form) return;

  /* ----
     LOGIQUE DE CALCUL DU PROFIL
     On définit les profils et leur description dans un tableau d'objets.
     Un objet = une collection de paires clé: valeur
  ---- */
  const profils = [
    {
      // Chaque objet a les mêmes clés
      nom:        '😴 Investisseur prudent',
      score_min:  0,
      score_max:  3,
      desc:       'Tu privilégies la sécurité. Ton portefeuille idéal : 70% Livret A / obligations, 30% ETF. Commence petit et apprivoise les marchés progressivement.',
      couleur:    '#4A90D9'
    },
    {
      nom:        '⚖️ Investisseur équilibré',
      score_min:  4,
      score_max:  6,
      desc:       'Tu acceptes un risque modéré pour un rendement correct. Mix idéal : 50% ETF World, 30% obligations, 20% SCPI. La stratégie DCA mensuelle te correspond parfaitement.',
      couleur:    '#C9A84C'
    },
    {
      nom:        '🚀 Investisseur dynamique',
      score_min:  7,
      score_max:  9,
      desc:       'Tu vises la performance sur le long terme. Ton portefeuille : 80% ETF (World + Sectoriels), 20% actions individuelles. Patience et régularité seront tes alliés.',
      couleur:    '#2ECC71'
    },
    {
      nom:        '⚡ Investisseur offensif',
      score_min:  10,
      score_max:  99,
      desc:       'Tu es prêt à tout pour maximiser le rendement. 90% actions/ETF agressifs, 10% crypto. Attention : uniquement avec un horizon > 10 ans et une épargne de précaution solide.',
      couleur:    '#E74C3C'
    }
  ];

  /* ----
     ÉCOUTEUR D'ÉVÉNEMENT SUR LA SOUMISSION DU FORMULAIRE
     addEventListener('submit', ...) : exécute la fonction quand
     le formulaire est soumis (clic sur le bouton ou touche Entrée)
  ---- */
  form.addEventListener('submit', (event) => {

    // preventDefault() : empêche le rechargement de la page
    // (comportement par défaut des formulaires HTML)
    event.preventDefault();

    /* ---- Récupération des valeurs du formulaire ---- */

    // querySelector avec :checked : sélectionne le radio coché
    const objectifEl = form.querySelector('input[name="objectif"]:checked');
    const objectif   = objectifEl ? objectifEl.value : null;

    // getElementById : sélectionne par l'attribut id=""
    const montant  = parseInt(document.getElementById('montant').value);
    const horizon  = document.getElementById('horizon').value;
    const age      = parseInt(document.getElementById('age').value) || 0;

    // querySelectorAll : sélectionne TOUS les éléments correspondants
    // Retourne une NodeList (comme un tableau)
    const risquesCockes = form.querySelectorAll('input[type="checkbox"]:checked');

    /* ---- Validation : vérifie que les champs obligatoires sont remplis ---- */
    if (!objectif) {
      // Petite alerte visuelle sur le fieldset de la question 1
      const q1 = form.querySelector('fieldset:first-of-type legend');
      q1.style.color = '#E74C3C';
      q1.textContent = '⚠️ Choisis un objectif !';
      // setTimeout : exécute une fonction après un délai (en ms)
      setTimeout(() => {
        q1.style.color = '';
        q1.innerHTML = '<span>Q1</span> Quel est ton objectif principal ?';
      }, 2000);
      return; // sort de la fonction
    }

    if (!horizon) {
      alert('Choisis un horizon d\'investissement (Question 3).');
      return;
    }

    /* ---- Calcul du score ---- */
    let score = 0; // let : variable modifiable (≠ const qui est fixe)

    // +2 points selon l'objectif
    if (objectif === 'croissance' || objectif === 'retraite') score += 2;
    if (objectif === 'securite')  score += 0;
    if (objectif === 'revenus')   score += 1;

    // +3 points si long horizon
    if (horizon === 'tres-long') score += 3;
    else if (horizon === 'long') score += 2;
    else if (horizon === 'moyen') score += 1;

    // +1 point par risque accepté (checkbox)
    // forEach : parcourt chaque élément d'une liste
    risquesCockes.forEach(() => { score += 1; });

    // +1 point si âge < 30 (temps devant soi)
    if (age > 0 && age < 30) score += 1;

    // +1 point si on peut investir > 100€/mois
    if (montant >= 100) score += 1;

    /* ---- Trouve le profil correspondant ---- */
    // find() : renvoie le premier élément du tableau qui satisfait la condition
    const profilTrouve = profils.find(
      p => score >= p.score_min && score <= p.score_max
    );

    /* ---- Affiche le résultat ---- */
    const zoneResultat = document.getElementById('resultat');
    const nomEl        = document.getElementById('profil-nom');
    const descEl       = document.getElementById('profil-desc');

    if (profilTrouve && zoneResultat) {
      // textContent : modifie le texte d'un élément
      nomEl.textContent = profilTrouve.nom;
      nomEl.style.color = profilTrouve.couleur;
      descEl.textContent = profilTrouve.desc;

      // style.display : modifie le CSS display directement en JS
      zoneResultat.style.display = 'block';

      // scrollIntoView : fait défiler la page vers l'élément
      zoneResultat.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

  }); // fin addEventListener submit

}; // fin initQuiz


/* ==============================================================
   2. SIMULATEUR — Calcul des intérêts composés
   Fichier : simulateur.html
============================================================== */

const initSimulateur = () => {

  // On vérifie qu'on est bien sur la page simulateur
  const sim = document.getElementById('simulateur-form');
  if (!sim) return;

  /* ----
     Récupère tous les inputs du simulateur
     et stocke leurs références dans des constantes.
     C'est plus efficace que de les rechercher à chaque calcul.
  ---- */
  const inputCapital    = document.getElementById('sim-capital');
  const inputMensuel    = document.getElementById('sim-mensuel');
  const inputTaux       = document.getElementById('sim-taux');
  const inputDuree      = document.getElementById('sim-duree');
  const affCapital      = document.getElementById('aff-capital');
  const affMensuel      = document.getElementById('aff-mensuel');
  const affTaux         = document.getElementById('aff-taux');
  const affDuree        = document.getElementById('aff-duree');
  const resultatCapital = document.getElementById('res-capital');
  const resultatGains   = document.getElementById('res-gains');
  const resultatTotal   = document.getElementById('res-total');
  const barreVerse      = document.getElementById('barre-verse');
  const barreGains      = document.getElementById('barre-gains');

  /* ----
     FORMULE DES INTÉRÊTS COMPOSÉS AVEC VERSEMENTS RÉGULIERS
     C = K × (1+t)^n  +  M × ((1+t)^n - 1) / t

     K = capital initial
     M = versement mensuel
     t = taux mensuel (taux annuel / 12)
     n = nombre de mois
  ---- */
  const calculerRendement = () => {

    // Lire et convertir les valeurs des inputs en nombres
    // parseFloat : convertit une chaîne en nombre décimal
    const capital  = parseFloat(inputCapital.value)  || 0;
    const mensuel  = parseFloat(inputMensuel.value)  || 0;
    const tauxAn   = parseFloat(inputTaux.value)     || 0;
    const dureeAns = parseFloat(inputDuree.value)    || 1;

    // Mise à jour des affichages des sliders
    if (affCapital) affCapital.textContent = formaterEuros(capital);
    if (affMensuel) affMensuel.textContent = mensuel + ' €/mois';
    if (affTaux)    affTaux.textContent    = tauxAn + '%/an';
    if (affDuree)   affDuree.textContent   = dureeAns + ' ans';

    // Conversion en valeurs mensuelles pour la formule
    const tauxMensuel = tauxAn / 100 / 12;  // ex : 7% → 0.07 / 12
    const nbMois      = dureeAns * 12;

    // Variables pour les totaux (déclarées avec let car elles changent)
    let valeurFinale, totalVerse, totalGains;

    if (tauxMensuel === 0) {
      // Cas particulier : sans intérêts
      valeurFinale = capital + mensuel * nbMois;
    } else {
      // Application de la formule des intérêts composés
      // Math.pow(base, exposant) : calcule base^exposant
      const facteur = Math.pow(1 + tauxMensuel, nbMois);
      valeurFinale  = capital * facteur + mensuel * (facteur - 1) / tauxMensuel;
    }

    totalVerse = capital + mensuel * nbMois;
    // Math.round : arrondit à l'entier le plus proche
    totalGains = Math.round(valeurFinale - totalVerse);
    valeurFinale = Math.round(valeurFinale);

    /* ---- Mise à jour des résultats dans le HTML ---- */
    // On anime les chiffres pour un effet visuel
    if (resultatTotal)   animerNombre(resultatTotal,   valeurFinale);
    if (resultatGains)   animerNombre(resultatGains,   Math.max(0, totalGains));
    if (resultatCapital) animerNombre(resultatCapital, totalVerse);

    // Mise à jour des barres de progression
    if (barreVerse && barreGains && valeurFinale > 0) {
      const pctVerse = (totalVerse / valeurFinale * 100).toFixed(1);
      const pctGains = (Math.max(0, totalGains) / valeurFinale * 100).toFixed(1);

      // style.width : modifie la largeur d'un élément via JS
      barreVerse.style.width = pctVerse + '%';
      barreGains.style.width = pctGains + '%';

      // Mise à jour des labels des barres
      const lblVerse = document.getElementById('lbl-verse');
      const lblGains = document.getElementById('lbl-gains');
      if (lblVerse) lblVerse.textContent = 'Capital versé : ' + pctVerse + '%';
      if (lblGains) lblGains.textContent = 'Intérêts :  ' + pctGains + '%';
    }

    // Mise à jour du tableau annuel
    mettreAJourTableau(capital, mensuel, tauxMensuel, dureeAns);
  };

  /* ----
     TABLEAU DE PROGRESSION ANNUELLE
     Affiche l'évolution du portefeuille année par année.
  ---- */
  const mettreAJourTableau = (capital, mensuel, tauxMensuel, dureeAns) => {
    const tbody = document.getElementById('tableau-annees');
    if (!tbody) return;

    // On vide le tableau avant de le remplir
    tbody.innerHTML = '';

    let valeur = capital;

    // Boucle for : répète un bloc de code un nombre défini de fois
    // for (initialisation ; condition ; incrémentation)
    for (let annee = 1; annee <= dureeAns; annee++) {

      // Calcule la valeur à la fin de cette année
      for (let mois = 0; mois < 12; mois++) {
        valeur = valeur * (1 + tauxMensuel) + mensuel;
      }

      const verse   = capital + mensuel * 12 * annee;
      const gains   = Math.round(valeur - verse);
      const total   = Math.round(valeur);
      const rendPct = verse > 0 ? ((gains / verse) * 100).toFixed(1) : 0;

      // Création d'une ligne HTML avec les données
      // innerHTML : définit le HTML interne d'un élément
      // On utilise des template literals (backticks `) pour intégrer des variables
      const tr = document.createElement('tr'); // crée un élément <tr>
      tr.innerHTML = `
        <td style="color:var(--or); font-weight:600">Année ${annee}</td>
        <td style="color:var(--gris)">${formaterEuros(verse)}</td>
        <td style="color:var(--vert)">${formaterEuros(Math.max(0, gains))}</td>
        <td style="color:var(--blanc); font-weight:600">${formaterEuros(total)}</td>
        <td style="color:${gains > 0 ? 'var(--vert)' : 'var(--rouge)'}">
          ${gains > 0 ? '+' : ''}${rendPct}%
        </td>
      `;

      // appendChild : ajoute l'élément <tr> dans le <tbody>
      tbody.appendChild(tr);
    }
  };

  /* ----
     ÉCOUTER LES CHANGEMENTS SUR TOUS LES INPUTS
     'input' : se déclenche à chaque modification de la valeur
  ---- */
  const inputs = [inputCapital, inputMensuel, inputTaux, inputDuree];

  // forEach : parcourt chaque élément du tableau
  inputs.forEach(input => {
    if (input) {
      // À chaque modification d'un input, on recalcule
      input.addEventListener('input', calculerRendement);
    }
  });

  // Calcul initial au chargement de la page
  calculerRendement();

}; // fin initSimulateur


/* ==============================================================
   3. NAVIGATION ACTIVE
   Met en surbrillance le lien du menu correspondant à la page courante.
   Fonctionne sur toutes les pages !
============================================================== */

const initNavActive = () => {

  // location.pathname : chemin de l'URL courante
  // Ex : "/mon-site/les-bases.html"
  const chemin = window.location.pathname;

  // querySelectorAll : retourne TOUS les liens du menu
  const liens = document.querySelectorAll('nav ul li a');

  // forEach sur une NodeList (comme un tableau)
  liens.forEach(lien => {
    // getAttribute : récupère la valeur d'un attribut HTML
    const href = lien.getAttribute('href');

    // Si le lien pointe vers la page courante, on ajoute la classe "actif"
    if (href && chemin.endsWith(href)) {
      // classList.add : ajoute une classe CSS à un élément
      lien.classList.add('actif');
    }
  });

};


/* ==============================================================
   4. ANIMATION AU SCROLL (Intersection Observer)
   Les éléments apparaissent en fondu quand on les fait défiler.
   Plus moderne et performant que d'écouter l'événement 'scroll'.
============================================================== */

const initScrollAnimation = () => {

  // On ajoute la classe "fade-hidden" à tous les éléments à animer
  const elements = document.querySelectorAll('.card, .strategie-card, aside, article.produit');

  // CSS pour l'état caché (ajouté dynamiquement)
  const style = document.createElement('style');
  style.textContent = `
    .fade-hidden {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  elements.forEach(el => el.classList.add('fade-hidden'));

  /*
    IntersectionObserver : observe quand un élément entre dans
    la zone visible de l'écran. Bien plus efficace qu'écouter
    l'événement 'scroll' !
  */
  const observer = new IntersectionObserver(
    (entries) => {
      // entries : liste des éléments observés qui ont changé d'état
      entries.forEach(entry => {
        // isIntersecting : true si l'élément est visible à l'écran
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-visible');
          // On arrête d'observer cet élément (animation unique)
          observer.unobserve(entry.target);
        }
      });
    },
    // Options : l'élément doit être visible à 10% pour déclencher
    { threshold: 0.1 }
  );

  // On commence à observer chaque élément
  elements.forEach(el => observer.observe(el));

};


/* ==============================================================
   DÉMARRAGE
   DOMContentLoaded : se déclenche quand le HTML est entièrement
   chargé et analysé (avant les images).
   C'est ici qu'on initialise toutes nos fonctions.
============================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Initialise chaque module
  // Chaque fonction vérifie elle-même si elle doit s'activer
  initNavActive();       // ← active sur toutes les pages
  initScrollAnimation(); // ← active sur toutes les pages
  initQuiz();            // ← active uniquement sur quiz.html
  initSimulateur();      // ← active uniquement sur simulateur.html

  console.log('✅ InvestirFuté — app.js chargé avec succès !');
  // console.log : affiche un message dans la console du navigateur
  // (Appuie sur F12 pour l'ouvrir)

});
