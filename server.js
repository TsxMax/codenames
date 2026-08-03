const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ─── Mots français (894 mots pour minimiser les répétitions entre parties) ───
const WORDS = [
  // --- Originaux (160) ---
  'AGENT', 'AIGLE', 'AMOUR', 'ARBRE', 'ARGENT', 'ARMÉE', 'AVION', 'BALLON',
  'BANQUE', 'BATEAU', 'BOMBE', 'BOUGIE', 'CAFÉ', 'CARTE', 'CHAÎNE', 'CHAPEAU',
  'CHAT', 'CHÂTEAU', 'CHEMIN', 'CHEVAL', 'CIEL', 'CINÉMA', 'CLÉ', 'COEUR',
  'COUTEAU', 'CRÈME', 'DANGER', 'DANSE', 'DIAMANT', 'DRAPEAU', 'EAU', 'ÉCOLE',
  'ÉTOILE', 'FER', 'FEU', 'FLEUR', 'FORÊT', 'FUSÉE', 'GLACE', 'GUERRE',
  'HÔPITAL', 'ÎLE', 'JARDIN', 'LION', 'LOUP', 'LUMIÈRE', 'LUNE', 'MACHINE',
  'MAISON', 'MER', 'MIROIR', 'MONTAGNE', 'MOTO', 'MUSIQUE', 'NEIGE', 'NOIR',
  'NUAGE', 'OISEAU', 'OMBRE', 'OR', 'ORANGE', 'PALAIS', 'PAPIER', 'PIÈGE',
  'PIERRE', 'PIRATE', 'PLAGE', 'PLANÈTE', 'PLANTE', 'POISON', 'POMME', 'PONT',
  'PORTE', 'PRINCE', 'PRISON', 'RADAR', 'REINE', 'ROBOT', 'ROCHER', 'ROSE',
  'ROUTE', 'SABLE', 'SECRET', 'SERPENT', 'SOLDAT', 'SOLEIL', 'SOURIS', 'TEMPS',
  'TERRE', 'TIGRE', 'TOUR', 'TRAIN', 'TRÉSOR', 'VAMPIRE', 'VENT', 'VERRE',
  'VIRUS', 'VOITURE', 'VOLCAN', 'VOYAGE', 'DRAGON', 'ESPION', 'FANTÔME', 'GÉANT',
  'HERBE', 'JOURNAL', 'LASER', 'MARCHÉ', 'NUIT', 'OPÉRA', 'PARC', 'RADIO',
  'RIVIÈRE', 'SCIENCE', 'STATUE', 'TEMPLE', 'TOILE', 'UNIVERS', 'VILLE', 'ZÉRO',
  'ANCRE', 'BAGUE', 'CANON', 'DÉSERT', 'ÉPÉE', 'FAUCON', 'GUITARE', 'HÉLICE',
  'ICÔNE', 'JUNGLE', 'KAYAK', 'LAMPE', 'MÉDAILLE', 'NAVIRE', 'OLYMPE', 'PANDA',
  'RÊVE', 'SIRÈNE', 'TRÔNE', 'UNIFORME', 'VALISE', 'WESTERN', 'YACHT', 'ZOMBIE',
  'ATLAS', 'BRONZE', 'CRISTAL', 'DUEL', 'ÉCHO', 'FLAMME', 'GRIFFE', 'HORIZON',
  'IVOIRE', 'JADE', 'MASQUE', 'NECTAR', 'OASIS', 'PHARE', 'QUARTZ', 'SABRE',
  // --- Nouveaux mots (240+) ---
  'ABEILLE', 'ABRICOT', 'ACIER', 'AIGUILLE', 'AIMANT', 'ALGUE', 'ALLIANCE',
  'ALTITUDE', 'AMAZONE', 'AMBULANCE', 'ANGE', 'ANNEAU', 'ANTENNE', 'ARAIGNÉE',
  'ARC', 'ARCHIPEL', 'ARDOISE', 'ARÈNE', 'ARMURE', 'ASTUCE', 'AURORE',
  'AVALANCHE', 'AVENTURE', 'BAMBOU', 'BANDEAU', 'BARRAGE', 'BERGER', 'BIJOU',
  'BLASON', 'BOUCLIER', 'BOUSSOLE', 'BRAISE', 'BRANCHE', 'BRIOCHE', 'BROUILLARD',
  'BUFFLE', 'CABANE', 'CACTUS', 'CAMÉRA', 'CAMPAGNE', 'CAPITAINE', 'CARAVANE',
  'CARNAVAL', 'CASCADE', 'CASQUE', 'CAVERNE', 'CERISE', 'CHAMPION', 'CHANDELLE',
  'CHARBON', 'CHASSE', 'CHÊNE', 'CHOCOLAT', 'CIGALE', 'CIRQUE', 'CITRON',
  'CLOCHE', 'COBRA', 'COLIS', 'COLLINE', 'COLOMBE', 'COMÈTE', 'COMPAS',
  'CORAIL', 'CORBEAU', 'CORDE', 'CORNE', 'COSMOS', 'COURONNE', 'CRABE',
  'CRATÈRE', 'CROCODILE', 'CROISADE', 'CUIVRE', 'CYCLONE', 'DAUPHIN', 'DELTA',
  'DENTELLE', 'DEVIN', 'DONJON', 'DOUANE', 'DUNE', 'DYNAMO', 'ÉCLAIR',
  'ÉCLIPSE', 'ÉMERAUDE', 'EMPIRE', 'ENCRE', 'ÉNIGME', 'ÉPAULE', 'ÉPERVIER',
  'ÉPINE', 'ÉQUATEUR', 'ESCARGOT', 'ESSENCE', 'ÉTANG', 'ÉVENTAIL', 'EXIL',
  'FABLE', 'FALAISE', 'FANTAISIE', 'FAUVE', 'FICELLE', 'FILET', 'FJORD',
  'FLÈCHE', 'FLOCON', 'FONTAINE', 'FOSSILE', 'FOUDRE', 'FOURMIS', 'FRACTURE',
  'FRAISE', 'FRÉGATE', 'FRONTIÈRE', 'GALET', 'GALAXIE', 'GARDE', 'GAZELLE',
  'GELÉE', 'GÉNIE', 'GIVRE', 'GLOBE', 'GONDOLE', 'GORILLE', 'GOUFFRE',
  'GRANITE', 'GRENADE', 'GROTTE', 'GRUE', 'GUÉPARD', 'HAMAC', 'HARPE',
  'HIBOU', 'HYDRE', 'ICEBERG', 'IDOLE', 'IMPASSE', 'INDICE', 'INSECTE',
  'INVASION', 'JAGUAR', 'JOYAU', 'JUPITER', 'KANGOUROU', 'KOALA', 'LABYRINTHE',
  'LAME', 'LANTERNE', 'LARME', 'LASSO', 'LAVE', 'LÉGENDE', 'LÉZARD',
  'LIBELLULE', 'LIERRE', 'LINGOT', 'LOTUS', 'LOUPE', 'LYNX', 'LYRE',
  'MAGICIEN', 'MAMMOUTH', 'MANOIR', 'MARAIS', 'MARBRE', 'MARGUERITE', 'MARIONNETTE',
  'MARMOTTE', 'MARTEAU', 'MERCURE', 'MÉTÉORE', 'MEUTE', 'MIRAGE', 'MISSILE',
  'MOLÉCULE', 'MOMIE', 'MOUETTE', 'MOULIN', 'MOUSSE', 'MOUSTIQUE', 'MYSTÈRE',
  'NAUFRAGE', 'NEPTUNE', 'NOEUD', 'NOMADE', 'OBJECTIF', 'OCÉAN', 'OLIVE',
  'ONGLE', 'ORAGE', 'ORBITE', 'ORCHIDÉE', 'ORGUE', 'OTAGE', 'OURS',
  'OURSIN', 'OXYGÈNE', 'PAGODE', 'PALMIER', 'PANACHE', 'PANTHÈRE', 'PARACHUTE',
  'PARADIS', 'PARCHEMIN', 'PARFUM', 'PASSAGE', 'PATIN', 'PAVILLON', 'PÊCHE',
  'PÉLICAN', 'PENDULE', 'PÉNINSULE', 'PERLE', 'PHÉNIX', 'PIANO', 'PILOTE',
  'PINGOUIN', 'PION', 'PLATEAU', 'PLUME', 'POIGNARD', 'POLLEN', 'PORTAIL',
  'PRISME', 'PROIE', 'PROPHÈTE', 'PYRAMIDE', 'PYTHON', 'RADEAU', 'RAFALE',
  'RAISIN', 'RAPACE', 'RAYON', 'RÉCIF', 'REFUGE', 'RELIQUE', 'RENARD',
  'REQUIN', 'RÉSEAU', 'ROUAGE', 'RUBIS', 'RUCHE', 'RUINE', 'SAPHIR',
  'SATELLITE', 'SAVANE', 'SCEPTRE', 'SCORPION', 'SÉISME', 'SELLE', 'SENTIER',
  'SILEX', 'SINGE', 'SIROC', 'SORCIER', 'SOURCE', 'SPHINX', 'SPIRALE',
  'SQUELETTE', 'STALACTITE', 'SULTAN', 'TALISMAN', 'TAMBOUR', 'TAUPE', 'TEMPÊTE',
  'TENTACULE', 'TITAN', 'TONNERRE', 'TORCHE', 'TORNADO', 'TORTUE', 'TOTEM',
  'TRANCHÉE', 'TRITON', 'TROPHÉE', 'TUNNEL', 'TURQUOISE', 'VAGUE', 'VAPEUR',
  'VAUTOUR', 'VENIN', 'VERTIGE', 'VIPÈRE', 'VITRAIL', 'VOLTIGE', 'ZÈBRE',
  // --- Extension (447 mots) ---
  'ACCORDÉON', 'ACIDE', 'ACTEUR', 'ADIEU', 'AÉROPORT', 'AIL', 'ALBATROS', 'ALPHABET',
  'AMANDE', 'AMBASSADE', 'AMITIÉ', 'AMPOULE', 'AMULETTE', 'ANANAS', 'ÂNE', 'ANGUILLE',
  'ANNÉE', 'ANNIVERSAIRE', 'ANTIDOTE', 'ARBALÈTE', 'ARBITRE', 'ARCHET', 'ARCHITECTE', 'ARGILE',
  'ARTICHAUT', 'ARTISTE', 'ASILE', 'ASSIETTE', 'ATELIER', 'AUBE', 'AUTOMNE', 'AUTRUCHE',
  'BALAI', 'BALCON', 'BALEINE', 'BALLE', 'BALLET', 'BANLIEUE', 'BARQUE', 'BASTION',
  'BATAILLE', 'BATTERIE', 'BÉLIER', 'BÉTON', 'BEURRE', 'BIBLIOTHÈQUE', 'BISCUIT', 'BISON',
  'BLANC', 'BOÎTE', 'BOL', 'BONBON', 'BONHEUR', 'BOTTE', 'BOUCHE', 'BOUCHER',
  'BOUCHON', 'BOULANGER', 'BOURGEON', 'BOUTEILLE', 'BRAS', 'BRISE', 'BROSSE', 'BRUME',
  'BÛCHERON', 'CÂBLE', 'CADEAU', 'CADENAS', 'CAHIER', 'CALCUL', 'CAMION', 'CAMOUFLAGE',
  'CANARD', 'CANNELLE', 'CANYON', 'CAPTEUR', 'CARABINE', 'CARAMEL', 'CARNET', 'CAROTTE',
  'CARTON', 'CASTOR', 'CAVE', 'CEINTURE', 'CHAGRIN', 'CHAISE', 'CHAMPIGNON', 'CHANTIER',
  'CHAUSSETTE', 'CHAUSSURE', 'CHEMINÉE', 'CHEVEU', 'CHEVILLE', 'CHÈVRE', 'CHIMÈRE', 'CHIRURGIEN',
  'CHORALE', 'CHOU', 'CHOUETTE', 'CIME', 'CIRCUIT', 'CITADELLE', 'CLAIRIÈRE', 'CLARINETTE',
  'CLAVIER', 'CLOCHER', 'CLOU', 'CLOWN', 'COCHON', 'CODE', 'COIFFEUR', 'COLÈRE',
  'COMPLOT', 'CONCERT', 'CONFITURE', 'COQ', 'COSTUME', 'COTON', 'COUDE', 'COULOIR',
  'COURAGE', 'COURANT', 'COURGETTE', 'COURSE', 'COUSSIN', 'CRAVATE', 'CRAYON', 'CRÊPE',
  'CUILLÈRE', 'CUIR', 'CYCLOPE', 'CYGNE', 'DÉFI', 'DEMAIN', 'DÉMON', 'DENT',
  'DESTIN', 'DÉTECTIVE', 'DINDON', 'DOCTEUR', 'DOIGT', 'DOS', 'DRAP', 'ÉCHARPE',
  'ÉCHECS', 'ÉCLAT', 'ÉCORCE', 'ÉCRAN', 'ÉCRIVAIN', 'ÉCUREUIL', 'ÉGLISE', 'EMBUSCADE',
  'ÉMOTION', 'EMPEREUR', 'ÉNERGIE', 'ÉPICE', 'ÉPINGLE', 'ÉQUATION', 'ÉQUIPE', 'ESCALIER',
  'ESPOIR', 'ÉTAGE', 'ÉTAGÈRE', 'ÉTÉ', 'ÉTINCELLE', 'EXPÉRIENCE', 'EXPLOIT', 'FACTEUR',
  'FAISAN', 'FANFARE', 'FÉE', 'FENÊTRE', 'FERMIER', 'FEUILLE', 'FEUTRE', 'FIGUE',
  'FLAMANT', 'FLEUVE', 'FLÛTE', 'FORTERESSE', 'FORTUNE', 'FOURCHETTE', 'FRÉQUENCE', 'FRISSON',
  'FROMAGE', 'FUREUR', 'FUSIL', 'GARAGE', 'GARDIEN', 'GARE', 'GARGOUILLE', 'GÂTEAU',
  'GÉNÉRAL', 'GENOU', 'GLACIER', 'GOMME', 'GRAINE', 'GRAVITÉ', 'GRENIER', 'GRENOUILLE',
  'GRIMOIRE', 'GUIDE', 'HARICOT', 'HEURE', 'HIPPOPOTAME', 'HIRONDELLE', 'HOMARD', 'HONNEUR',
  'HORLOGE', 'HÔTEL', 'HYMNE', 'IDÉE', 'ILLUSION', 'INSTANT', 'JARDINIER', 'JAVELOT',
  'JETÉE', 'JOCKEY', 'JOKER', 'JOUR', 'JUDO', 'JUGE', 'JUPE', 'LAC',
  'LAINE', 'LANGUE', 'LAPIN', 'LEVIER', 'LÈVRE', 'LIBERTÉ', 'LIBRAIRE', 'LICORNE',
  'LIÈGE', 'LIÈVRE', 'LIVRE', 'LOUTRE', 'LUTIN', 'MAIN', 'MALICE', 'MANGUE',
  'MANTEAU', 'MARÉE', 'MARIN', 'MATCH', 'MATELAS', 'MATIN', 'MÉCANICIEN', 'MÉMOIRE',
  'MENSONGE', 'MENUISIER', 'MÉTAL', 'MÉTRO', 'MICRO', 'MICROSCOPE', 'MIEL', 'MINOTAURE',
  'MINUIT', 'MISSION', 'MOINE', 'MOIS', 'MONTRE', 'MOTEUR', 'MOUCHE', 'MOUTARDE',
  'MUSCLE', 'MUSÉE', 'MYTHE', 'NÉNUPHAR', 'NEZ', 'NOISETTE', 'NOIX', 'NOTAIRE',
  'NOTE', 'OGRE', 'OIGNON', 'ORACLE', 'ORCHESTRE', 'ORDINATEUR', 'OREILLE', 'OREILLER',
  'ORQUE', 'OTARIE', 'OUBLI', 'PAIN', 'PAIX', 'PANTALON', 'PAON', 'PARAPLUIE',
  'PARDON', 'PASSÉ', 'PASTÈQUE', 'PATIENCE', 'PEAU', 'PÊCHEUR', 'PEIGNE', 'PÉNICHE',
  'PERROQUET', 'PÉTALE', 'PHARAON', 'PHOQUE', 'PIC', 'PIE', 'PIED', 'PIGEON',
  'PILE', 'PINCEAU', 'PIONNIER', 'PISCINE', 'PISTE', 'PISTON', 'PLACARD', 'PLAFOND',
  'PLÂTRE', 'PLOMB', 'PLONGEUR', 'POCHE', 'PODIUM', 'POÊLE', 'POÉSIE', 'POIGNET',
  'POIRE', 'POIVRE', 'POLICIER', 'POMPIER', 'PORT', 'POTION', 'POTIRON', 'POULE',
  'POULPE', 'POUMON', 'POURPRE', 'POUSSIÈRE', 'PRAIRIE', 'PROFESSEUR', 'PROMESSE', 'RACINE',
  'RADIS', 'RANÇON', 'RAQUETTE', 'RAT', 'RÉCIT', 'REFRAIN', 'RÈGLE', 'RELAIS',
  'REMPART', 'RENNE', 'RESTAURANT', 'RHINOCÉROS', 'RIDEAU', 'RIZ', 'ROBE', 'ROBINET',
  'ROSÉE', 'ROUE', 'RUMEUR', 'RUSE', 'RYTHME', 'SAISON', 'SALADE', 'SALON',
  'SAMOURAÏ', 'SANDALE', 'SANG', 'SANGLIER', 'SARDINE', 'SAULE', 'SAUMON', 'SAUT',
  'SAVON', 'SCÈNE', 'SCULPTEUR', 'SEAU', 'SECONDE', 'SEL', 'SEMAINE', 'SERRURE',
  'SERVEUR', 'SIÈCLE', 'SIÈGE', 'SIGNAL', 'SILENCE', 'SIROP', 'SKI', 'SOIE',
  'SONDE', 'SORTILÈGE', 'SOUFFLE', 'SOUPÇON', 'SOUPE', 'SOURCIL', 'STADE', 'SURPRISE',
  'SYMPHONIE', 'TABLE', 'TABLEAU', 'TABLIER', 'TALENT', 'TAPIS', 'TARTE', 'TAUREAU',
  'TAXI', 'TÉLÉPHONE', 'TÉLESCOPE', 'TENNIS', 'TERRASSE', 'TERRIER', 'THÉ', 'THÉÂTRE',
  'THERMOMÈTRE', 'THON', 'TIROIR', 'TOIT', 'TOMATE', 'TOUNDRA', 'TOUPIE', 'TRAHISON',
  'TRAMWAY', 'TRÊVE', 'TROTTOIR', 'USINE', 'VACHE', 'VAISSEAU', 'VALLÉE', 'VASE',
  'VEINE', 'VÉLO', 'VELOURS', 'VENTRE', 'VERGER', 'VÉRITÉ', 'VERNIS', 'VICTOIRE',
  'VIGIE', 'VIGNE', 'VIKING', 'VIOLON', 'VISAGE', 'VITESSE', 'VITRE', 'VITRINE',
  'VOILE', 'VOIX', 'VOLEUR', 'VOLUME', 'WAGON', 'YAOURT', 'ZINC',
];

const rooms = {};

// ─── Sessions : sessionId → { roomId, playerId, playerName, team, role } ───
// Permet la reconnexion après rechargement de page
const sessions = {};

// Durée avant suppression d'un joueur déconnecté (5 min)
const DISCONNECT_TIMEOUT = 5 * 60 * 1000;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBoard() {
  const words = shuffle(WORDS).slice(0, 25);
  const startingTeam = Math.random() < 0.5 ? 'red' : 'blue';
  const types = [];
  const first = startingTeam === 'red' ? 9 : 8;
  const second = startingTeam === 'red' ? 8 : 9;
  for (let i = 0; i < first; i++) types.push('red');
  for (let i = 0; i < second; i++) types.push('blue');
  for (let i = 0; i < 7; i++) types.push('neutral');
  types.push('assassin');
  const shuffledTypes = shuffle(types);
  return {
    cards: words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false })),
    startingTeam,
  };
}

function createRoom(roomId) {
  const { cards, startingTeam } = generateBoard();
  return {
    id: roomId,
    cards,
    startingTeam,
    currentTeam: startingTeam,
    phase: 'lobby',
    players: {},       // playerId → { id, name, team, role, socket, disconnectTimer, online }
    clue: null,
    clueCount: 0,
    guessesUsed: 0,
    guessesMax: 0,
    isUnlimited: false,
    selectedCard: -1,
    redScore: 0,
    blueScore: 0,
    redTotal: startingTeam === 'red' ? 9 : 8,
    blueTotal: startingTeam === 'red' ? 8 : 9,
    winner: null,
    winReason: null,      // 'words' | 'assassin'
    loser: null,          // équipe qui a touché l'assassin
    lastReveal: null,     // { index, type, byTeam, playerName } → feedback client
    log: [],
  };
}

// Libellés de rôles (affichage uniquement)
const ROLE_LABEL = { spymaster: '🎯 Indiceur', operative: '🔍 Devineur' };
const TEAM_LABEL = { red: 'ROUGE', blue: 'BLEUE' };

// Vérifie que la composition des équipes permet de lancer une partie.
// Retourne null si tout est bon, sinon le message d'erreur.
function validateTeams(room) {
  const players = Object.values(room.players);
  const byTeam = {
    red: players.filter(p => p.team === 'red'),
    blue: players.filter(p => p.team === 'blue'),
  };

  if (byTeam.red.length === 0 || byTeam.blue.length === 0) {
    return 'Chaque équipe doit avoir au moins 1 joueur.';
  }

  // En mode classique (2+ par équipe), il faut un indiceur et un devineur
  for (const team of ['red', 'blue']) {
    if (byTeam[team].length > 1) {
      const hasSpy = byTeam[team].some(p => p.role === 'spymaster');
      const hasOp = byTeam[team].some(p => p.role === 'operative');
      if (!hasSpy || !hasOp) {
        const name = team === 'red' ? 'Rouge' : 'Bleue';
        return `L'équipe ${name} a besoin d'un Indiceur et d'un Devineur (ou 1 seul joueur en mode solo).`;
      }
    }
  }
  return null;
}

// Remet le plateau à neuf. `keepTeams` conserve équipes et rôles.
function resetGame(room, keepTeams) {
  const { cards, startingTeam } = generateBoard();
  room.cards = cards;
  room.startingTeam = startingTeam;
  room.currentTeam = startingTeam;
  room.clue = null;
  room.clueCount = 0;
  room.guessesUsed = 0;
  room.guessesMax = 0;
  room.isUnlimited = false;
  room.selectedCard = -1;
  room.redScore = 0;
  room.blueScore = 0;
  room.redTotal = startingTeam === 'red' ? 9 : 8;
  room.blueTotal = startingTeam === 'red' ? 8 : 9;
  room.winner = null;
  room.winReason = null;
  room.loser = null;
  room.lastReveal = null;
  room.log = [];

  if (!keepTeams) {
    for (const p of Object.values(room.players)) {
      p.team = null;
      p.role = null;
    }
  }
}

function isPlayerSolo(room, player) {
  if (!player || !player.team) return false;
  const teammates = Object.values(room.players).filter(p => p.team === player.team);
  return teammates.length === 1;
}

function canPlayerGiveClue(room, player) {
  if (!player || player.team !== room.currentTeam) return false;
  if (player.role === 'spymaster') return true;
  if (isPlayerSolo(room, player)) return true;
  return false;
}

function canPlayerGuess(room, player) {
  if (!player || player.team !== room.currentTeam) return false;
  if (player.role === 'operative') return true;
  if (isPlayerSolo(room, player)) return true;
  return false;
}

function canPlayerSeeBoard(room, player) {
  if (!player) return false;
  if (player.spectator) return true;   // le spectateur voit toutes les couleurs
  if (player.role === 'spymaster') return true;
  if (isPlayerSolo(room, player)) return true;
  return false;
}

function getRoomState(room, playerId) {
  const player = room.players[playerId];
  // Fin de partie : la grille complète est dévoilée à tout le monde
  const seeAll = room.phase === 'gameover'
    || (canPlayerSeeBoard(room, player) && room.phase !== 'lobby');

  return {
    id: room.id,
    cards: room.cards.map(c => ({
      word: c.word,
      type: c.revealed || seeAll ? c.type : 'hidden',
      revealed: c.revealed,
    })),
    currentTeam: room.currentTeam,
    phase: room.phase,
    players: Object.values(room.players).map(p => ({
      id: p.id,
      name: p.name,
      team: p.team,
      role: p.role,
      online: p.online,
      spectator: !!p.spectator,
    })),
    clue: room.clue,
    clueCount: room.clueCount,
    guessesUsed: room.guessesUsed,
    guessesMax: room.guessesMax,
    isUnlimited: room.isUnlimited,
    selectedCard: room.selectedCard,
    redScore: room.redScore,
    blueScore: room.blueScore,
    redTotal: room.redTotal,
    blueTotal: room.blueTotal,
    startingTeam: room.startingTeam,
    winner: room.winner,
    winReason: room.winReason,
    loser: room.loser,
    lastReveal: room.lastReveal,
    log: room.log,
    you: player ? { id: player.id, name: player.name, team: player.team, role: player.role, solo: isPlayerSolo(room, player), spectator: !!player.spectator } : null,
  };
}

function broadcastRoom(room) {
  for (const pid of Object.keys(room.players)) {
    const p = room.players[pid];
    if (p.socket && p.online) {
      p.socket.emit('gameState', getRoomState(room, pid));
    }
  }
}

function addLog(room, msg) {
  room.log.push(msg);
  if (room.log.length > 60) room.log.shift();
}

function checkWin(room) {
  for (const team of ['red', 'blue']) {
    if (room[`${team}Score`] >= room[`${team}Total`]) {
      room.phase = 'gameover';
      room.winner = team;
      room.winReason = 'words';
      room.loser = team === 'red' ? 'blue' : 'red';
      addLog(room, `🏆 L'équipe ${TEAM_LABEL[team]} a trouvé tous ses mots !`);
      return true;
    }
  }
  return false;
}

function endTurn(room) {
  room.currentTeam = room.currentTeam === 'red' ? 'blue' : 'red';
  room.phase = 'clue';
  room.clue = null;
  room.clueCount = 0;
  room.guessesUsed = 0;
  room.guessesMax = 0;
  room.isUnlimited = false;
  room.selectedCard = -1;
  addLog(room, `───── Tour de l'équipe ${TEAM_LABEL[room.currentTeam]} ─────`);
}

function cleanupRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const hasOnline = Object.values(room.players).some(p => p.online);
  if (!hasOnline && Object.values(room.players).every(p => !p.disconnectTimer)) {
    delete rooms[roomId];
  }
}

// ─── Socket.IO ───
io.on('connection', (socket) => {
  let currentRoom = null;
  let playerId = null;

  // ── Rejoindre une salle (nouveau joueur ou reconnexion) ──
  socket.on('joinRoom', (data) => {
    if (!data || typeof data.roomId !== 'string' || !data.roomId.trim()) return;
    const roomId = data.roomId.toUpperCase().trim().substring(0, 10);
    const playerName = (typeof data.playerName === 'string' && data.playerName.trim() ? data.playerName : 'Joueur').trim().substring(0, 20);
    const sessionId = typeof data.sessionId === 'string' ? data.sessionId : null;

    if (!rooms[roomId]) {
      rooms[roomId] = createRoom(roomId);
    }
    const room = rooms[roomId];

    // Vérifier si c'est une reconnexion via sessionId
    let reconnected = false;
    if (sessionId && sessions[sessionId]) {
      const sess = sessions[sessionId];
      if (sess.roomId === roomId && room.players[sess.playerId]) {
        // Reconnexion !
        playerId = sess.playerId;
        const player = room.players[playerId];
        if (player.disconnectTimer) {
          clearTimeout(player.disconnectTimer);
          player.disconnectTimer = null;
        }
        // Le client re-join à CHAQUE reconnexion socket (mise en veille du
        // téléphone, etc.) : on ne logue que les vraies reconnexions pour
        // ne pas spammer l'historique.
        const wasOffline = !player.online;
        player.socket = socket;
        player.online = true;
        currentRoom = roomId;
        socket.join(roomId);
        if (wasOffline) addLog(room, `🔄 ${player.name} s'est reconnecté.`);
        socket.emit('session', { sessionId });
        broadcastRoom(room);
        reconnected = true;
      }
    }

    if (!reconnected) {
      // Nouveau joueur
      const newSessionId = crypto.randomUUID();
      playerId = newSessionId; // use session as player id for stability
      currentRoom = roomId;

      const spectator = !!data.spectator;

      room.players[playerId] = {
        id: playerId,
        name: playerName,
        team: null,
        role: null,
        spectator,
        socket,
        online: true,
        disconnectTimer: null,
      };

      sessions[newSessionId] = {
        roomId,
        playerId,
        playerName,
        spectator,
      };

      socket.join(roomId);
      socket.emit('session', { sessionId: newSessionId });
      addLog(room, spectator ? `👁️ ${playerName} regarde en spectateur.` : `👤 ${playerName} a rejoint la salle.`);
      broadcastRoom(room);
    }
  });

  // ── Un spectateur décide de jouer : il rejoint les non-assignés ──
  socket.on('joinAsPlayer', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const player = room.players[playerId];
    if (!player || !player.spectator) return;

    player.spectator = false;
    for (const sess of Object.values(sessions)) {
      if (sess.playerId === playerId) { sess.spectator = false; break; }
    }
    addLog(room, `👤 ${player.name} passe de spectateur à joueur.`);
    broadcastRoom(room);
  });

  socket.on('chooseTeam', ({ team, role } = {}) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const player = room.players[playerId];
    if (!player) return;
    if (player.spectator) {
      socket.emit('error', 'Tu es en mode spectateur. Clique sur « Devenir joueur » pour rejoindre une équipe.');
      return;
    }
    if (room.phase !== 'lobby') return;
    if (!['red', 'blue'].includes(team)) return;
    if (!['spymaster', 'operative'].includes(role)) return;

    if (role === 'spymaster') {
      const existing = Object.values(room.players).find(
        p => p.team === team && p.role === 'spymaster' && p.id !== playerId
      );
      if (existing) {
        socket.emit('error', `Il y a déjà un Indiceur ${team === 'red' ? 'rouge' : 'bleu'}.`);
        return;
      }
    }

    player.team = team;
    player.role = role;

    // Update session
    for (const [sid, sess] of Object.entries(sessions)) {
      if (sess.playerId === playerId) {
        sess.team = team;
        sess.role = role;
        break;
      }
    }

    addLog(room, `👤 ${player.name} → ${TEAM_LABEL[team]} ${ROLE_LABEL[role]}`);
    broadcastRoom(room);
  });

  socket.on('startGame', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.phase !== 'lobby') return;

    const err = validateTeams(room);
    if (err) { socket.emit('error', err); return; }

    room.phase = 'clue';
    addLog(room, `🎮 Partie lancée !`);
    addLog(room, `───── Tour de l'équipe ${TEAM_LABEL[room.currentTeam]} ─────`);
    broadcastRoom(room);
  });

  socket.on('giveClue', ({ word, count } = {}) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.phase !== 'clue') return;

    const player = room.players[playerId];
    if (!player || !canPlayerGiveClue(room, player)) return;

    word = String(word || '').trim().toUpperCase().substring(0, 30);
    const isInfinity = count === '∞' || count === 'infinity' || count === '*';
    const numCount = isInfinity ? 0 : parseInt(count);

    if (!word) { socket.emit('error', 'Donne un mot indice !'); return; }
    if (word.includes(' ')) { socket.emit('error', '⚠️ Un seul mot ! Les espaces ne sont pas autorisés.'); return; }
    if (!isInfinity && (isNaN(numCount) || numCount < 0 || numCount > 9)) {
      socket.emit('error', 'Nombre invalide (0-9 ou ∞).'); return;
    }

    const unlimited = isInfinity || numCount === 0;
    room.clue = word;
    room.clueCount = isInfinity ? '∞' : numCount;
    room.guessesUsed = 0;
    room.isUnlimited = unlimited;
    // EXACTEMENT le nombre donné par l'indiceur (pas +1)
    room.guessesMax = unlimited ? 25 : numCount;
    room.selectedCard = -1;
    room.phase = 'guess';

    addLog(room, `🎯 ${player.name} : « ${word} » → ${room.clueCount}`);
    broadcastRoom(room);
  });

  socket.on('selectCard', ({ index } = {}) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.phase !== 'guess') return;

    const player = room.players[playerId];
    if (!player || !canPlayerGuess(room, player)) return;
    index = Number(index);
    if (!Number.isInteger(index) || index < 0 || index >= 25) return;
    if (room.cards[index].revealed) return;

    room.selectedCard = index;
    broadcastRoom(room);
  });

  socket.on('confirmGuess', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.phase !== 'guess') return;

    const player = room.players[playerId];
    if (!player || !canPlayerGuess(room, player)) return;
    if (room.selectedCard < 0 || room.selectedCard >= 25) {
      socket.emit('error', 'Sélectionne d\'abord une carte !'); return;
    }

    const index = room.selectedCard;
    const card = room.cards[index];
    if (card.revealed) return;

    const guessingTeam = room.currentTeam;

    card.revealed = true;
    room.selectedCard = -1;
    // Sert au client pour l'animation, le son et la surbrillance
    room.lastReveal = { index, type: card.type, byTeam: guessingTeam, playerName: player.name };

    const typeLabel = card.type === 'red' ? '🟥 ROUGE' :
                      card.type === 'blue' ? '🟦 BLEU' :
                      card.type === 'assassin' ? '💀 ASSASSIN' : '⬜ NEUTRE';

    addLog(room, `🔍 ${player.name} : « ${card.word} » → ${typeLabel}`);

    if (card.type === 'red') room.redScore++;
    if (card.type === 'blue') room.blueScore++;

    // ASSASSIN → perte immédiate
    if (card.type === 'assassin') {
      room.phase = 'gameover';
      room.winner = guessingTeam === 'red' ? 'blue' : 'red';
      room.winReason = 'assassin';
      room.loser = guessingTeam;
      addLog(room, `💀 ASSASSIN ! L'équipe ${TEAM_LABEL[guessingTeam]} perd immédiatement.`);
      broadcastRoom(room);
      return;
    }

    if (checkWin(room)) { broadcastRoom(room); return; }

    // Bonne réponse
    if (card.type === guessingTeam) {
      room.guessesUsed++;
      if (!room.isUnlimited && room.guessesUsed >= room.guessesMax) {
        addLog(room, `⏰ ${room.guessesMax} essai(s) utilisés. Fin du tour.`);
        endTurn(room);
      } else {
        const remaining = room.isUnlimited ? '∞' : (room.guessesMax - room.guessesUsed);
        addLog(room, `✅ Correct ! Encore ${remaining} essai(s).`);
      }
    }
    // Carte adversaire
    else if (card.type === 'red' || card.type === 'blue') {
      addLog(room, `❌ Mot ${card.type === 'red' ? 'ROUGE' : 'BLEU'} ! Fin du tour.`);
      endTurn(room);
    }
    // Neutre
    else {
      addLog(room, `⬜ Neutre. Fin du tour.`);
      endTurn(room);
    }

    broadcastRoom(room);
  });

  socket.on('endGuessing', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.phase !== 'guess') return;

    const player = room.players[playerId];
    if (!player || !canPlayerGuess(room, player)) return;

    addLog(room, `⏭️ ${player.name} passe. Fin du tour.`);
    endTurn(room);
    broadcastRoom(room);
  });

  socket.on('leaveRoom', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const player = room.players[playerId];
    // Même garde anti-zombie : un vieil onglet ne doit pas éjecter le joueur actif
    if (player && player.socket === socket) {
      if (player.disconnectTimer) {
        clearTimeout(player.disconnectTimer);
        player.disconnectTimer = null;
      }
      addLog(room, `👤 ${player.name} a quitté la salle.`);
      delete room.players[playerId];
      // Nettoyer la session
      for (const [sid, sess] of Object.entries(sessions)) {
        if (sess.playerId === playerId) {
          delete sessions[sid];
          break;
        }
      }
      broadcastRoom(room);
      cleanupRoom(currentRoom);
    }
    socket.leave(currentRoom);
    currentRoom = null;
    playerId = null;
    // Dire au client de revenir à l'écran de connexion
    socket.emit('leftRoom');
  });

  // Rejouer en conservant les équipes : relance directement si la composition
  // est toujours valide, sinon retombe sur le salon.
  socket.on('newGame', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];

    resetGame(room, true);
    const err = validateTeams(room);

    if (err) {
      room.phase = 'lobby';
      addLog(room, '🔄 Nouvelle partie — choisissez vos équipes.');
    } else {
      room.phase = 'clue';
      addLog(room, '🔄 Nouvelle partie — mêmes équipes !');
      addLog(room, `───── Tour de l'équipe ${TEAM_LABEL[room.currentTeam]} ─────`);
    }
    broadcastRoom(room);
  });

  // Nouvelle partie en repartant de zéro : tout le monde revient au salon
  socket.on('backToLobby', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];

    resetGame(room, false);
    room.phase = 'lobby';
    addLog(room, '🔄 Retour au salon — choisissez vos équipes.');
    broadcastRoom(room);
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];
      const player = room.players[playerId];
      /* Garde anti-zombie : quand un joueur se reconnecte, son NOUVEAU socket
         remplace player.socket. L'ANCIEN socket finit par émettre son
         `disconnect` (timeout réseau ~30 s plus tard) — sans cette garde, il
         marquait le joueur hors-ligne et écrasait le socket actif : le joueur
         pourtant présent ne recevait plus rien. */
      if (player && player.socket === socket) {
        player.online = false;
        player.socket = null;
        addLog(room, `⚠️ ${player.name} s'est déconnecté (reconnexion possible).`);
        broadcastRoom(room);

        // Timer : supprimer après 5 min si pas reconnecté
        player.disconnectTimer = setTimeout(() => {
          if (room.players[playerId] && !room.players[playerId].online) {
            addLog(room, `👤 ${player.name} a quitté définitivement.`);
            delete room.players[playerId];
            broadcastRoom(room);
            cleanupRoom(currentRoom);
          }
          // Nettoyer la session
          for (const [sid, sess] of Object.entries(sessions)) {
            if (sess.playerId === playerId) {
              delete sessions[sid];
              break;
            }
          }
        }, DISCONNECT_TIMEOUT);
      }
    }
  });
});

// Dernier filet : un bug dans un handler ne doit pas tuer le process
// (toutes les salles sont en mémoire — un crash = toutes les parties perdues).
process.on('uncaughtException', (err) => {
  console.error('⚠️ Exception non gérée :', err);
});
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Rejet non géré :', err);
});

const PORT = process.env.PORT || 2228;
server.listen(PORT, () => {
  console.log(`🎮 MemoryGuess server running on http://localhost:${PORT}`);
});
