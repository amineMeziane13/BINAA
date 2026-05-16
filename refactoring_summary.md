# Binaa - Refactoring Complet de l'Application Mobile

## Résumé des modifications

### 🏗️ Architecture Refactorée

L'application est maintenant **adaptée à chaque rôle** (Client, Fournisseur, Artisan, Admin) avec des interfaces et fonctionnalités dédiées.

---

### 📱 Écrans créés / réécrits

| Écran | Fichier | Rôle | Fonctionnalités |
|-------|---------|------|----------------|
| **Accueil** | `HomeScreen.tsx` | Tous | Interface adaptée au rôle avec badge |
| **Profil** | `ProfileScreen.tsx` | Tous | Badge du type, déconnexion, suppression de compte |
| **Commandes** | `OrderScreen.tsx` | Tous | Liste + détails + payer/compléter/annuler + évaluer |
| **Mes offres** | `MyOffersScreen.tsx` | Fournisseur | Lister/gérer produits, services, équipements |
| **Ajouter offre** | `AddOfferScreen.tsx` | Fournisseur | Créer matériel/service/équipement avec prix et tags |
| **Profil artisan** | `ArtisanProfileScreen.tsx` | Artisan | Gérer profession, compétences, abonnement |
| **Marché produits** | `MarketProductsScreen.tsx` | Client | Parcourir offres avec filtres par type |
| **Marché artisans** | `MarketArtisansScreen.tsx` | Client | Voir artisans disponibles avec compétences |
| **Wizard projet** | `CreateProjectModal.tsx` | Client | Assistant multi-étapes de création de projet |
| **Admin** | `AdminDashboardScreen.tsx` | Admin | Stats, gestion utilisateurs, commandes |

---

### ✅ Fonctionnalités implémentées

1. **Badge de rôle** sur l'accueil et le profil (Client/Fournisseur/Artisan)
2. **Suppression de compte** via `DELETE /api/users/me`
3. **Marché** : 4 boutons (Produits, Artisans, Équipements, Calculatrice) uniquement pour les Clients
4. **Détails commande** : modal avec montants, statut, participants, actions
5. **Fournisseur** : Ajouter matériel/service/équipement avec prix, stock, tags
6. **Artisan** : Créer profil avec métier, compétences, s'abonner
7. **Clients intéressés** : Visible dans l'onglet Commandes pour fournisseurs/artisans
8. **Création de projet guidée** : Wizard multi-étapes avec type, métier, budget, localisation
9. **Évaluation** : Étoiles pour évaluer le prestataire après projet terminé
10. **Interface adaptée** : Chaque rôle ne voit que ses parties
11. **Admin complet** : Stats (CA, commandes, utilisateurs), gestion avec suppression, affectation

---

### 🗺️ Navigation

```
RootNavigator
├── AuthStack (non connecté)
│   ├── LoginScreen
│   └── RegisterScreen
├── AdminStack (ADMIN)
│   └── AdminDashboardScreen (3 onglets: Stats/Users/Orders)
└── MainTabs (CLIENT/FOURNISSEUR/ARTISAN)
    ├── [Tab] Accueil → HomeScreen
    ├── [Tab] Commandes → OrderScreen
    ├── [Tab] Mon Profil → ProfileScreen
    └── [Stack screens]
        ├── MyOffers (Fournisseur)
        ├── AddOffer (Fournisseur)
        ├── ArtisanProfile (Artisan)
        ├── MarketProducts (Client)
        ├── MarketArtisans (Client)
        └── MarketEquipment (Client)
```

---

### 🔗 Endpoints Backend utilisés (D:\Binaa)

| Endpoint | Usage |
|----------|-------|
| `POST /api/auth/register` | Inscription |
| `POST /api/auth/login` | Connexion |
| `GET /api/commandes` | Liste des commandes |
| `POST /api/commandes` | Créer commande (projet) |
| `PATCH /api/commandes/:id/status` | Payer/Compléter/Annuler |
| `GET /api/products` | Liste des offres |
| `POST /api/products` | Créer une offre (Fournisseur) |
| `GET /api/artisans` | Liste des artisans |
| `GET /api/artisans/profile/me` | Mon profil artisan |
| `POST /api/artisans/profile` | Créer profil artisan |
| `PUT /api/artisans/profile` | Mettre à jour profil |
| `POST /api/artisans/subscribe` | S'abonner |
| `DELETE /api/users/me` | Supprimer son compte |
| `GET /api/admin/users` | Liste utilisateurs (Admin) |
| `DELETE /api/admin/users/:id` | Supprimer utilisateur (Admin) |
| `PATCH /api/admin/commandes/:id/assign` | Affecter commande (Admin) |
| `GET /api/admin/settings` | Paramètres plateforme (Admin) |
| `PUT /api/admin/settings/:key` | Modifier paramètre (Admin) |
